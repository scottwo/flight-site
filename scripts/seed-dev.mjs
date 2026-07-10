import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

if (process.env.ALLOW_DEV_SEED !== "true") {
  console.error("Set ALLOW_DEV_SEED=true to confirm that DATABASE_URL points to a disposable local database.");
  process.exit(1);
}
if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
  console.error("The development seed is disabled in production and Vercel environments.");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const flights = [
  {
    flightDate: new Date("2026-06-20T00:00:00Z"),
    fromIcao: "KDEN",
    toIcao: "KCOS",
    totalTime: 1.2,
    pic: 1.2,
    night: 0.3,
    crossCountry: 1.0,
    ifr: 0.2,
    dayLandings: 1,
    nightLandings: 0,
    tailNumber: "N123MP",
    aircraftMake: "Cessna",
    aircraftModel: "172S",
    aircraftType: "C172",
    distanceNm: 63,
  },
  {
    flightDate: new Date("2026-06-21T00:00:00Z"),
    fromIcao: "KCOS",
    toIcao: "KDEN",
    totalTime: 1.1,
    pic: 1.1,
    night: 0,
    crossCountry: 0.9,
    ifr: 0,
    dayLandings: 1,
    nightLandings: 0,
    tailNumber: "N123MP",
    aircraftMake: "Cessna",
    aircraftModel: "172S",
    aircraftType: "C172",
    distanceNm: 63,
  },
];

try {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { clerkUserId: "dev-seed-pilot" },
      update: { email: "dev-pilot@example.test" },
      create: {
        clerkUserId: "dev-seed-pilot",
        email: "dev-pilot@example.test",
      },
    });
    await tx.profile.upsert({
      where: { userId: user.id },
      update: {
        handle: "dev-pilot",
        displayName: "Avery Skyler",
        headline: "Synthetic profile for local MyPilotPage development",
      },
      create: {
        userId: user.id,
        handle: "dev-pilot",
        displayName: "Avery Skyler",
        headline: "Synthetic profile for local MyPilotPage development",
      },
    });

    await tx.flight.deleteMany({ where: { userId: user.id } });
    await tx.importJob.deleteMany({ where: { userId: user.id } });
    await tx.profileStats.deleteMany({ where: { userId: user.id } });
    await tx.flightDayAgg.deleteMany({ where: { userId: user.id } });
    await tx.routeAgg.deleteMany({ where: { userId: user.id } });

    const airports = await Promise.all([
      tx.airport.upsert({
        where: { icao: "KDEN" },
        update: { name: "Denver International Airport", lat: 39.8617, lon: -104.6731 },
        create: { icao: "KDEN", name: "Denver International Airport", lat: 39.8617, lon: -104.6731 },
      }),
      tx.airport.upsert({
        where: { icao: "KCOS" },
        update: { name: "Colorado Springs Airport", lat: 38.8058, lon: -104.7008 },
        create: { icao: "KCOS", name: "Colorado Springs Airport", lat: 38.8058, lon: -104.7008 },
      }),
    ]);
    const airportByIcao = new Map(airports.map((airport) => [airport.icao, airport]));

    const importJob = await tx.importJob.create({
      data: {
        userId: user.id,
        provider: "LOGTEN_TSV",
        status: "SUCCEEDED",
        originalFilename: "logten-synthetic.tsv",
        importedCount: flights.length,
        startedAt: new Date("2026-06-22T00:00:00Z"),
        finishedAt: new Date("2026-06-22T00:00:01Z"),
      },
    });

    await tx.flight.createMany({
      data: flights.map((flight) => ({
        ...flight,
        userId: user.id,
        importJobId: importJob.id,
        provider: "LOGTEN_TSV",
        fromAirportId: airportByIcao.get(flight.fromIcao)?.id,
        toAirportId: airportByIcao.get(flight.toIcao)?.id,
      })),
    });
    await tx.profileStats.create({
      data: {
        userId: user.id,
        totalTime: 2.3,
        pic: 2.3,
        night: 0.3,
        crossCountry: 1.9,
        ifr: 0.2,
        last90_total: 2.3,
        last90_landings: 2,
        last90_ifr: 0.2,
        flightsCount: 2,
        landingsTotal: 2,
      },
    });
    await tx.flightDayAgg.createMany({
      data: flights.map((flight) => ({
        userId: user.id,
        day: flight.flightDate,
        flightsCount: 1,
        totalTime: flight.totalTime,
        pic: flight.pic,
        night: flight.night,
        crossCountry: flight.crossCountry,
        ifr: flight.ifr,
        landings: flight.dayLandings + flight.nightLandings,
      })),
    });
    await tx.routeAgg.createMany({
      data: flights.map((flight) => ({
        userId: user.id,
        fromIcao: flight.fromIcao,
        toIcao: flight.toIcao,
        flightsCount: 1,
        totalTime: flight.totalTime,
        lastFlownAt: flight.flightDate,
      })),
    });
  });

  console.log("Seeded the synthetic local profile at /p/dev-pilot.");
} finally {
  await prisma.$disconnect();
  await pool.end();
}
