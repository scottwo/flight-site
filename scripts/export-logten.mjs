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
      ifnull(ZFLIGHT_DAYLANDINGS, 0)                                   AS day_landings,
      ifnull(ZFLIGHT_DAYTAKEOFFS, 0)                                   AS day_takeoffs,
      ifnull(ZFLIGHT_NIGHTLANDINGS, 0)                                 AS night_landings,
      ifnull(ZFLIGHT_NIGHTTAKEOFFS, 0)                                 AS night_takeoffs,
      ifnull(round(ZFLIGHT_CROSSCOUNTRY * 10 / 60.0, 0) / 10, 0)        AS xc_time,
      ifnull(round(ZFLIGHT_CROSSCOUNTRYNIGHT * 10 / 60.0, 0) / 10, 0)   AS xc_night_time,
      ifnull(round(ZFLIGHT_TOTALINSTRUMENT * 10 / 60.0, 0) / 10, 0)     AS inst_time,
      ifnull(round(ZFLIGHT_SIMULATEDINSTRUMENT * 10 / 60.0, 0) / 10, 0) AS inst_sim_time,
      ifnull(round(ZFLIGHT_ACTUALINSTRUMENT * 10 / 60.0, 0) / 10, 0)    AS inst_actual_time,
      ifnull(ZFLIGHT_HOLDS, 0)                                           AS holds,
      (
        (case when ifnull(AP.ZFLIGHTAPPROACHES_APPROACH1, 0)  <> 0 then 1 else 0 end) +
        (case when ifnull(AP.ZFLIGHTAPPROACHES_APPROACH2, 0)  <> 0 then 1 else 0 end) +
        (case when ifnull(AP.ZFLIGHTAPPROACHES_APPROACH3, 0)  <> 0 then 1 else 0 end) +
        (case when ifnull(AP.ZFLIGHTAPPROACHES_APPROACH4, 0)  <> 0 then 1 else 0 end) +
        (case when ifnull(AP.ZFLIGHTAPPROACHES_APPROACH5, 0)  <> 0 then 1 else 0 end) +
        (case when ifnull(AP.ZFLIGHTAPPROACHES_APPROACH6, 0)  <> 0 then 1 else 0 end) +
        (case when ifnull(AP.ZFLIGHTAPPROACHES_APPROACH7, 0)  <> 0 then 1 else 0 end) +
        (case when ifnull(AP.ZFLIGHTAPPROACHES_APPROACH8, 0)  <> 0 then 1 else 0 end) +
        (case when ifnull(AP.ZFLIGHTAPPROACHES_APPROACH9, 0)  <> 0 then 1 else 0 end) +
        (case when ifnull(AP.ZFLIGHTAPPROACHES_APPROACH10, 0) <> 0 then 1 else 0 end)
      ) AS approaches
    FROM ZFLIGHT AS F
      LEFT JOIN ZPLACE AS DEP ON F.ZFLIGHT_FROMPLACE = DEP.Z_PK
      LEFT JOIN ZPLACE AS ARR ON F.ZFLIGHT_TOPLACE = ARR.Z_PK
      LEFT JOIN ZAIRCRAFT AS AC ON F.ZFLIGHT_AIRCRAFT = AC.Z_PK
      LEFT JOIN ZAIRCRAFTTYPE AS ACT ON AC.ZAIRCRAFT_AIRCRAFTTYPE = ACT.Z_PK
      LEFT JOIN ZFLIGHTAPPROACHES AS AP ON F.ZFLIGHT_FLIGHTAPPROACHES = AP.Z_PK
    WHERE flt_date <= date('now')
  )
  SELECT
    flt_date, frm, to_, frm_lat, frm_lon, to_lat, to_lon,
    ac_type, total_time, pic_time, dual_time, night_time, landings, day_landings,
    night_landings, day_takeoffs, night_takeoffs, xc_time, xc_night_time, inst_time,
    inst_sim_time, inst_actual_time, approaches, holds
  FROM logbook
  WHERE frm IS NOT NULL AND to_ IS NOT NULL
  ORDER BY flt_date;
`).all();

// 2) Aggregate totals
const sum = (arr, key) => arr.reduce((a, r) => a + (Number(r[key]) || 0), 0);
// --- Heatmap (daily totals) ---
const dayMap = new Map();
// Shape: { date -> { date, hours, flights } }
for (const f of flights) {
  const d = f.flt_date; // 'YYYY-MM-DD'
  const cur = dayMap.get(d) || { date: d, hours: 0, flights: 0 };
  cur.hours += Number(f.total_time) || 0;
  cur.flights += 1;
  dayMap.set(d, cur);
}
const heatmap = [...dayMap.values()]
  .sort((a, b) => a.date.localeCompare(b.date))
  .map((d) => ({ ...d, hours: +d.hours.toFixed(1) }));

// --- Date windows ---
const today = new Date();
const cutoff90 = new Date(today);
cutoff90.setDate(cutoff90.getDate() - 90);

const last90Flights = flights.filter((f) => new Date(f.flt_date) >= cutoff90);

const totals = {
  total: +sum(flights, "total_time").toFixed(1),
  pic: +sum(flights, "pic_time").toFixed(1),
  dual: +sum(flights, "dual_time").toFixed(1),
  night: +sum(flights, "night_time").toFixed(1),
  xc: +sum(flights, "xc_time").toFixed(1),
  xcNight: +sum(flights, "xc_night_time").toFixed(1),
  instrument: +sum(flights, "inst_time").toFixed(1),
  instrumentSim: +sum(flights, "inst_sim_time").toFixed(1),
  instrumentActual: +sum(flights, "inst_actual_time").toFixed(1),
  landings: flights.reduce((a, r) => a + (r.landings || 0), 0),
  dayLandings: flights.reduce((a, r) => a + (r.day_landings || 0), 0),
  nightLandings: flights.reduce((a, r) => a + (r.night_landings || 0), 0),
  approaches: flights.reduce((a, r) => a + (r.approaches || 0), 0),
  holds: flights.reduce((a, r) => a + (r.holds || 0), 0),
};

const last90Totals = {
  total: +sum(last90Flights, "total_time").toFixed(1),
  pic: +sum(last90Flights, "pic_time").toFixed(1),
  dual: +sum(last90Flights, "dual_time").toFixed(1),
  night: +sum(last90Flights, "night_time").toFixed(1),
  xc: +sum(last90Flights, "xc_time").toFixed(1),
  xcNight: +sum(last90Flights, "xc_night_time").toFixed(1),
  instrument: +sum(last90Flights, "inst_time").toFixed(1),
  instrumentSim: +sum(last90Flights, "inst_sim_time").toFixed(1),
  instrumentActual: +sum(last90Flights, "inst_actual_time").toFixed(1),
  landings: last90Flights.reduce((a, r) => a + (r.landings || 0), 0),
  dayLandings: last90Flights.reduce((a, r) => a + (r.day_landings || 0), 0),
  nightLandings: last90Flights.reduce((a, r) => a + (r.night_landings || 0), 0),
  approaches: last90Flights.reduce((a, r) => a + (r.approaches || 0), 0),
  holds: last90Flights.reduce((a, r) => a + (r.holds || 0), 0),
};

// FAA-style "preceding 6 calendar months" window:
// Start = first day of current month, End = first day of current month (exclusive),
// then subtract 6 months for start.
const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const startOfSixCalendarMonthsAgo = new Date(
  startOfThisMonth.getFullYear(),
  startOfThisMonth.getMonth() - 6,
  1
);

const last6CalMoFlights = flights.filter((f) => {
  const d = new Date(f.flt_date);
  return d >= startOfSixCalendarMonthsAgo && d < startOfThisMonth;
});

// --- Currency metrics ---
const day90 = {
  takeoffs: last90Flights.reduce((a, r) => a + (r.day_takeoffs || 0), 0),
  landings: last90Flights.reduce((a, r) => a + (r.day_landings || 0), 0),
};

const night90 = {
  takeoffs: last90Flights.reduce((a, r) => a + (r.night_takeoffs || 0), 0),
  landings: last90Flights.reduce((a, r) => a + (r.night_landings || 0), 0),
};

// Note: instrument currency requires 6 approaches + holding + intercept/tracking.
// LogTen has approaches + holds, but not a clean "intercept/tracking" count.
// We'll report the tracked pieces and compute a conservative "meetsTrackedItems" boolean.
const ifr6 = {
  approaches: last6CalMoFlights.reduce((a, r) => a + (r.approaches || 0), 0),
  holds: last6CalMoFlights.reduce((a, r) => a + (r.holds || 0), 0),
  instrument: +sum(last6CalMoFlights, "inst_time").toFixed(1),
  instrumentSim: +sum(last6CalMoFlights, "inst_sim_time").toFixed(1),
  instrumentActual: +sum(last6CalMoFlights, "inst_actual_time").toFixed(1),
};

const currency = {
  windows: {
    dayNight90dStart: cutoff90.toISOString().slice(0, 10),
    dayNight90dEnd: today.toISOString().slice(0, 10),
    ifr6CalMoStart: startOfSixCalendarMonthsAgo.toISOString().slice(0, 10),
    ifr6CalMoEndExclusive: startOfThisMonth.toISOString().slice(0, 10),
  },
  day: {
    ...day90,
    meetsPassengerCarry: Math.min(day90.takeoffs, day90.landings) >= 3,
    requirement: "≥3 takeoffs & landings in last 90 days",
  },
  night: {
    ...night90,
    meetsPassengerCarry: Math.min(night90.takeoffs, night90.landings) >= 3,
    requirement: "≥3 night takeoffs & landings in last 90 days (full-stop requirement not verified here)",
  },
  ifr: {
    ...ifr6,
    meetsTrackedItems: ifr6.approaches >= 6 && ifr6.holds >= 1,
    requirement:
      "Instrument currency: ≥6 approaches + holding + intercept/track within preceding 6 calendar months (intercept/track not tracked in LogTen fields here)",
  },
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
  currency,
};

fs.writeFileSync(path.join(OUT_DIR, "stats.json"), JSON.stringify(stats, null, 2));
fs.writeFileSync(path.join(OUT_DIR, "routes.json"), JSON.stringify(routes, null, 2));
fs.writeFileSync(path.join(OUT_DIR, "heatmap.json"), JSON.stringify(heatmap, null, 2));

console.log("✅ Wrote public/data/stats.json and public/data/routes.json");