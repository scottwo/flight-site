import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DB_PATH =
  process.env.LOGTEN_DB_PATH ||
  "/Users/scottwo/Library/Group Containers/group.com.coradine.LogTenPro/LogTenProData_68b23a9019f85fb21d503517/LogTenCoreDataStore.sql";

const OUT_DIR = path.join(process.cwd(), "public", "data");
fs.mkdirSync(OUT_DIR, { recursive: true });

// IMPORTANT: if LogTen is open, SQLite may be mid-write (WAL mode).
// Best practice: close LogTen before running OR export from a snapshot.
// Easiest: close LogTen during export.
const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });

/**
 * LogTen stores dates as seconds since Jan 1, 2001 (NSDate reference date).
 * Add 978307200 to convert to Unix epoch seconds.  [oai_citation:1‡James Harding](https://jameshard.ing/posts/querying-logten-pilot-logbook-sql)
 */
const EPOCH_OFFSET = 978307200;

const flights = db.prepare(`
  WITH logbook AS (
    SELECT
      date(ZFLIGHT_FLIGHTDATE + ${EPOCH_OFFSET}, 'unixepoch')              AS flt_date,
      DEP.ZPLACE_ICAOID                                                   AS frm,
      ARR.ZPLACE_ICAOID                                                   AS to_,
      DEP.ZPLACE_LAT                                                     AS frm_lat,
      DEP.ZPLACE_LON                                                     AS frm_lon,
      ARR.ZPLACE_LAT                                                     AS to_lat,
      ARR.ZPLACE_LON                                                     AS to_lon,
      AC.ZAIRCRAFT_AIRCRAFTID                                             AS ac_reg,
      ACT.ZAIRCRAFTTYPE_TYPE                                              AS ac_type,

      ZFLIGHT_TOTALTIME                                                  AS total_time_minutes,
      ifnull(round(ZFLIGHT_TOTALTIME * 10 / 60.0, 0) / 10, 0)             AS total_time,
      ifnull(round(ZFLIGHT_PIC * 10 / 60.0, 0) / 10, 0)                   AS pic_time,
      ifnull(round(ZFLIGHT_DUALRECEIVED * 10 / 60.0, 0) / 10, 0)          AS dual_time,
      ifnull(round(ZFLIGHT_NIGHT * 10 / 60.0, 0) / 10, 0)                 AS night_time,
      ifnull(ZFLIGHT_TOTALLANDINGS, 0)                                    AS landings,
      ifnull(ZFLIGHT_NIGHTLANDINGS, 0)                                    AS night_landings
    FROM ZFLIGHT AS F
      LEFT JOIN ZPLACE AS DEP ON F.ZFLIGHT_FROMPLACE = DEP.Z_PK
      LEFT JOIN ZPLACE AS ARR ON F.ZFLIGHT_TOPLACE = ARR.Z_PK
      LEFT JOIN ZAIRCRAFT AS AC ON F.ZFLIGHT_AIRCRAFT = AC.Z_PK
      LEFT JOIN ZAIRCRAFTTYPE AS ACT ON AC.ZAIRCRAFT_AIRCRAFTTYPE = ACT.Z_PK
    WHERE flt_date <= date('now')
  )
  SELECT
    flt_date, frm, to_, frm_lat, frm_lon, to_lat, to_lon,
    ac_type, total_time, pic_time, dual_time, night_time, landings, night_landings
  FROM logbook
  WHERE frm IS NOT NULL AND to_ IS NOT NULL
  ORDER BY flt_date;
`).all();

// 2) Aggregate totals
const sum = (arr, key) => arr.reduce((a, r) => a + (Number(r[key]) || 0), 0);

const totals = {
  total: +sum(flights, "total_time").toFixed(1),
  pic: +sum(flights, "pic_time").toFixed(1),
  dual: +sum(flights, "dual_time").toFixed(1),
  night: +sum(flights, "night_time").toFixed(1),
  landings: flights.reduce((a, r) => a + (r.landings || 0), 0),
  nightLandings: flights.reduce((a, r) => a + (r.night_landings || 0), 0),
};

const today = new Date();
const cutoff90 = new Date(today);
cutoff90.setDate(cutoff90.getDate() - 90);

const last90 = flights.filter((f) => new Date(f.flt_date) >= cutoff90);
const last90Totals = {
  total: +sum(last90, "total_time").toFixed(1),
  landings: last90.reduce((a, r) => a + (r.landings || 0), 0),
};

// 3) Monthly totals (for a bar chart)
const monthlyMap = new Map();
for (const f of flights) {
  const month = String(f.flt_date).slice(0, 7); // YYYY-MM
  monthlyMap.set(month, (monthlyMap.get(month) || 0) + (Number(f.total_time) || 0));
}
const monthly = [...monthlyMap.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([month, total]) => ({ month, total: +total.toFixed(1) }));

// 4) Route lines (optional map)
const routes = flights
  .filter((f) => f.frm_lat && f.frm_lon && f.to_lat && f.to_lon)
  .map((f) => ({
    date: f.flt_date,
    from: f.frm,
    to: f.to_,
    fromLat: f.frm_lat,
    fromLon: f.frm_lon,
    toLat: f.to_lat,
    toLon: f.to_lon,
  }));

const stats = {
  generatedAt: new Date().toISOString(),
  totals,
  last90: last90Totals,
  monthly,
};

fs.writeFileSync(path.join(OUT_DIR, "stats.json"), JSON.stringify(stats, null, 2));
fs.writeFileSync(path.join(OUT_DIR, "routes.json"), JSON.stringify(routes, null, 2));

console.log("✅ Wrote public/data/stats.json and public/data/routes.json");