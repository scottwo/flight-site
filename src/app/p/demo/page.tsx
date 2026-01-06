import fs from "node:fs/promises";
import path from "node:path";

import { PilotProfilePage } from "@/app/pilot/page";
import type { RouteLeg } from "@/lib/routes";

type Flight = {
  flt_date: string;
  frm: string;
  to_: string;
  frm_lat: number;
  frm_lon: number;
  to_lat: number;
  to_lon: number;
  total_time: number;
  pic_time: number;
  sic_time?: number;
  dual_time: number;
  night_time: number;
  xc_time: number;
  xc_night_time: number;
  inst_time: number;
  inst_sim_time: number;
  inst_actual_time: number;
  approaches: number;
  holds: number;
  landings: number;
  day_landings: number;
  night_landings: number;
  day_takeoffs: number;
  night_takeoffs: number;
};

const demoDir = path.join(process.cwd(), "public", "demo-data");

const sum = (arr: Flight[], key: keyof Flight) =>
  arr.reduce((a, r) => a + (Number(r[key]) || 0), 0);

const toDateUtc = (dateStr: string) => new Date(`${dateStr}T00:00:00Z`);

function aggregate(flights: Flight[]) {
  // Heatmap
  const dayMap = new Map<
    string,
    {
      date: string;
      hours: number;
      flights: number;
    }
  >();
  flights.forEach((f) => {
    const cur = dayMap.get(f.flt_date) || { date: f.flt_date, hours: 0, flights: 0 };
    cur.hours += Number(f.total_time) || 0;
    cur.flights += 1;
    dayMap.set(f.flt_date, cur);
  });
  const heatmap = [...dayMap.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ ...d, hours: +d.hours.toFixed(1) }));

  // Monthly totals
  const monthlyMap = new Map<string, number>();
  flights.forEach((f) => {
    const month = f.flt_date.slice(0, 7);
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + (Number(f.total_time) || 0));
  });
  const monthly = [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total: +total.toFixed(1) }));

  // Routes (undirected)
  const routeMap = new Map<string, RouteLeg>();
  flights.forEach((f) => {
    const from = { icao: f.frm, lat: f.frm_lat, lon: f.frm_lon };
    const to = { icao: f.to_, lat: f.to_lat, lon: f.to_lon };
    if (!from.icao || !to.icao || from.icao === to.icao) return;
    const pair = [from, to].sort((a, b) => a.icao.localeCompare(b.icao));
    const key = `${pair[0].icao}-${pair[1].icao}`;
    const existing = routeMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      routeMap.set(key, {
        from: pair[0],
        to: pair[1],
        count: 1,
        month: f.flt_date.slice(0, 7),
      });
    }
  });
  const routes = [...routeMap.values()];

  // Totals
  const totals = {
    total: +sum(flights, "total_time").toFixed(1),
    pic: +sum(flights, "pic_time").toFixed(1),
    sic: +sum(flights, "sic_time").toFixed(1),
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

  // Currency windows
  const today = new Date();
  const cutoff90 = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 90));
  const startOfThisMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const startOfSixCalendarMonthsAgo = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 6, 1),
  );

  const last90Flights = flights.filter((f) => toDateUtc(f.flt_date) >= cutoff90);
  const last6CalMoFlights = flights.filter((f) => {
    const d = toDateUtc(f.flt_date);
    return d >= startOfSixCalendarMonthsAgo && d < startOfThisMonth;
  });

  const last90Totals = {
    total: +sum(last90Flights, "total_time").toFixed(1),
    pic: +sum(last90Flights, "pic_time").toFixed(1),
    sic: +sum(last90Flights, "sic_time").toFixed(1),
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

  const currency = {
    windows: {
      dayNight90dStart: cutoff90.toISOString().slice(0, 10),
      dayNight90dEnd: today.toISOString().slice(0, 10),
      ifr6CalMoStart: startOfSixCalendarMonthsAgo.toISOString().slice(0, 10),
      ifr6CalMoEndExclusive: startOfThisMonth.toISOString().slice(0, 10),
    },
    day: {
      takeoffs: last90Flights.reduce((a, r) => a + (r.day_takeoffs || 0), 0),
      landings: last90Flights.reduce((a, r) => a + (r.day_landings || 0), 0),
      meetsPassengerCarry:
        Math.min(
          last90Flights.reduce((a, r) => a + (r.day_takeoffs || 0), 0),
          last90Flights.reduce((a, r) => a + (r.day_landings || 0), 0),
        ) >= 3,
      requirement: "≥3 takeoffs & landings in last 90 days",
    },
    night: {
      takeoffs: last90Flights.reduce((a, r) => a + (r.night_takeoffs || 0), 0),
      landings: last90Flights.reduce((a, r) => a + (r.night_landings || 0), 0),
      meetsPassengerCarry:
        Math.min(
          last90Flights.reduce((a, r) => a + (r.night_takeoffs || 0), 0),
          last90Flights.reduce((a, r) => a + (r.night_landings || 0), 0),
        ) >= 3,
      requirement: "≥3 night takeoffs & landings in last 90 days (full-stop requirement not verified here)",
    },
    ifr: {
      approaches: last6CalMoFlights.reduce((a, r) => a + (r.approaches || 0), 0),
      holds: last6CalMoFlights.reduce((a, r) => a + (r.holds || 0), 0),
      instrument: +sum(last6CalMoFlights, "inst_time").toFixed(1),
      instrumentSim: +sum(last6CalMoFlights, "inst_sim_time").toFixed(1),
      instrumentActual: +sum(last6CalMoFlights, "inst_actual_time").toFixed(1),
      meetsTrackedItems:
        last6CalMoFlights.reduce((a, r) => a + (r.approaches || 0), 0) >= 6 &&
        last6CalMoFlights.reduce((a, r) => a + (r.holds || 0), 0) >= 1,
      requirement:
        "Instrument currency: ≥6 approaches + holding + intercept/track within preceding 6 calendar months (intercept/track not tracked in demo)",
    },
  };

  // Fun facts (simple)
  const funFacts = [];
  const formatHours = (hrs: number) => `${Number(hrs || 0).toFixed(1)} hrs`;
  const formatNm = (nm: number) => `${Math.round(nm)} nm`;
  const deg = (lat: number) => `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}`;

  const longest = flights.reduce((best, f) => {
    if (!f.total_time) return best;
    if (!best || f.total_time > best.total_time) return f;
    return best;
  }, null as Flight | null);
  if (longest) {
    funFacts.push({
      id: "longest_flight_time",
      label: "Longest flight",
      value: formatHours(longest.total_time),
      detail: `${longest.frm} → ${longest.to_}`,
      score: 6,
    });
  }

  const distanceLeg = routes.reduce(
    (best, r) => {
      const toRad = (v: number) => (v * Math.PI) / 180;
      const R = 6371e3;
      const phi1 = toRad(r.from.lat);
      const phi2 = toRad(r.to.lat);
      const dPhi = toRad(r.to.lat - r.from.lat);
      const dLambda = toRad(r.to.lon - r.from.lon);
      const a =
        Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const meters = R * c;
      const nm = meters / 1852;
      if (!best || nm > best.dist) return { dist: nm, route: r };
      return best;
    },
    null as { dist: number; route: RouteLeg } | null,
  );
  if (distanceLeg) {
    funFacts.push({
      id: "furthest_leg",
      label: "Furthest leg",
      value: formatNm(distanceLeg.dist),
      detail: `${distanceLeg.route.from.icao} → ${distanceLeg.route.to.icao}`,
      score: 9,
    });
  }

  const biggestDay = heatmap.reduce(
    (best, d) => (!best || d.hours > best.hours ? d : best),
    null as (typeof heatmap)[number] | null,
  );
  if (biggestDay) {
    funFacts.push({
      id: "biggest_day_hours",
      label: "Longest day",
      value: formatHours(biggestDay.hours),
      detail: biggestDay.date,
      score: 8,
    });
  }

  const busiestDay = heatmap.reduce(
    (best, d) => (!best || d.flights > best.flights ? d : best),
    null as (typeof heatmap)[number] | null,
  );
  if (busiestDay) {
    funFacts.push({
      id: "busiest_day_flights",
      label: "Busiest day",
      value: `${busiestDay.flights} flights`,
      detail: busiestDay.date,
      score: 5,
    });
  }

  const topRoute = routes.reduce((best, r) => (!best || r.count > best.count ? r : best), null as RouteLeg | null);
  if (topRoute) {
    funFacts.push({
      id: "most_frequent_route",
      label: "Most frequent route",
      value: `${topRoute.count} legs`,
      detail: `${topRoute.from.icao} → ${topRoute.to.icao}`,
      score: 9,
    });
  }

  const visitedAirports = new Set<string>();
  flights.forEach((f) => {
    if (f.frm) visitedAirports.add(f.frm);
    if (f.to_) visitedAirports.add(f.to_);
  });
  routes.forEach((r) => {
    visitedAirports.add(r.from.icao);
    visitedAirports.add(r.to.icao);
  });

  const latLookup = new Map<string, number>();
  flights.forEach((f) => {
    latLookup.set(f.frm, f.frm_lat);
    latLookup.set(f.to_, f.to_lat);
  });

  let mostNorth: { icao: string; lat: number } | null = null;
  let mostSouth: { icao: string; lat: number } | null = null;
  visitedAirports.forEach((icao) => {
    const lat = latLookup.get(icao);
    if (lat === undefined || lat === null) return;
    if (!mostNorth || lat > mostNorth.lat) mostNorth = { icao, lat };
    if (!mostSouth || lat < mostSouth.lat) mostSouth = { icao, lat };
  });
  if (mostNorth) {
    funFacts.push({
      id: "most_northern",
      label: "Farthest north",
      value: deg(mostNorth.lat),
      detail: mostNorth.icao,
      score: 6,
    });
  }
  if (mostSouth) {
    funFacts.push({
      id: "most_southern",
      label: "Farthest south",
      value: deg(mostSouth.lat),
      detail: mostSouth.icao,
      score: 6,
    });
  }

  const streakDates = heatmap.filter((d) => d.flights > 0).map((d) => d.date);
  const streak = (() => {
    if (!streakDates.length) return { len: 0, start: null as string | null, end: null as string | null };
    const sorted = [...streakDates].sort();
    let best = { len: 1, start: sorted[0], end: sorted[0] };
    let curLen = 1;
    let curStart = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(`${sorted[i - 1]}T00:00:00Z`);
      const curr = new Date(`${sorted[i]}T00:00:00Z`);
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
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
  })();
  if (streak.len > 1) {
    funFacts.push({
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
    funFacts.push({
      id: "avg_flight_duration",
      label: "Average flight",
      value: formatHours(avg),
      detail: `Across ${flights.length} flights`,
      score: 5,
    });
  }

  const stats = {
    generatedAt: new Date().toISOString(),
    totals,
    last90: last90Totals,
    monthly,
    currency,
    funFacts,
  };

  return { stats, heatmap, routes };
}

export const metadata = {
  title: "Demo Pilot Profile",
};

export default async function DemoProfilePage() {
  const flightsRaw = await fs.readFile(path.join(demoDir, "flights.json"), "utf-8");
  const flights = JSON.parse(flightsRaw) as Flight[];

  const today = new Date();
  const startOfThisMonthUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1);
  // Include current month plus previous 5 full months
  const startOfSixCalMonthsAgoUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 5, 1);

  const filteredFlights = flights.filter((f) => {
    const d = toDateUtc(f.flt_date).getTime();
    return d >= startOfSixCalMonthsAgoUtc && d <= Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  });

  const { stats, heatmap, routes } = aggregate(filteredFlights);

  return (
    <>
      <div className="bg-[#dce8f7] text-[#0f2f4b]">
        <div className="mx-auto max-w-6xl px-6 py-3 text-sm font-semibold">
          Demo profile (fictional data) — Delta pilot based in Salt Lake City — showing last 6 calendar months
        </div>
      </div>
      <PilotProfilePage
        dataDir="demo-data"
        statsOverride={stats}
        heatmapOverride={heatmap}
        routesOverride={routes}
      />
    </>
  );
}
