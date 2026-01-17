import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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
        where: { id: jobId, userId: internalUser.id },
      })
    : await prisma.importJob.findFirst({
        where: { userId: internalUser.id },
        orderBy: { createdAt: "desc" },
      });

  if (!job) {
    return NextResponse.json(
      { error: "Import job not found", jobId: jobId ?? null },
      { status: 400 }
    );
  }

  if (job.status !== "UPLOADED") {
    return NextResponse.json(
      {
        error: "Upload not ready to import",
        jobId: job.id,
        jobStatus: job.status,
        hasBlobUrl: Boolean(job.blobUrl),
      },
      { status: 400 }
    );
  }

  if (!job.blobUrl) {
    return NextResponse.json(
      {
        error: "Upload missing blobUrl",
        jobId: job.id,
        jobStatus: job.status,
        hasBlobUrl: false,
      },
      { status: 400 }
    );
  }

  await prisma.importJob.update({
    where: { id: job.id },
    data: { status: "IMPORTING", error: null },
  });

  try {
    const tsvRes = await fetch(job.blobUrl, { cache: "no-store" });
    if (!tsvRes.ok) throw new Error(`Blob fetch failed: ${tsvRes.status}`);
    const text = await tsvRes.text();

    // LogTen TSV exports are not strict TSV rows: they include interleaved metadata rows and
    // multi-line remarks. The safest MVP approach is to parse line-by-line and only keep rows
    // that begin with a flight date (YYYY-MM-DD).
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const headerLine = lines.find((l) => l.trim().length > 0);
    if (!headerLine) throw new Error("Empty TSV");

    const headers = headerLine.split("\t").map((h) => h.trim());
    const colIndex = new Map<string, number>();
    headers.forEach((h, i) => colIndex.set(h, i));

    const idx = (name: string) => colIndex.get(name) ?? -1;
    const iFlightDate = idx("flight_flightDate");
    const iFrom = idx("flight_from");
    const iTo = idx("flight_to");

    if (iFlightDate < 0 || iFrom < 0 || iTo < 0) {
      throw new Error(
        `Missing required columns: flight_flightDate=${iFlightDate}, flight_from=${iFrom}, flight_to=${iTo}`
      );
    }

    const flightLines: string[] = [];
    const dateRowRe = /^\d{4}-\d{2}-\d{2}(\t|$)/;
    let sawHeader = false;

    for (const line of lines) {
      if (!sawHeader) {
        if (line === headerLine) sawHeader = true;
        continue;
      }
      if (!line || !line.trim()) continue;
      if (!dateRowRe.test(line)) continue;
      flightLines.push(line);
    }

    console.log("logten import parsed flight lines", {
      totalLines: lines.length,
      flightLineCount: flightLines.length,
      firstSample: flightLines.slice(0, 3).map((l) => l.slice(0, 80)),
    });

    // Collect distinct ICAOs to upsert
    const icaos = new Set<string>();

    const get = (fields: string[], name: string) => {
      const i = idx(name);
      return i >= 0 ? (fields[i] ?? "") : "";
    };

    const flightsToCreate: Prisma.FlightCreateManyInput[] = flightLines
      .map((line): Prisma.FlightCreateManyInput | null => {
        const fields = line.split("\t");

        const flightDate = parseDate(get(fields, "flight_flightDate"));
        const fromIcaoRaw = get(fields, "flight_from").trim();
        const toIcaoRaw = get(fields, "flight_to").trim();
        const fromIcao = fromIcaoRaw.toUpperCase();
        const toIcao = toIcaoRaw.toUpperCase();

        if (!flightDate || !fromIcao || !toIcao) {
          console.log("skipping row", {
            flight_flightDate: get(fields, "flight_flightDate"),
            flight_from: get(fields, "flight_from"),
            flight_to: get(fields, "flight_to"),
          });
          return null;
        }

        icaos.add(fromIcao);
        icaos.add(toIcao);

        return {
          userId: internalUser.id,
          flightDate,
          fromIcao,
          toIcao,
          totalTime: parseFloatSafe(get(fields, "flight_totalTime")),
          pic: parseFloatSafe(get(fields, "flight_pic")),
          sic: parseFloatSafe(get(fields, "flight_sic")),
          night: parseFloatSafe(get(fields, "flight_night")),
          crossCountry: parseFloatSafe(get(fields, "flight_crossCountry")),
          ifr: parseFloatSafe(get(fields, "flight_ifr")),
          dayLandings: parseIntSafe(get(fields, "flight_dayLandings")) ?? 0,
          nightLandings: parseIntSafe(get(fields, "flight_nightLandings")) ?? 0,
          route: get(fields, "flight_route") || null,
          remarks: get(fields, "flight_remarks") || null,
          aircraftMake: get(fields, "aircraftType_make") || null,
          aircraftModel: get(fields, "aircraftType_model") || null,
          aircraftType: get(fields, "aircraftType_type") || null,
          tailNumber: get(fields, "aircraft_secondaryID") || null,
        };
      })
      .filter((v): v is Prisma.FlightCreateManyInput => v !== null);

    // MVP: Replace flights and ensure airports exist.
    // (We can wrap this in a transaction later once types/adapter support is sorted.)
    await prisma.flight.deleteMany({ where: { userId: internalUser.id } });

    const icaoList = Array.from(icaos);
    if (icaoList.length) {
      // Create any missing airports; skip existing.
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

    const now = new Date();
    const cutoff90 = new Date(now);
    cutoff90.setDate(cutoff90.getDate() - 90);

    const totals = await prisma.flight.aggregate({
      where: { userId: internalUser.id },
      _sum: {
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

    const last90 = await prisma.flight.aggregate({
      where: { userId: internalUser.id, flightDate: { gte: cutoff90 } },
      _sum: {
        totalTime: true,
        ifr: true,
        dayLandings: true,
        nightLandings: true,
      },
    });

    await prisma.profileStats.upsert({
      where: { userId: internalUser.id },
      update: {
        totalTime: totals._sum.totalTime ?? 0,
        pic: totals._sum.pic ?? 0,
        sic: totals._sum.sic ?? 0,
        night: totals._sum.night ?? 0,
        crossCountry: totals._sum.crossCountry ?? 0,
        ifr: totals._sum.ifr ?? 0,
        last90_total: last90._sum.totalTime ?? 0,
        last90_landings: (last90._sum.dayLandings ?? 0) + (last90._sum.nightLandings ?? 0),
        last90_ifr: last90._sum.ifr ?? 0,
      },
      create: {
        userId: internalUser.id,
        totalTime: totals._sum.totalTime ?? 0,
        pic: totals._sum.pic ?? 0,
        sic: totals._sum.sic ?? 0,
        night: totals._sum.night ?? 0,
        crossCountry: totals._sum.crossCountry ?? 0,
        ifr: totals._sum.ifr ?? 0,
        last90_total: last90._sum.totalTime ?? 0,
        last90_landings: (last90._sum.dayLandings ?? 0) + (last90._sum.nightLandings ?? 0),
        last90_ifr: last90._sum.ifr ?? 0,
      },
    });

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCEEDED",
        importedCount: flightsToCreate.length,
        error: null,
      },
    });

    if (job.blobPathname || job.blobUrl) {
      try {
        if (process.env.NODE_ENV === "production" && (job.blobPathname || job.blobUrl)) {
          await del(job.blobPathname ?? job.blobUrl);
        }
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
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
