-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('SYSTEM', 'LIGHT', 'DARK', 'CUSTOM');

-- AlterTable
ALTER TABLE "Profile"
ADD COLUMN "themeMode" "ThemeMode" NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN "themePrimary" TEXT,
ADD COLUMN "themeSecondary" TEXT,
ADD COLUMN "themeGuardrails" BOOLEAN NOT NULL DEFAULT true;
