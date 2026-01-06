import fs from "node:fs";
import path from "node:path";

// Deterministic RNG (xmur3 + mulberry32)
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seed = mulberry32(xmur3("delta-slc-demo-v1")());
const rand = () => seed();
const choice = (arr) => arr[Math.floor(rand() * arr.length)];
const range = (min, max) => min + (max - min) * rand();
const round1 = (v) => Math.round(v * 10) / 10;

const OUT_DIR = path.join(process.cwd(), "public", "demo-data");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Airport catalog (fictional demo usage)
const airports = [
  ["KSLC", 40.7884, -111.977, "Salt Lake City Intl"],
  ["KATL", 33.6407, -84.4277, "Hartsfield-Jackson Atlanta"],
  ["KMSP", 44.882, -93.2218, "Minneapolis/St Paul"],
  ["KDTW", 42.2162, -83.3554, "Detroit Metro"],
  ["KJFK", 40.6413, -73.7781, "John F Kennedy"],
  ["KLGA", 40.7769, -73.874, "LaGuardia"],
  ["KEWR", 40.6895, -74.1745, "Newark Liberty"],
  ["KBOS", 42.3656, -71.0096, "Boston Logan"],
  ["KDCA", 38.8512, -77.0402, "Reagan National"],
  ["KIAD", 38.9531, -77.4565, "Dulles"],
  ["KORD", 41.9742, -87.9073, "Chicago O'Hare"],
  ["KDEN", 39.8561, -104.6737, "Denver"],
  ["KPHX", 33.4342, -112.0116, "Phoenix Sky Harbor"],
  ["KLAX", 33.9416, -118.4085, "Los Angeles"],
  ["KSFO", 37.6213, -122.379, "San Francisco"],
  ["KSEA", 47.4502, -122.3088, "Seattle Tacoma"],
  ["KPDX", 45.5898, -122.5951, "Portland"],
  ["KLAS", 36.084, -115.1537, "Las Vegas"],
  ["KSAN", 32.7338, -117.1933, "San Diego"],
  ["KDFW", 32.8998, -97.0403, "Dallas/Fort Worth"],
  ["KIAH", 29.9902, -95.3368, "Houston Intercontinental"],
  ["KMCO", 28.4312, -81.3081, "Orlando"],
  ["KFLL", 26.0726, -80.1527, "Fort Lauderdale"],
  ["KTPA", 27.9755, -82.5332, "Tampa"],
  ["KBNA", 36.1263, -86.6774, "Nashville"],
  ["KSTL", 38.7477, -90.3597, "St. Louis"],
  ["KCOS", 38.8058, -104.7005, "Colorado Springs"],
  ["KBOI", 43.5644, -116.2228, "Boise"],
  ["KSJC", 37.3639, -121.9289, "San Jose"],
  ["KSMF", 38.6954, -121.5908, "Sacramento"],
  ["KANC", 61.1743, -149.9985, "Anchorage"],
];

const airportIndex = airports.reduce((map, [icao, lat, lon, name]) => {
  map[icao] = { icao, lat, lon, name };
  return map;
}, {});

const toRad = (v) => (v * Math.PI) / 180;
const haversineNm = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // meters
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dPhi = toRad(lat2 - lat1);
  const dLambda = toRad(lon2 - lon1);
  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const meters = R * c;
  return meters / 1852; // nautical miles
};

function pickRoute() {
  const hub = airportIndex["KSLC"];
  const hubs = ["KSLC", "KATL", "KMSP", "KDTW", "KJFK", "KSEA", "KORD", "KDEN", "KDFW"];
  const nonHubAirports = airports.filter(([icao]) => icao !== "KSLC");

  const roll = rand();
  let from;
  let to;

  if (roll < 0.55) {
    // Hub-and-spoke: SLC involved
    const dest = choice(nonHubAirports);
    const originFavoursHub = rand() < 0.7;
    from = originFavoursHub ? hub : airportIndex[dest[0]];
    to = originFavoursHub ? airportIndex[dest[0]] : hub;
  } else if (roll < 0.8) {
    // Between hubs (could include SLC, but not guaranteed)
    const hubFromCode = choice(hubs);
    let hubToCode = choice(hubs);
    if (hubToCode === hubFromCode) {
      hubToCode = choice(hubs.filter((h) => h !== hubFromCode));
    }
    from = airportIndex[hubFromCode];
    to = airportIndex[hubToCode];
  } else {
    // Point-to-point non-SLC pair
    const a = airportIndex[choice(nonHubAirports)[0]];
    let b = airportIndex[choice(nonHubAirports)[0]];
    if (b.icao === a.icao) {
      b = airportIndex[choice(nonHubAirports.filter((apt) => apt[0] !== a.icao))[0]];
    }
    from = a;
    to = b;
  }

  if (from.icao === to.icao) {
    // Fallback to hub outbound
    from = hub;
    to = airportIndex[choice(nonHubAirports)[0]];
  }

  return { from, to };
}

function durationFromDistance(distNm) {
  if (distNm < 400) return round1(range(0.7, 1.4));
  if (distNm < 900) return round1(range(1.5, 2.7));
  if (distNm < 1500) return round1(range(2.8, 4.2));
  return round1(range(3.5, 5.0));
}

function generateFlights(targetFlights = 240) {
  let flights = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 210); // ~7 months back

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const dayKey = d.toISOString().slice(0, 10);
    const roll = rand();
    const count =
      roll < 0.15 ? 0 : roll < 0.55 ? 1 : roll < 0.85 ? 2 : 3; // bias to 1-2 flights/day

    for (let i = 0; i < count; i++) {
      const { from, to } = pickRoute();
      const distNm = haversineNm(from.lat, from.lon, to.lat, to.lon);
      const total_time = durationFromDistance(distNm);

      const nightFlight = rand() < 0.28;
      const night_time = nightFlight ? round1(total_time * range(0.2, 0.6)) : 0;
      const inst_time = round1(total_time * range(0.2, 0.7));
      const inst_actual_time = round1(inst_time * range(0.4, 0.8));
      const inst_sim_time = round1(Math.max(0, inst_time - inst_actual_time) * range(0.1, 0.4));
      const approaches = Math.max(1, Math.round(range(0.4, 1.6)));
      const holds = rand() < 0.15 ? 1 : 0;

      flights.push({
        flt_date: dayKey,
        frm: from.icao,
        to_: to.icao,
        frm_lat: from.lat,
        frm_lon: from.lon,
        to_lat: to.lat,
        to_lon: to.lon,
        remarks: "Demo flight",
        ac_type: rand() < 0.6 ? "A320" : "B737",
        total_time,
        pic_time: round1(total_time * 0.9),
        dual_time: 0,
        night_time,
        landings: 1,
        day_landings: nightFlight ? 0 : 1,
        night_landings: nightFlight ? 1 : 0,
        day_takeoffs: nightFlight ? 0 : 1,
        night_takeoffs: nightFlight ? 1 : 0,
        xc_time: total_time,
        xc_night_time: night_time,
        inst_time,
        inst_sim_time,
        inst_actual_time,
        approaches,
        holds,
      });
    }
  }

  // If under target, sprinkle extras on random days within range
  while (flights.length < targetFlights) {
    const { from, to } = pickRoute();
    const distNm = haversineNm(from.lat, from.lon, to.lat, to.lon);
    const total_time = durationFromDistance(distNm);
    const nightFlight = rand() < 0.28;
    const dayOffset = Math.floor(range(0, 210));
    const date = new Date(start);
    date.setDate(start.getDate() + dayOffset);
    const dayKey = date.toISOString().slice(0, 10);

    flights.push({
      flt_date: dayKey,
      frm: from.icao,
      to_: to.icao,
      frm_lat: from.lat,
      frm_lon: from.lon,
      to_lat: to.lat,
      to_lon: to.lon,
      remarks: "Demo flight",
      ac_type: rand() < 0.6 ? "A320" : "B737",
      total_time,
      pic_time: round1(total_time * 0.9),
      dual_time: 0,
      night_time: nightFlight ? round1(total_time * range(0.2, 0.6)) : 0,
      landings: 1,
      day_landings: nightFlight ? 0 : 1,
      night_landings: nightFlight ? 1 : 0,
      day_takeoffs: nightFlight ? 0 : 1,
      night_takeoffs: nightFlight ? 1 : 0,
      xc_time: total_time,
      xc_night_time: nightFlight ? round1(total_time * range(0.2, 0.6)) : 0,
      inst_time: round1(total_time * range(0.2, 0.7)),
      inst_sim_time: 0,
      inst_actual_time: 0,
      approaches: 1,
      holds: 0,
    });
  }

  flights = flights.sort((a, b) => a.flt_date.localeCompare(b.flt_date));

  // If we overshot, keep the most recent targetFlights to ensure coverage through today.
  if (flights.length > targetFlights) {
    flights = flights.slice(flights.length - targetFlights);
  }

  return flights;
}

const formatHours = (hrs) => `${Number(hrs || 0).toFixed(1)} hrs`;
const formatNm = (nm) => `${Math.round(nm)} nm`;
const deg = (lat) => `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}`;

const sum = (arr, key) => arr.reduce((a, r) => a + (Number(r[key]) || 0), 0);
const longestConsecutiveStreak = (dates) => {
  if (!dates.length) return { len: 0, start: null, end: null };
  const sorted = [...dates].sort();
  let best = { len: 1, start: sorted[0], end: sorted[0] };
  let curLen = 1;
  let curStart = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      curLen += 1;
      if (curLen > best.len) {
        best = { len: curLen, start: curStart, end: sorted[i] };
      }
    } else {
      curLen = 1;
      curStart = sorted[i];
    }
  }
  return best;
};

function aggregate(flights) {
  // Heatmap
  const dayMap = new Map();
  for (const f of flights) {
    const cur = dayMap.get(f.flt_date) || { date: f.flt_date, hours: 0, flights: 0 };
    cur.hours += Number(f.total_time) || 0;
    cur.flights += 1;
    dayMap.set(f.flt_date, cur);
  }
  const heatmap = [...dayMap.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ ...d, hours: +d.hours.toFixed(1) }));

  const today = new Date();
  const cutoff90 = new Date(today);
  cutoff90.setDate(cutoff90.getDate() - 90);
  const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfSixCalendarMonthsAgo = new Date(
    startOfThisMonth.getFullYear(),
    startOfThisMonth.getMonth() - 6,
    1
  );

  const last90Flights = flights.filter((f) => new Date(f.flt_date) >= cutoff90);
  const last6CalMoFlights = flights.filter((f) => {
    const d = new Date(f.flt_date);
    return d >= startOfSixCalendarMonthsAgo && d < startOfThisMonth;
  });

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

  // Currency
  const day90 = {
    takeoffs: last90Flights.reduce((a, r) => a + (r.day_takeoffs || 0), 0),
    landings: last90Flights.reduce((a, r) => a + (r.day_landings || 0), 0),
  };
  const night90 = {
    takeoffs: last90Flights.reduce((a, r) => a + (r.night_takeoffs || 0), 0),
    landings: last90Flights.reduce((a, r) => a + (r.night_landings || 0), 0),
  };
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
        "Instrument currency: ≥6 approaches + holding + intercept/track within preceding 6 calendar months (intercept/track not tracked in demo)",
    },
  };

  // Monthly totals
  const monthlyMap = new Map();
  for (const f of flights) {
    const month = String(f.flt_date).slice(0, 7);
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + (Number(f.total_time) || 0));
  }
  const monthly = [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total: +total.toFixed(1) }));

  // Routes (undirected for map density)
  const routeMap = new Map();
  for (const f of flights) {
    const from = airportIndex[f.frm];
    const to = airportIndex[f.to_];
    if (!from || !to || from.icao === to.icao) continue;
    const pair = [from, to].sort((a, b) => a.icao.localeCompare(b.icao));
    const key = `${pair[0].icao}-${pair[1].icao}`;
    const existing = routeMap.get(key);
    if (existing) existing.count += 1;
    else routeMap.set(key, { from: pair[0], to: pair[1], count: 1 });
  }
  const routes = [...routeMap.values()];

  // Fun facts
  const funFacts = [];
  const addFact = (fact) => {
    if (!fact || fact.value === undefined || fact.value === null) return;
    funFacts.push(fact);
  };

  if (flights.length) {
    const longest = flights.reduce((best, f) => {
      if (!f.total_time) return best;
      if (!best || f.total_time > best.total_time) return f;
      return best;
    }, null);
    if (longest && longest.total_time > 0) {
      addFact({
        id: "longest_flight_time",
        label: "Longest flight",
        value: formatHours(longest.total_time),
        detail: `${longest.frm} → ${longest.to_}`,
        score: 6,
      });
    }
  }

  const distanceLeg = routes.reduce(
    (best, r) => {
      const dist = haversineNm(r.from.lat, r.from.lon, r.to.lat, r.to.lon);
      if (!best || dist > best.dist) return { dist, route: r };
      return best;
    },
    null
  );
  if (distanceLeg && distanceLeg.dist > 0) {
    addFact({
      id: "furthest_leg",
      label: "Furthest leg",
      value: formatNm(distanceLeg.dist),
      detail: `${distanceLeg.route.from.icao} → ${distanceLeg.route.to.icao}`,
      score: 9,
    });
  }

  const biggestDay = heatmap.reduce(
    (best, d) => (!best || d.hours > best.hours ? d : best),
    null
  );
  if (biggestDay && biggestDay.hours > 0) {
    addFact({
      id: "biggest_day_hours",
      label: "Longest day",
      value: formatHours(biggestDay.hours),
      detail: biggestDay.date,
      score: 8,
    });
  }

  const busiestDay = heatmap.reduce(
    (best, d) => (!best || d.flights > best.flights ? d : best),
    null
  );
  if (busiestDay && busiestDay.flights > 0) {
    addFact({
      id: "busiest_day_flights",
      label: "Busiest day",
      value: `${busiestDay.flights} flights`,
      detail: busiestDay.date,
      score: 5,
    });
  }

  const topRoute = routes.reduce((best, r) => (!best || r.count > best.count ? r : best), null);
  if (topRoute && topRoute.count > 0) {
    addFact({
      id: "most_frequent_route",
      label: "Most frequent route",
      value: `${topRoute.count} legs`,
      detail: `${topRoute.from.icao} → ${topRoute.to.icao}`,
      score: 9,
    });
  }

  const visitedAirports = new Set();
  flights.forEach((f) => {
    if (f.frm) visitedAirports.add(f.frm);
    if (f.to_) visitedAirports.add(f.to_);
  });
  routes.forEach((r) => {
    visitedAirports.add(r.from.icao);
    visitedAirports.add(r.to.icao);
  });
  const airportCounts = {};
  flights.forEach((f) => {
    if (f.frm) airportCounts[f.frm] = (airportCounts[f.frm] || 0) + 1;
    if (f.to_) airportCounts[f.to_] = (airportCounts[f.to_] || 0) + 1;
  });
  const mostCommonAirport =
    Object.entries(airportCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  if (visitedAirports.size > 0) {
    addFact({
      id: "unique_airports",
      label: "Airports visited",
      value: `${visitedAirports.size} airports`,
      detail: mostCommonAirport
        ? `Most common: ${mostCommonAirport} (${airportCounts[mostCommonAirport]} times)`
        : undefined,
      score: 10,
    });
  }

  let mostNorth = null;
  let mostSouth = null;
  visitedAirports.forEach((icao) => {
    const apt = airportIndex[icao];
    if (apt && Number.isFinite(apt.lat)) {
      if (!mostNorth || apt.lat > mostNorth.lat) mostNorth = { icao, lat: apt.lat };
      if (!mostSouth || apt.lat < mostSouth.lat) mostSouth = { icao, lat: apt.lat };
    }
  });
  if (mostNorth) {
    addFact({
      id: "most_northern",
      label: "Farthest north",
      value: deg(mostNorth.lat),
      detail: mostNorth.icao,
      score: 6,
    });
  }
  if (mostSouth) {
    addFact({
      id: "most_southern",
      label: "Farthest south",
      value: deg(mostSouth.lat),
      detail: mostSouth.icao,
      score: 6,
    });
  }

  const streakDates = heatmap.filter((d) => d.flights > 0).map((d) => d.date);
  const streak = longestConsecutiveStreak(streakDates);
  if (streak.len > 1) {
    addFact({
      id: "longest_streak",
      label: "Longest streak",
      value: `${streak.len} days`,
      detail: `${streak.start} → ${streak.end}`,
      score: 7,
    });
  }

  if (flights.length) {
    const totalHrs = sum(flights, "total_time");
    const avg = totalHrs / flights.length;
    if (avg > 0) {
      addFact({
        id: "avg_flight_duration",
        label: "Average flight",
        value: formatHours(avg),
        detail: `Across ${flights.length} flights`,
        score: 5,
      });
    }
  }

  const stats = {
    generatedAt: new Date().toISOString(),
    totals,
    last90: last90Totals,
    monthly,
    currency,
    funFacts,
  };

  return { stats, routes, heatmap };
}

function main() {
  const flights = generateFlights(240);
  const { stats, routes, heatmap } = aggregate(flights);

  fs.writeFileSync(path.join(OUT_DIR, "flights.json"), JSON.stringify(flights, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "stats.json"), JSON.stringify(stats, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "routes.json"), JSON.stringify(routes, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "heatmap.json"), JSON.stringify(heatmap, null, 2));

  console.log(
    `✅ Demo data written to ${OUT_DIR} (flights: ${flights.length}, routes: ${routes.length}, days: ${heatmap.length})`
  );
}

main();
