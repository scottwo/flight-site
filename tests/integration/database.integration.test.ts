import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString) {
  throw new Error("TEST_DATABASE_URL is required for integration tests.");
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const createdClerkUserIds = new Set<string>();

after(async () => {
  if (createdClerkUserIds.size > 0) {
    await prisma.user.deleteMany({
      where: { clerkUserId: { in: Array.from(createdClerkUserIds) } },
    });
  }
  await prisma.$disconnect();
  await pool.end();
});

test("the integration database is reachable and migrated", async () => {
  const rows = await prisma.$queryRaw<Array<{ value: number }>>`SELECT 1 AS value`;
  assert.equal(rows[0]?.value, 1);

  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('User', 'Profile', 'ImportJob', 'Flight', 'ProfileStats')
  `;
  assert.deepEqual(
    new Set(tables.map((row) => row.table_name)),
    new Set(["User", "Profile", "ImportJob", "Flight", "ProfileStats"]),
  );
});

test("deleting a user cascades through representative imported data", async () => {
  const suffix = randomUUID();
  const clerkUserId = `integration-${suffix}`;
  createdClerkUserIds.add(clerkUserId);

  const user = await prisma.user.create({
    data: {
      clerkUserId,
      email: `${suffix}@example.test`,
      profile: {
        create: {
          handle: `test-${suffix}`,
          displayName: "Synthetic Test Pilot",
        },
      },
    },
  });
  const job = await prisma.importJob.create({
    data: {
      userId: user.id,
      provider: "LOGTEN_TSV",
      status: "SUCCEEDED",
      originalFilename: "logten-synthetic.tsv",
      importedCount: 1,
      finishedAt: new Date(),
    },
  });
  await prisma.flight.create({
    data: {
      userId: user.id,
      importJobId: job.id,
      provider: "LOGTEN_TSV",
      flightDate: new Date("2026-01-15T00:00:00Z"),
      fromIcao: "KDEN",
      toIcao: "KCOS",
      totalTime: 1.2,
    },
  });
  await prisma.profileStats.create({
    data: {
      userId: user.id,
      flightsCount: 1,
      totalTime: 1.2,
    },
  });

  await prisma.user.delete({ where: { id: user.id } });
  createdClerkUserIds.delete(clerkUserId);

  const [profiles, jobs, flights, stats] = await Promise.all([
    prisma.profile.count({ where: { userId: user.id } }),
    prisma.importJob.count({ where: { userId: user.id } }),
    prisma.flight.count({ where: { userId: user.id } }),
    prisma.profileStats.count({ where: { userId: user.id } }),
  ]);
  assert.deepEqual({ profiles, jobs, flights, stats }, { profiles: 0, jobs: 0, flights: 0, stats: 0 });
});
