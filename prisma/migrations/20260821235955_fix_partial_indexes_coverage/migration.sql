-- DropIndex
DROP INDEX "profile_specialty_idx";

-- DropIndex
DROP INDEX "replacement_listing_createdAt_idx";

-- CreateIndex
CREATE INDEX "application_applicantId_idx" ON "application"("applicantId");

-- CreateIndex
CREATE INDEX "app_listing_shortlisted_idx" ON "application"("listingId", "createdAt" DESC) WHERE ("status" = 'SHORTLISTED');

-- CreateIndex
CREATE INDEX "profile_specialty_idx" ON "profile"("specialty") WHERE ("isPublic" = true);
