-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "application" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "application_listingId_idx" ON "application"("listingId");

-- CreateIndex
CREATE INDEX "application_applicantId_idx" ON "application"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "application_listingId_applicantId_key" ON "application"("listingId", "applicantId");

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "replacement_listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
