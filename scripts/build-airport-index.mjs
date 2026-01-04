import fs from "node:fs";
import path from "node:path";

function parseCsvLine(line) {
  // Minimal CSV parsing that handles quoted commas.
  // For production, use `csv-parse`, but this is “good enough” for airports.csv.
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; continue; }
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === "," && !inQ) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

const CSV_PATH = path.join(process.cwd(), "scripts/data/ourairports/airports.csv");
const OUT_PATH = path.join(process.cwd(), "scripts/data/airportIndex.json");

const raw = fs.readFileSync(CSV_PATH, "utf8").trim().split("\n");
const header = parseCsvLine(raw[0]);
const idx = (name) => header.indexOf(name);

// OurAirports columns we care about (per their dictionary)
const iIdent = idx("ident");
const iGps = idx("gps_code");
const iIata = idx("iata_code");
const iLat = idx("latitude_deg");
const iLon = idx("longitude_deg");

const airportIndex = {}; // key: ICAO-ish code -> { lat, lon }

for (let r = 1; r < raw.length; r++) {
  const cols = parseCsvLine(raw[r]);
  const lat = Number(cols[iLat]);
  const lon = Number(cols[iLon]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

  const ident = (cols[iIdent] || "").trim().toUpperCase();
  const gps = (cols[iGps] || "").trim().toUpperCase();
  const iata = (cols[iIata] || "").trim().toUpperCase();

  // Prefer ICAO-ish keys: gps_code is often the ICAO (e.g., KSLC), ident can be local codes too.
  for (const key of [gps, ident, iata]) {
    if (!key) continue;
    // Keep it conservative: 3–4 uppercase letters/numbers (you can tighten to exactly 4 letters if you want)
    if (!/^[A-Z0-9]{3,4}$/.test(key) && !/^K[A-Z0-9]{3}$/.test(key)) continue;
    if (!airportIndex[key]) airportIndex[key] = { lat, lon };
  }
}

fs.writeFileSync(OUT_PATH, JSON.stringify(airportIndex, null, 2));
console.log(`Wrote airport index: ${OUT_PATH} (${Object.keys(airportIndex).length} codes)`);
