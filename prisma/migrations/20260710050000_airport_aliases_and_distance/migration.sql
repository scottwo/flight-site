-- CreateTable
CREATE TABLE "AirportAlias" (
    "id" TEXT NOT NULL,
    "code" CITEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "airportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AirportAlias_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Flight" ADD COLUMN "distanceNm" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "AirportAlias_code_key" ON "AirportAlias"("code");

-- CreateIndex
CREATE INDEX "AirportAlias_airportId_idx" ON "AirportAlias"("airportId");

-- AddForeignKey
ALTER TABLE "AirportAlias" ADD CONSTRAINT "AirportAlias_airportId_fkey"
FOREIGN KEY ("airportId") REFERENCES "Airport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
