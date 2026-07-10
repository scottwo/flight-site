import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAirportRouteLegs,
  tokenizeAirportRoute,
  type ResolvedAirport,
} from "./routeLegs.ts";

function airport(code: string, lat: number, lon: number): ResolvedAirport {
  return { code, airportId: code, lat, lon };
}

function resolver(airports: ResolvedAirport[], aliases: Record<string, string> = {}) {
  const byCode = new Map(airports.map((value) => [value.code, value]));
  return (code: string) => byCode.get(aliases[code] ?? code);
}

const from = airport("KAAA", 0, 0);
const middle = airport("KBBB", 0, 0.5);
const to = airport("KCCC", 0, 1);
const resolveAirport = resolver([from, middle, to], { BBB: "KBBB", "42U": "KBBB" });

test("tokenizes route identifiers in source order, including digit-leading local IDs", () => {
  assert.deepEqual(tokenizeAirportRoute("KAAA-42U KCCC"), ["KAAA", "42U", "KCCC"]);
});

test("uses a direct leg when no structured route is supplied", () => {
  const result = buildAirportRouteLegs({
    fromCode: "KAAA",
    toCode: "KCCC",
    route: null,
    resolveAirport,
  });

  assert.deepEqual(result.legs, [{ fromIcao: "KAAA", toIcao: "KCCC" }]);
});

test("does not invent a route for a local flight without a route field", () => {
  const result = buildAirportRouteLegs({
    fromCode: "KAAA",
    toCode: "KAAA",
    route: null,
    resolveAirport,
  });

  assert.deepEqual(result.legs, []);
});

test("resolves aliases and preserves route ordering", () => {
  const result = buildAirportRouteLegs({
    fromCode: "KAAA",
    toCode: "KCCC",
    route: "KAAA-42U-KCCC",
    resolveAirport,
  });

  assert.deepEqual(result.legs, [
    { fromIcao: "KAAA", toIcao: "KBBB" },
    { fromIcao: "KBBB", toIcao: "KCCC" },
  ]);
});

test("preserves loops and removes only adjacent duplicates", () => {
  const result = buildAirportRouteLegs({
    fromCode: "KAAA",
    toCode: "KAAA",
    route: "KBBB-KAAA-KBBB",
    resolveAirport,
  });

  assert.deepEqual(result.legs, [
    { fromIcao: "KAAA", toIcao: "KBBB" },
    { fromIcao: "KBBB", toIcao: "KAAA" },
    { fromIcao: "KAAA", toIcao: "KBBB" },
    { fromIcao: "KBBB", toIcao: "KAAA" },
  ]);
});

test("falls back conservatively when any route token is unresolved", () => {
  const result = buildAirportRouteLegs({
    fromCode: "KAAA",
    toCode: "KCCC",
    route: "KBBB-NOTANAPT",
    resolveAirport,
  });

  assert.deepEqual(result.legs, [{ fromIcao: "KAAA", toIcao: "KCCC" }]);
  assert.deepEqual(result.unresolvedCodes, ["NOTANAPT"]);
});

test("uses LogTen distance as a guard against implausible reconstructed routes", () => {
  const farAway = airport("KFAR", 40, 40);
  const result = buildAirportRouteLegs({
    fromCode: "KAAA",
    toCode: "KCCC",
    route: "KFAR",
    loggedDistanceNm: 60,
    resolveAirport: resolver([from, farAway, to]),
  });

  assert.equal(result.distanceMismatch, true);
  assert.deepEqual(result.legs, [{ fromIcao: "KAAA", toIcao: "KCCC" }]);
});

test("accepts a reconstructed route that agrees with LogTen distance", () => {
  const result = buildAirportRouteLegs({
    fromCode: "KAAA",
    toCode: "KCCC",
    route: "BBB",
    loggedDistanceNm: 60,
    resolveAirport,
  });

  assert.equal(result.distanceMismatch, false);
  assert.equal(result.legs.length, 2);
});
