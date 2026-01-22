import { prisma } from "@/lib/prisma";

export type MapAirport = { code: string; name?: string | null; lat: number; lon: number };
export type MapRoute = { from: string; to: string; count: number };

export async function getUserMapData(userId: string): Promise<{
  airports: MapAirport[];
  routes: MapRoute[];
  missingAirports: string[];
}> {
  const routesAgg = await prisma.routeAgg.findMany({
    where: { userId },
    orderBy: { flightsCount: "desc" },
    select: { fromIcao: true, toIcao: true, flightsCount: true },
  });

  const codes = new Set<string>();
  routesAgg.forEach((r) => {
    if (r.fromIcao) codes.add(r.fromIcao);
    if (r.toIcao) codes.add(r.toIcao);
  });

  const airports = await prisma.airport.findMany({
    where: { icao: { in: Array.from(codes) } },
    select: { icao: true, name: true, lat: true, lon: true },
  });

  const airportMap = new Map<string, MapAirport>();
  airports.forEach((apt) => {
    if (apt.lat === null || apt.lat === undefined || apt.lon === null || apt.lon === undefined) return;
    airportMap.set(apt.icao, { code: apt.icao, name: apt.name, lat: apt.lat, lon: apt.lon });
  });

  const missingAirports: string[] = [];
  codes.forEach((code) => {
    if (!airportMap.has(code)) {
      missingAirports.push(code);
    }
  });

  const routes: MapRoute[] = routesAgg
    .map((r) => {
      const from = airportMap.get(r.fromIcao);
      const to = airportMap.get(r.toIcao);
      if (!from || !to) return null;
      return { from: from.code, to: to.code, count: r.flightsCount };
    })
    .filter((v): v is MapRoute => v !== null);

  return {
    airports: Array.from(airportMap.values()),
    routes,
    missingAirports,
  };
}
