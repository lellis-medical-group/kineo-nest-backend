-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('INSTALLED', 'REPLACEMENT', 'BOTH');

-- CreateEnum
CREATE TYPE "Specialty" AS ENUM ('GENERALIST', 'DENTIST', 'DERMATOLOGIST', 'PSYCHIATRIST', 'OTHER');

-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rppsNumber" TEXT,
    "specialty" "Specialty" NOT NULL,
    "profileType" "ProfileType" NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_key" ON "profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_rppsNumber_key" ON "profile"("rppsNumber");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
