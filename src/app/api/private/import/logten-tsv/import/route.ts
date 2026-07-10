import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { NextResponse } from "next/server";

import {
  buildAirportRouteLegs,
  tokenizeAirportRoute,
  type ResolvedAirport,
} from "@/lib/import/routeLegs";
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
        where: {
          id: jobId,
          userId: internalUser.id,
          status: "UPLOADED",
          provider: "LOGTEN_TSV",
        },
      })
    : await prisma.importJob.findFirst({
        where: {
          userId: internalUser.id,
          status: "UPLOADED",
          provider: "LOGTEN_TSV",
        },
        orderBy: { createdAt: "desc" },
      });

  if (!job || !job.blobUrl) {
    return NextResponse.json({ error: "No upload ready to import" }, { status: 400 });
  }

  // Move job to IMPORTING as early as possible to avoid duplicate concurrent runs.
  await prisma.importJob.update({
    where: { id: job.id },
    data: { status: "IMPORTING", error: null, startedAt: new Date() },
  });

  try {
    const tsvRes = await fetch(job.blobUrl, { cache: "no-store" });
    if (!tsvRes.ok) throw new Error(`Blob fetch failed: ${tsvRes.status}`);
    const text = await tsvRes.text();

    // Find the actual flight header rather than assuming the first non-empty
    // line is the header. LogTen may include other report content around it.
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const headerIndex = lines.findIndex((line) => {
      const headers = new Set(line.split("\t").map((header) => header.trim()));
      return (
        headers.has("flight_flightDate") &&
        headers.has("flight_from") &&
        headers.has("flight_to")
      );
    });
    if (headerIndex < 0) throw new Error("LogTen flight header row not found");

    const records = parse(lines.slice(headerIndex).join("\n"), {
      delimiter: "\t",
      columns: (headers) => headers.map((header) => header.trim()),
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      bom: true,
      trim: true,
    }) as Record<string, string>[];

    let skippedRows = 0;
    const flightRecords = records.filter((record) =>
      /^\d{4}-\d{2}-\d{2}$/.test(record.flight_flightDate ?? ""),
    );

    const get = (record: Record<string, string>, name: string) => record[name] ?? "";
    const flightsToCreate: Prisma.FlightCreateManyInput[] = flightRecords
      .map((record): Prisma.FlightCreateManyInput | null => {
        const flightDate = parseDate(get(record, "flight_flightDate"));
        const fromIcaoRaw = get(record, "flight_from").trim();
        const toIcaoRaw = get(record, "flight_to").trim();
        const fromIcao = fromIcaoRaw.toUpperCase();
        const toIcao = toIcaoRaw.toUpperCase();

        if (!flightDate || !fromIcao || !toIcao) {
          skippedRows += 1;
          return null;
        }

        return {
          userId: internalUser.id,
          importJobId: job.id,
          provider: "LOGTEN_TSV",
          flightDate,
          totalTime: parseFloatSafe(get(record, "flight_totalTime")),
          pic: parseFloatSafe(get(record, "flight_pic")),
          sic: parseFloatSafe(get(record, "flight_sic")),
          night: parseFloatSafe(get(record, "flight_night")),
          crossCountry: parseFloatSafe(get(record, "flight_crossCountry")),
          ifr: parseFloatSafe(get(record, "flight_ifr")),
          dayLandings: parseIntSafe(get(record, "flight_dayLandings")) ?? 0,
          nightLandings: parseIntSafe(get(record, "flight_nightLandings")) ?? 0,
          route: get(record, "flight_route") || null,
          remarks: get(record, "flight_remarks") || null,
          distanceNm: parseFloatSafe(get(record, "flight_distance")),
          aircraftMake: get(record, "aircraftType_make") || null,
          aircraftModel: get(record, "aircraftType_model") || null,
          aircraftType: get(record, "aircraftType_type") || null,
          tailNumber: get(record, "aircraft_aircraftID") || null,
          fromIcao,
          toIcao,
        };
      })
      .filter((v): v is Prisma.FlightCreateManyInput => v !== null);

    const missingAirportCodes = new Set<string>();
    const lookupCodes = new Set<string>();
    flightsToCreate.forEach((f) => {
      lookupCodes.add(f.fromIcao.toUpperCase());
      lookupCodes.add(f.toIcao.toUpperCase());
      tokenizeAirportRoute(f.route).forEach((code) => lookupCodes.add(code));
    });

    const codeList = Array.from(lookupCodes);
    const resolvedAirportByCode = new Map<string, ResolvedAirport>();
    if (codeList.length) {
      const airports = await prisma.airport.findMany({
        where: {
          icao: { in: codeList },
          lat: { not: null },
          lon: { not: null },
        },
        select: { id: true, icao: true, lat: true, lon: true },
      });
      airports.forEach((airport) => {
        resolvedAirportByCode.set(airport.icao.toUpperCase(), {
          code: airport.icao.toUpperCase(),
          airportId: airport.id,
          lat: airport.lat!,
          lon: airport.lon!,
        });
      });

      const aliases = await prisma.airportAlias.findMany({
        where: { code: { in: codeList } },
        select: {
          code: true,
          airport: { select: { id: true, icao: true, lat: true, lon: true } },
        },
      });
      aliases.forEach(({ code, airport }) => {
        if (airport.lat === null || airport.lon === null) return;
        const resolved = {
          code: airport.icao.toUpperCase(),
          airportId: airport.id,
          lat: airport.lat,
          lon: airport.lon,
        } satisfies ResolvedAirport;
        resolvedAirportByCode.set(code.toUpperCase(), resolved);
        resolvedAirportByCode.set(resolved.code, resolved);
      });
    }

    const resolveAirport = (code: string) => resolvedAirportByCode.get(code.trim().toUpperCase());
    const flightsWithIds = flightsToCreate.map((f) => {
      const fromAirport = resolveAirport(f.fromIcao);
      const toAirport = resolveAirport(f.toIcao);
      if (!fromAirport) missingAirportCodes.add(f.fromIcao.toUpperCase());
      if (!toAirport) missingAirportCodes.add(f.toIcao.toUpperCase());
      return {
        ...f,
        fromIcao: fromAirport?.code ?? f.fromIcao.toUpperCase(),
        toIcao: toAirport?.code ?? f.toIcao.toUpperCase(),
        fromAirportId: fromAirport?.airportId ?? null,
        toAirportId: toAirport?.airportId ?? null,
      };
    });

    let routeDistanceMismatchCount = 0;
    await prisma.$transaction(async (tx) => {
      // Imports replace the active logbook, but the replacement and all derived
      // aggregates now commit atomically so a failure preserves the prior data.
      await tx.flight.deleteMany({ where: { userId: internalUser.id } });
      if (flightsWithIds.length) {
        await tx.flight.createMany({ data: flightsWithIds });
      }

      const flights = await tx.flight.findMany({
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
          distanceNm: true,
        },
      });

      console.log("logten import summary", {
        imported: flights.length,
        skippedRows,
        routesProvided: flights.filter((flight) => flight.route).length,
      });

      const now = new Date();
      const cutoff90 = new Date(now);
      cutoff90.setDate(cutoff90.getDate() - 90);

    // ProfileStats are persisted denormalized totals for fast public page loads.
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

    await tx.profileStats.upsert({
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

    // Rebuild day aggregates (heatmap + cumulative chart source).
    await tx.flightDayAgg.deleteMany({ where: { userId: internalUser.id } });
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
      await tx.flightDayAgg.createMany({
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

    // Rebuild route aggregates from endpoints and the dedicated LogTen route
    // field only. Remarks remain displayable notes and are never mined.
    await tx.routeAgg.deleteMany({ where: { userId: internalUser.id } });
    const routeMap = new Map<
      string,
      { fromIcao: string; toIcao: string; flightsCount: number; totalTime: number; lastFlownAt: Date | null }
    >();
    for (const f of flights) {
      const routeResult = buildAirportRouteLegs({
        fromCode: f.fromIcao,
        toCode: f.toIcao,
        route: f.route,
        loggedDistanceNm: f.distanceNm,
        resolveAirport,
      });
      routeResult.unresolvedCodes.forEach((code) => missingAirportCodes.add(code));
      if (routeResult.distanceMismatch) routeDistanceMismatchCount += 1;
      const legs = routeResult.legs;

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
      await tx.routeAgg.createMany({
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

    // Persist import outcomes and warning payload for dashboard troubleshooting.
    const warningPayload = {
      ...(missingAirportCodes.size > 0
        ? {
            missingAirportCodes: Array.from(missingAirportCodes).sort(),
            missingCount: missingAirportCodes.size,
          }
        : {}),
      ...(routeDistanceMismatchCount > 0 ? { routeDistanceMismatchCount } : {}),
      ...(skippedRows > 0 ? { skippedRows } : {}),
    };
    await tx.importJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCEEDED",
        importedCount: flightsToCreate.length,
        missingAirportCodes: Array.from(missingAirportCodes).sort(),
        warnings:
          Object.keys(warningPayload).length > 0 ? warningPayload : Prisma.DbNull,
        error: null,
        finishedAt: new Date(),
      },
    });
    }, { timeout: 60_000 });

    // Cleanup uploaded artifact after successful import to reduce blob storage growth.
    if (job.blobPathname || job.blobUrl) {
      try {
        await del(job.blobPathname ?? job.blobUrl);
      } catch (err) {
        console.error("Blob delete failed", err);
      }
    }

    return NextResponse.json({ imported: flightsToCreate.length });
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
