-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'OPEN', 'IN_DISCUSSION', 'FILLED', 'CLOSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "replacement_listing" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "specialty" "Specialty" NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "replacement_listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "replacement_listing_practiceId_idx" ON "replacement_listing"("practiceId");

-- CreateIndex
CREATE INDEX "replacement_listing_status_idx" ON "replacement_listing"("status");

-- AddForeignKey
ALTER TABLE "replacement_listing" ADD CONSTRAINT "replacement_listing_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replacement_listing" ADD CONSTRAINT "replacement_listing_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
