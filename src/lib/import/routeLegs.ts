export type ResolvedAirport = {
  code: string;
  airportId: string;
  lat: number;
  lon: number;
};

export type RouteLeg = {
  fromIcao: string;
  toIcao: string;
};

export type RouteBuildResult = {
  legs: RouteLeg[];
  unresolvedCodes: string[];
  distanceMismatch: boolean;
  calculatedDistanceNm: number | null;
};

export function tokenizeAirportRoute(route: string | null | undefined): string[] {
  if (!route) return [];

  return route
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);
}

function haversineNm(a: ResolvedAirport, b: ResolvedAirport): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6_371_000;
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLon = toRadians(b.lon - a.lon);
  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  const meters = earthRadiusMeters * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return meters / 1852;
}

function directLeg(from: ResolvedAirport, to: ResolvedAirport): RouteLeg[] {
  return from.code === to.code ? [] : [{ fromIcao: from.code, toIcao: to.code }];
}

export function buildAirportRouteLegs(input: {
  fromCode: string;
  toCode: string;
  route: string | null | undefined;
  loggedDistanceNm?: number | null;
  resolveAirport: (code: string) => ResolvedAirport | undefined;
}): RouteBuildResult {
  const fromCode = input.fromCode.trim().toUpperCase();
  const toCode = input.toCode.trim().toUpperCase();
  const from = input.resolveAirport(fromCode);
  const to = input.resolveAirport(toCode);
  const unresolvedCodes: string[] = [];

  if (!from) unresolvedCodes.push(fromCode);
  if (!to && toCode !== fromCode) unresolvedCodes.push(toCode);
  if (!from || !to) {
    return {
      legs: [],
      unresolvedCodes,
      distanceMismatch: false,
      calculatedDistanceNm: null,
    };
  }

  const routeTokens = tokenizeAirportRoute(input.route);
  if (!routeTokens.length) {
    return {
      legs: directLeg(from, to),
      unresolvedCodes,
      distanceMismatch: false,
      calculatedDistanceNm: null,
    };
  }

  const routeAirports: ResolvedAirport[] = [];
  for (const token of routeTokens) {
    const airport = input.resolveAirport(token);
    if (!airport) {
      if (!unresolvedCodes.includes(token)) unresolvedCodes.push(token);
      continue;
    }
    routeAirports.push(airport);
  }

  // A partially resolved route is more dangerous than a direct fallback because
  // connecting the remaining airports can invent legs that were never flown.
  if (unresolvedCodes.length) {
    return {
      legs: directLeg(from, to),
      unresolvedCodes,
      distanceMismatch: false,
      calculatedDistanceNm: null,
    };
  }

  let sequence = routeAirports;
  if (sequence[0]?.code !== from.code) sequence = [from, ...sequence];
  if (sequence.at(-1)?.code !== to.code) sequence = [...sequence, to];

  // Preserve loops and repeated visits; only adjacent duplicates cannot form a leg.
  sequence = sequence.filter((airport, index) => index === 0 || airport.code !== sequence[index - 1].code);

  const legs: RouteLeg[] = [];
  let calculatedDistanceNm = 0;
  for (let index = 0; index < sequence.length - 1; index += 1) {
    const legFrom = sequence[index];
    const legTo = sequence[index + 1];
    if (legFrom.code === legTo.code) continue;
    legs.push({ fromIcao: legFrom.code, toIcao: legTo.code });
    calculatedDistanceNm += haversineNm(legFrom, legTo);
  }

  const loggedDistanceNm = input.loggedDistanceNm ?? null;
  const distanceToleranceNm =
    loggedDistanceNm && loggedDistanceNm > 0 ? Math.max(5, loggedDistanceNm * 0.05) : null;
  const distanceMismatch =
    distanceToleranceNm !== null && Math.abs(calculatedDistanceNm - loggedDistanceNm!) > distanceToleranceNm;

  return {
    legs: distanceMismatch ? directLeg(from, to) : legs,
    unresolvedCodes,
    distanceMismatch,
    calculatedDistanceNm,
  };
}
