-- AlterTable
ALTER TABLE "ImportJob" ADD COLUMN     "importedCount" INTEGER;

-- CreateTable
CREATE TABLE "Airport" (
    "id" TEXT NOT NULL,
    "icao" CITEXT NOT NULL,
    "name" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Airport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flightDate" TIMESTAMP(3) NOT NULL,
    "fromIcao" CITEXT NOT NULL,
    "toIcao" CITEXT NOT NULL,
    "fromAirportId" TEXT,
    "toAirportId" TEXT,
    "totalTime" DOUBLE PRECISION,
    "pic" DOUBLE PRECISION,
    "sic" DOUBLE PRECISION,
    "night" DOUBLE PRECISION,
    "crossCountry" DOUBLE PRECISION,
    "ifr" DOUBLE PRECISION,
    "dayLandings" INTEGER,
    "nightLandings" INTEGER,
    "route" TEXT,
    "remarks" TEXT,
    "aircraftMake" TEXT,
    "aircraftModel" TEXT,
    "aircraftType" TEXT,
    "tailNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pic" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sic" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "night" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "crossCountry" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ifr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last90_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last90_landings" INTEGER NOT NULL DEFAULT 0,
    "last90_ifr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Airport_icao_key" ON "Airport"("icao");

-- CreateIndex
CREATE INDEX "Flight_userId_flightDate_idx" ON "Flight"("userId", "flightDate");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileStats_userId_key" ON "ProfileStats"("userId");

-- AddForeignKey
ALTER TABLE "Flight" ADD CONSTRAINT "Flight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flight" ADD CONSTRAINT "Flight_fromAirportId_fkey" FOREIGN KEY ("fromAirportId") REFERENCES "Airport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flight" ADD CONSTRAINT "Flight_toAirportId_fkey" FOREIGN KEY ("toAirportId") REFERENCES "Airport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileStats" ADD CONSTRAINT "ProfileStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
