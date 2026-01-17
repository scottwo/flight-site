-- AlterTable
ALTER TABLE "Flight" ADD COLUMN     "importJobId" TEXT,
ADD COLUMN     "provider" "ImportProvider",
ADD COLUMN     "sourceId" TEXT;

-- AlterTable
ALTER TABLE "ImportJob" ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ProfileStats" ADD COLUMN     "flightsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "funFacts" JSONB,
ADD COLUMN     "landingsTotal" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "FlightDayAgg" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "flightsCount" INTEGER NOT NULL DEFAULT 0,
    "totalTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pic" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sic" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "night" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "crossCountry" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ifr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "landings" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlightDayAgg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteAgg" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromIcao" CITEXT NOT NULL,
    "toIcao" CITEXT NOT NULL,
    "flightsCount" INTEGER NOT NULL DEFAULT 0,
    "totalTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastFlownAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteAgg_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlightDayAgg_userId_day_idx" ON "FlightDayAgg"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "FlightDayAgg_userId_day_key" ON "FlightDayAgg"("userId", "day");

-- CreateIndex
CREATE INDEX "RouteAgg_userId_fromIcao_toIcao_idx" ON "RouteAgg"("userId", "fromIcao", "toIcao");

-- CreateIndex
CREATE UNIQUE INDEX "RouteAgg_userId_fromIcao_toIcao_key" ON "RouteAgg"("userId", "fromIcao", "toIcao");

-- CreateIndex
CREATE INDEX "Flight_userId_fromIcao_toIcao_idx" ON "Flight"("userId", "fromIcao", "toIcao");

-- CreateIndex
CREATE INDEX "Flight_userId_importJobId_idx" ON "Flight"("userId", "importJobId");

-- AddForeignKey
ALTER TABLE "Flight" ADD CONSTRAINT "Flight_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightDayAgg" ADD CONSTRAINT "FlightDayAgg_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteAgg" ADD CONSTRAINT "RouteAgg_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
