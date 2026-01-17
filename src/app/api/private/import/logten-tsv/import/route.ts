import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Row = Record<string, string>;

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
        where: { id: jobId, userId: internalUser.id, status: "UPLOADED" },
      })
    : await prisma.importJob.findFirst({
        where: { userId: internalUser.id, status: "UPLOADED" },
        orderBy: { createdAt: "desc" },
      });

  if (!job || !job.blobUrl) {
    return NextResponse.json({ error: "No upload ready to import" }, { status: 400 });
  }

  await prisma.importJob.update({
    where: { id: job.id },
    data: { status: "IMPORTING", error: null },
  });

  try {
    const tsvRes = await fetch(job.blobUrl, { cache: "no-store" });
    if (!tsvRes.ok) throw new Error(`Blob fetch failed: ${tsvRes.status}`);
    const text = await tsvRes.text();

    const records = parse(text, {
      columns: true,
      delimiter: "\t",
      relax_quotes: true,
      relax_column_count: true,
      bom: true,
      skip_empty_lines: true,
      record_delimiter: "auto",
      trim: true,
    }) as Row[];

    const icaos = new Set<string>();

    const flightsToCreate: Prisma.FlightCreateManyInput[] = records
      .map((row): Prisma.FlightCreateManyInput | null => {
        const flightDate = parseDate(row["flight_flightDate"]);
        const fromIcao = (row["flight_from"] ?? "").trim().toUpperCase();
        const toIcao = (row["flight_to"] ?? "").trim().toUpperCase();

        if (!flightDate || !fromIcao || !toIcao) {
          return null;
        }

        icaos.add(fromIcao);
        icaos.add(toIcao);

        return {
          userId: internalUser.id,
          flightDate,
          totalTime: parseFloatSafe(row["flight_totalTime"]),
          pic: parseFloatSafe(row["flight_pic"]),
          sic: parseFloatSafe(row["flight_sic"]),
          night: parseFloatSafe(row["flight_night"]),
          crossCountry: parseFloatSafe(row["flight_crossCountry"]),
          ifr: parseFloatSafe(row["flight_ifr"]),
          dayLandings: parseIntSafe(row["flight_dayLandings"]) ?? 0,
          nightLandings: parseIntSafe(row["flight_nightLandings"]) ?? 0,
          route: row["flight_route"] || null,
          remarks: row["flight_remarks"] || null,
          aircraftMake: row["aircraftType_make"] || null,
          aircraftModel: row["aircraftType_model"] || null,
          aircraftType: row["aircraftType_type"] || null,
          tailNumber: row["aircraft_secondaryID"] || null,
          fromIcao,
          toIcao,
        };
      })
      .filter((v): v is Prisma.FlightCreateManyInput => v !== null);

    // MVP: Replace flights and ensure airports exist.
    // (We can wrap this in a transaction later once interactive tx typing is stable.)
    await prisma.flight.deleteMany({ where: { userId: internalUser.id } });

    const icaoList = Array.from(icaos);
    if (icaoList.length) {
      await prisma.airport.createMany({
        data: icaoList.map((icao) => ({ icao })),
        skipDuplicates: true,
      });
    }

    const airportMap = new Map<string, string>();
    if (icaoList.length) {
      const found = await prisma.airport.findMany({
        where: { icao: { in: icaoList } },
        select: { id: true, icao: true },
      });
      found.forEach((apt) => airportMap.set(apt.icao, apt.id));
    }

    const flightsWithIds = flightsToCreate.map((f) => ({
      ...f,
      fromAirportId: airportMap.get(f.fromIcao) ?? null,
      toAirportId: airportMap.get(f.toIcao) ?? null,
    }));

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
      },
    });

    const now = new Date();
    const cutoff90 = new Date(now);
    cutoff90.setDate(cutoff90.getDate() - 90);

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

    await prisma.routeAgg.deleteMany({ where: { userId: internalUser.id } });
    const routeMap = new Map<
      string,
      { fromIcao: string; toIcao: string; flightsCount: number; totalTime: number; lastFlownAt: Date | null }
    >();
    for (const f of flights) {
      const key = `${f.fromIcao}->${f.toIcao}`;
      const cur = routeMap.get(key) ?? {
        fromIcao: f.fromIcao,
        toIcao: f.toIcao,
        flightsCount: 0,
        totalTime: 0,
        lastFlownAt: null,
      };
      cur.flightsCount += 1;
      cur.totalTime += f.totalTime ?? 0;
      cur.lastFlownAt = !cur.lastFlownAt || f.flightDate > cur.lastFlownAt ? f.flightDate : cur.lastFlownAt;
      routeMap.set(key, cur);
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

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCEEDED",
        importedCount: flightsToCreate.length,
        error: null,
        finishedAt: new Date(),
      },
    });

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
