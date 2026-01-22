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

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of records) {
    const rawCode = (row.gps_code || row.ident || row.iata_code || row.local_code || "").trim();
    if (!rawCode) {
      skipped += 1;
      continue;
    }
    const icao = rawCode.toUpperCase();
    const name = (row.name || "").trim() || null;
    const lat = Number.parseFloat(row.latitude_deg);
    const lon = Number.parseFloat(row.longitude_deg);
    const hasLat = Number.isFinite(lat);
    const hasLon = Number.isFinite(lon);
    if (!hasLat || !hasLon) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.airport.findUnique({
      where: { icao },
      select: { id: true, name: true, lat: true, lon: true },
    });

    if (!existing) {
      await prisma.airport.create({
        data: {
          icao,
          name,
          lat: hasLat ? lat : null,
          lon: hasLon ? lon : null,
        },
      });
      inserted += 1;
      continue;
    }

    const updateData = {};
    if (name && name !== existing.name) {
      updateData.name = name;
    }
    if (hasLat && (existing.lat === null || existing.lat === undefined)) {
      updateData.lat = lat;
    }
    if (hasLon && (existing.lon === null || existing.lon === undefined)) {
      updateData.lon = lon;
    }

    if (Object.keys(updateData).length === 0) {
      skipped += 1;
      continue;
    }

    await prisma.airport.update({
      where: { icao },
      data: updateData,
    });
    updated += 1;
  }

  console.log(
    `Seeding complete. Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}, Total processed: ${records.length}`,
  );
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
