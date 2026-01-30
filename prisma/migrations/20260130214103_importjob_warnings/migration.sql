-- AlterTable
ALTER TABLE "ImportJob" ADD COLUMN     "missingAirportCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "warnings" JSONB;
