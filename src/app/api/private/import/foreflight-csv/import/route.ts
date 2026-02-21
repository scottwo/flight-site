import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const parseFloatSafe = (value?: string | null) => {
  if (!value) return null;
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
};

const parseIntSafe = (value?: string | null) => {
  if (!value) return null;
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return null;
  const n = Number.parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : null;
};

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const d = new Date(`${trimmed}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
};

// ForeFlight route strings may include both ICAO and FAA identifiers.
// We normalize both forms for route-leg reconstruction and missing-code reporting.
function isNonNull<T>(v: T | null | undefined): v is T {
  return v !== null && v !== undefined;
}

const ICAO_RE = /\b[A-Z]{4}\b/g;
const FAA_LID_RE = /\b[A-Z]{1,2}\d{1,3}\b/g;

function extractAirportCodes(text: string | null | undefined): string[] {
  if (!text) return [];
  const upper = text.toUpperCase();
  const hits: string[] = [];
  for (const m of upper.matchAll(ICAO_RE)) hits.push(m[0]);
  for (const m of upper.matchAll(FAA_LID_RE)) hits.push(m[0]);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const h of hits) {
    if (!seen.has(h)) {
      seen.add(h);
      out.push(h);
    }
  }
  return out;
}

function buildLegsForFlight(
  f: { fromIcao: string; toIcao: string; route: string | null; remarks: string | null },
  knownAirportCodes?: Set<string>,
  missing?: Set<string>,
): Array<{ fromIcao: string; toIcao: string }> {
  const from = (f.fromIcao || "").toUpperCase();
  const to = (f.toIcao || "").toUpperCase();
  const viaCandidatesRaw = extractAirportCodes(f.route);
  const viaCandidatesFallback = extractAirportCodes(f.remarks);
  const viaCandidates = viaCandidatesRaw.length ? viaCandidatesRaw : viaCandidatesFallback;

  const filterKnown = (code: string) => {
    if (!knownAirportCodes) return true;
    const ok = knownAirportCodes.has(code);
    if (!ok && missing) missing.add(code);
    return ok;
  };

  if (knownAirportCodes) {
    if (!filterKnown(from) || !filterKnown(to)) return [];
  }

  const via = viaCandidates.filter(filterKnown).filter((c) => c !== from && c !== to);

  if (!via.length) {
    return from && to ? [{ fromIcao: from, toIcao: to }] : [];
  }

  if (from === to) {
    const seq = [from, ...via, from];
    const legs: Array<{ fromIcao: string; toIcao: string }> = [];
    for (let i = 0; i < seq.length - 1; i++) {
      if (seq[i] && seq[i + 1] && seq[i] !== seq[i + 1]) {
        legs.push({ fromIcao: seq[i], toIcao: seq[i + 1] });
      }
    }
    return legs;
  }

  const seq = [from, ...via, to];
  const legs: Array<{ fromIcao: string; toIcao: string }> = [];
  for (let i = 0; i < seq.length - 1; i++) {
    if (seq[i] && seq[i + 1] && seq[i] !== seq[i + 1]) {
      legs.push({ fromIcao: seq[i], toIcao: seq[i + 1] });
    }
  }
  return legs;
}

export async function POST(req: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const internalUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
  if (!internalUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const jobId = body?.jobId as string | undefined;

  const job = jobId
    ? await prisma.importJob.findFirst({
        where: { id: jobId, userId: internalUser.id, status: "UPLOADED", provider: "FORE_FLIGHT_CSV" },
      })
    : await prisma.importJob.findFirst({
        where: { userId: internalUser.id, status: "UPLOADED", provider: "FORE_FLIGHT_CSV" },
        orderBy: { createdAt: "desc" },
      });

  if (!job || !job.blobUrl) {
    return NextResponse.json({ error: "No upload ready to import" }, { status: 400 });
  }

  // Mark import as running before parsing to prevent duplicate workers touching one job.
  await prisma.importJob.update({
    where: { id: job.id },
    data: { status: "IMPORTING", error: null, startedAt: new Date() },
  });

  const missingAirportCodes = new Set<string>();
  let skippedRows = 0;

  try {
    const blobRes = await fetch(job.blobUrl, { cache: "no-store" });
    if (!blobRes.ok) throw new Error(`Blob fetch failed: ${blobRes.status}`);
    const text = await blobRes.text();

    // ForeFlight exports can include additional sections. We anchor on the flight
    // header row and parse from there so non-flight rows are ignored.
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const flightsHeaderIdx = lines.findIndex((l) => l.startsWith("Date,AircraftID,From,To,Route"));
    if (flightsHeaderIdx < 0) throw new Error("ForeFlight: Flights header row not found");
    const flightsCsvText = lines.slice(flightsHeaderIdx).join("\n");

    const records = parse(flightsCsvText, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      trim: true,
    }) as Record<string, string>[];

    // Normalize provider-specific columns into our canonical FlightCreateManyInput shape.
    const flightsToCreate = records
      .map((row) => {
        const flightDate = parseDate(row["Date"]);
        const fromRaw = (row["From"] ?? "").trim().toUpperCase();
        const toRaw = (row["To"] ?? "").trim().toUpperCase();

        if (!flightDate || !fromRaw || !toRaw) {
          skippedRows += 1;
          return null;
        }

        return {
          userId: internalUser.id,
          flightDate,
          fromIcao: fromRaw,
          toIcao: toRaw,
          route: (row["Route"] ?? "").trim() || null,
          remarks: (row["PilotComments"] ?? "").trim() || null,
          tailNumber: (row["AircraftID"] ?? "").trim() || null,
          totalTime: parseFloatSafe(row["TotalTime"]),
          pic: parseFloatSafe(row["PIC"]),
          sic: parseFloatSafe(row["SIC"]),
          night: parseFloatSafe(row["Night"]),
          crossCountry: parseFloatSafe(row["CrossCountry"]),
          ifr: parseFloatSafe(row["IFR"]),
          dayLandings:
            parseIntSafe(row["DayLandingsFullStop"]) ??
            parseIntSafe(row["Landing Full-Stop Day"]) ??
            0,
          nightLandings:
            parseIntSafe(row["NightLandingsFullStop"]) ??
            parseIntSafe(row["Landing Full-Stop Night"]) ??
            0,
          fromAirportId: null,
          toAirportId: null,
        } satisfies Prisma.FlightCreateManyInput;
      })
      .filter(isNonNull);

    // Airport lookup is read-only: unresolved codes become warnings instead of auto-creates.
    const endpointCodes = new Set<string>();
    const waypointCandidates = new Set<string>();
    flightsToCreate.forEach((f) => {
      if (ICAO_RE.test(f.fromIcao) || FAA_LID_RE.test(f.fromIcao)) endpointCodes.add(f.fromIcao);
      if (ICAO_RE.test(f.toIcao) || FAA_LID_RE.test(f.toIcao)) endpointCodes.add(f.toIcao);
      extractAirportCodes(f.route).forEach((c) => waypointCandidates.add(c));
      extractAirportCodes(f.remarks).forEach((c) => waypointCandidates.add(c));
    });

    const lookupList = Array.from(new Set([...endpointCodes, ...waypointCandidates]));
    const airportIdByIcao = new Map<string, string>();
    const knownAirportCodes = new Set<string>();
    if (lookupList.length) {
      const found = await prisma.airport.findMany({
        where: { icao: { in: lookupList } },
        select: { id: true, icao: true },
      });
      found.forEach((apt) => {
        airportIdByIcao.set(apt.icao, apt.id);
        knownAirportCodes.add(apt.icao);
      });
      lookupList.forEach((code) => {
        if (!knownAirportCodes.has(code)) missingAirportCodes.add(code);
      });
    }

    const flightsWithIds = flightsToCreate.map((f) => {
      if (!airportIdByIcao.has(f.fromIcao)) missingAirportCodes.add(f.fromIcao);
      if (!airportIdByIcao.has(f.toIcao)) missingAirportCodes.add(f.toIcao);
      return {
        ...f,
        fromAirportId: airportIdByIcao.get(f.fromIcao) ?? null,
        toAirportId: airportIdByIcao.get(f.toIcao) ?? null,
      };
    });

    // Current import strategy replaces user flights for deterministic aggregate rebuilds.
    await prisma.flight.deleteMany({ where: { userId: internalUser.id } });
    if (flightsWithIds.length) {
      await prisma.flight.createMany({ data: flightsWithIds });
    }

    const flights = await prisma.flight.findMany({
      where: { userId: internalUser.id },
      select: {
        flightDate: true,
        fromIcao: true,
        toIcao: true,
        totalTime: true,
        pic: true,
        sic: true,
        night: true,
        crossCountry: true,
        ifr: true,
        dayLandings: true,
        nightLandings: true,
        route: true,
        remarks: true,
      },
    });

    const now = new Date();
    const cutoff90 = new Date(now);
    cutoff90.setDate(cutoff90.getDate() - 90);

    // Recompute ProfileStats from imported rows for fast read paths.
    const totals = flights.reduce(
      (acc, f) => {
        acc.totalTime += f.totalTime ?? 0;
        acc.pic += f.pic ?? 0;
        acc.sic += f.sic ?? 0;
        acc.night += f.night ?? 0;
        acc.crossCountry += f.crossCountry ?? 0;
        acc.ifr += f.ifr ?? 0;
        acc.landingsTotal += (f.dayLandings ?? 0) + (f.nightLandings ?? 0);
        return acc;
      },
      {
        totalTime: 0,
        pic: 0,
        sic: 0,
        night: 0,
        crossCountry: 0,
        ifr: 0,
        landingsTotal: 0,
      }
    );

    const last90Flights = flights.filter((f) => f.flightDate >= cutoff90);
    const last90Totals = last90Flights.reduce(
      (acc, f) => {
        acc.totalTime += f.totalTime ?? 0;
        acc.ifr += f.ifr ?? 0;
        acc.landings += (f.dayLandings ?? 0) + (f.nightLandings ?? 0);
        return acc;
      },
      { totalTime: 0, ifr: 0, landings: 0 }
    );

    await prisma.profileStats.upsert({
      where: { userId: internalUser.id },
      update: {
        totalTime: totals.totalTime,
        pic: totals.pic,
        sic: totals.sic,
        night: totals.night,
        crossCountry: totals.crossCountry,
        ifr: totals.ifr,
        last90_total: last90Totals.totalTime,
        last90_landings: last90Totals.landings,
        last90_ifr: last90Totals.ifr,
        flightsCount: flights.length,
        landingsTotal: totals.landingsTotal,
        funFacts: Prisma.DbNull,
      },
      create: {
        userId: internalUser.id,
        totalTime: totals.totalTime,
        pic: totals.pic,
        sic: totals.sic,
        night: totals.night,
        crossCountry: totals.crossCountry,
        ifr: totals.ifr,
        last90_total: last90Totals.totalTime,
        last90_landings: last90Totals.landings,
        last90_ifr: last90Totals.ifr,
        flightsCount: flights.length,
        landingsTotal: totals.landingsTotal,
        funFacts: Prisma.DbNull,
      },
    });

    // Rebuild per-day aggregates used by heatmap/cumulative views.
    await prisma.flightDayAgg.deleteMany({ where: { userId: internalUser.id } });
    const dayMap = new Map<
      string,
      {
        day: Date;
        flightsCount: number;
        totalTime: number;
        pic: number;
        sic: number;
        night: number;
        crossCountry: number;
        ifr: number;
        landings: number;
      }
    >();
    for (const f of flights) {
      const d = new Date(Date.UTC(f.flightDate.getUTCFullYear(), f.flightDate.getUTCMonth(), f.flightDate.getUTCDate()));
      const key = d.toISOString();
      const cur = dayMap.get(key) ?? {
        day: d,
        flightsCount: 0,
        totalTime: 0,
        pic: 0,
        sic: 0,
        night: 0,
        crossCountry: 0,
        ifr: 0,
        landings: 0,
      };
      cur.flightsCount += 1;
      cur.totalTime += f.totalTime ?? 0;
      cur.pic += f.pic ?? 0;
      cur.sic += f.sic ?? 0;
      cur.night += f.night ?? 0;
      cur.crossCountry += f.crossCountry ?? 0;
      cur.ifr += f.ifr ?? 0;
      cur.landings += (f.dayLandings ?? 0) + (f.nightLandings ?? 0);
      dayMap.set(key, cur);
    }
    if (dayMap.size) {
      await prisma.flightDayAgg.createMany({
        data: Array.from(dayMap.values()).map((d) => ({
          userId: internalUser.id,
          day: d.day,
          flightsCount: d.flightsCount,
          totalTime: d.totalTime,
          pic: d.pic,
          sic: d.sic,
          night: d.night,
          crossCountry: d.crossCountry,
          ifr: d.ifr,
          landings: d.landings,
        })),
        skipDuplicates: true,
      });
    }

    // Rebuild route aggregates, expanding multi-stop routes into per-leg stats.
    await prisma.routeAgg.deleteMany({ where: { userId: internalUser.id } });
    const routeMap = new Map<
      string,
      { fromIcao: string; toIcao: string; flightsCount: number; totalTime: number; lastFlownAt: Date | null }
    >();
    for (const f of flights) {
      const legs = buildLegsForFlight(
        {
          fromIcao: f.fromIcao,
          toIcao: f.toIcao,
          route: (f as any).route ?? null,
          remarks: (f as any).remarks ?? null,
        },
        knownAirportCodes,
        missingAirportCodes,
      );

      const legCount = legs.length || 1;
      const perLegTime = (f.totalTime ?? 0) / legCount;

      for (const leg of legs) {
        const key = `${leg.fromIcao}->${leg.toIcao}`;
        const cur = routeMap.get(key) ?? {
          fromIcao: leg.fromIcao,
          toIcao: leg.toIcao,
          flightsCount: 0,
          totalTime: 0,
          lastFlownAt: null,
        };
        cur.flightsCount += 1;
        cur.totalTime += perLegTime;
        cur.lastFlownAt = !cur.lastFlownAt || f.flightDate > cur.lastFlownAt ? f.flightDate : cur.lastFlownAt;
        routeMap.set(key, cur);
      }
    }
    if (routeMap.size) {
      await prisma.routeAgg.createMany({
        data: Array.from(routeMap.values()).map((r) => ({
          userId: internalUser.id,
          fromIcao: r.fromIcao,
          toIcao: r.toIcao,
          flightsCount: r.flightsCount,
          totalTime: r.totalTime,
          lastFlownAt: r.lastFlownAt,
        })),
        skipDuplicates: true,
      });
    }

    // Persist warning payload so import UI can explain skipped rows/missing airports.
    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCEEDED",
        importedCount: flightsWithIds.length,
        missingAirportCodes: Array.from(missingAirportCodes).sort(),
        warnings: {
          missingAirportCodes: Array.from(missingAirportCodes).sort(),
          missingAirportCount: missingAirportCodes.size,
          skippedRows,
          note: "ForeFlight CSV imported; airports are lookup-only from seeded DB",
        },
        error: null,
        finishedAt: new Date(),
      },
    });

    // Cleanup uploaded artifact after successful import to limit blob retention.
    if (job.blobPathname || job.blobUrl) {
      try {
        await del(job.blobPathname ?? job.blobUrl);
      } catch (err) {
        console.error("Blob delete failed", err);
      }
    }

    return NextResponse.json({ imported: flightsWithIds.length, warnings: missingAirportCodes.size });
  } catch (error) {
    const message = ((error as Error).message || "Import failed").slice(0, 500);
    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        error: message,
        finishedAt: new Date(),
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
