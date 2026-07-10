import fs from "node:fs/promises";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { parse } from "csv-parse/sync";

function stripQuotes(v) {
  if (typeof v !== "string") return v;
  const s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

async function loadEnvFiles() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(process.cwd(), file);
    const exists = await fs
      .access(fullPath)
      .then(() => true)
      .catch(() => false);
    if (!exists) continue;
    const content = await fs.readFile(fullPath, "utf8");
    content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .forEach((line) => {
        const idx = line.indexOf("=");
        if (idx === -1) return;
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        const cleaned = stripQuotes(value);
        if (key === "DATABASE_URL" || key === "DIRECT_URL") {
          // Always prefer values from env files for DB URLs to avoid shell pollution.
          process.env[key] = cleaned;
          return;
        }
        if (!process.env[key]) {
          process.env[key] = cleaned;
        }
      });
  }
}

await loadEnvFiles();

const RAW_DB_URL = stripQuotes(process.env.DIRECT_URL || process.env.DATABASE_URL);
if (!RAW_DB_URL) {
  console.error("DIRECT_URL or DATABASE_URL is required to seed airports.");
  process.exit(1);
}

if (!RAW_DB_URL.startsWith("postgresql://") && !RAW_DB_URL.startsWith("postgres://")) {
  console.error("Invalid DB URL (expected postgres/postgresql URL). Got:", RAW_DB_URL);
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(RAW_DB_URL);
} catch (e) {
  console.error("Failed to parse DB URL:", e);
  process.exit(1);
}

console.log("Seeding airports using DB host:", parsed.hostname);

const pool = new Pool({ connectionString: RAW_DB_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const csvPath = path.join(process.cwd(), "data", "ourairports", "airports.csv");
  const exists = await fs
    .access(csvPath)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    console.error(`CSV not found at ${csvPath}. Download OurAirports airports.csv and place it there.`);
    process.exit(1);
  }

  const content = await fs.readFile(csvPath, "utf8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true,
  });

  const canonicalCodes = new Set();
  const aliasTargets = new Map();
  const airportDataByCanonical = new Map();
  let invalidRecords = 0;

  for (const row of records) {
    const canonical = (row.gps_code || row.ident || row.iata_code || row.local_code || "")
      .trim()
      .toUpperCase();
    const lat = Number.parseFloat(row.latitude_deg);
    const lon = Number.parseFloat(row.longitude_deg);
    if (!canonical || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      invalidRecords += 1;
      continue;
    }

    canonicalCodes.add(canonical);
    airportDataByCanonical.set(canonical, {
      icao: canonical,
      name: (row.name || "").trim() || null,
      lat,
      lon,
    });

    const aliases = [
      ["GPS", row.gps_code],
      ["IDENT", row.ident],
      ["IATA", row.iata_code],
      ["LOCAL", row.local_code],
    ];
    for (const [kind, value] of aliases) {
      const code = (value || "").trim().toUpperCase();
      if (!code || code === canonical) continue;
      const targets = aliasTargets.get(code) || new Map();
      if (!targets.has(canonical)) targets.set(canonical, kind);
      aliasTargets.set(code, targets);
    }
  }

  const existingAirports = await prisma.airport.findMany({
    select: { icao: true, name: true, lat: true, lon: true },
  });
  const existingByCanonical = new Map(existingAirports.map((airport) => [airport.icao.toUpperCase(), airport]));
  const airportsToCreate = [];
  const airportsToUpdate = [];
  let unchanged = 0;

  for (const airport of airportDataByCanonical.values()) {
    const existing = existingByCanonical.get(airport.icao);
    if (!existing) {
      airportsToCreate.push(airport);
      continue;
    }

    const data = {};
    if (airport.name && airport.name !== existing.name) data.name = airport.name;
    if (existing.lat === null) data.lat = airport.lat;
    if (existing.lon === null) data.lon = airport.lon;
    if (Object.keys(data).length) airportsToUpdate.push({ icao: airport.icao, data });
    else unchanged += 1;
  }

  for (let start = 0; start < airportsToCreate.length; start += 1000) {
    await prisma.airport.createMany({
      data: airportsToCreate.slice(start, start + 1000),
      skipDuplicates: true,
    });
  }

  // Updates are usually a small subset. Run them in bounded parallel batches
  // instead of one network round-trip for every airport in the source file.
  for (let start = 0; start < airportsToUpdate.length; start += 100) {
    await Promise.all(
      airportsToUpdate.slice(start, start + 100).map(({ icao, data }) =>
        prisma.airport.update({
          where: { icao },
          data,
        }),
      ),
    );
  }

  const seededAirports = await prisma.airport.findMany({ select: { id: true, icao: true } });
  const airportIdByCanonical = new Map(
    seededAirports.map((airport) => [airport.icao.toUpperCase(), airport.id]),
  );

  const aliasesToCreate = [];
  let ambiguousAliases = 0;
  for (const [code, targets] of aliasTargets) {
    // A local identifier can be reused in multiple countries. Only globally
    // unambiguous aliases are safe for automatic route reconstruction.
    if (targets.size !== 1 || canonicalCodes.has(code)) {
      ambiguousAliases += 1;
      continue;
    }
    const [[canonical, kind]] = targets.entries();
    const airportId = airportIdByCanonical.get(canonical);
    if (!airportId) continue;
    aliasesToCreate.push({ code, kind, airportId });
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.airportAlias.deleteMany();
      for (let start = 0; start < aliasesToCreate.length; start += 1000) {
        await tx.airportAlias.createMany({
          data: aliasesToCreate.slice(start, start + 1000),
          skipDuplicates: true,
        });
      }
    },
    { timeout: 120_000 },
  );

  console.log(
    `Seeding complete. Inserted: ${airportsToCreate.length}, Updated: ${airportsToUpdate.length}, Unchanged: ${unchanged}, Invalid: ${invalidRecords}, Total processed: ${records.length}`,
  );
  console.log(`Airport aliases: ${aliasesToCreate.length}; ambiguous aliases skipped: ${ambiguousAliases}`);
  const missingCoords = await prisma.airport.count({
    where: {
      OR: [{ lat: null }, { lon: null }],
    },
  });
  console.log(`Airports with missing coords after seed: ${missingCoords}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
