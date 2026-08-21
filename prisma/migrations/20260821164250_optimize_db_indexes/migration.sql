-- DropIndex
DROP INDEX "application_applicantId_idx";

-- DropIndex
DROP INDEX "application_applicantId_status_idx";

-- DropIndex
DROP INDEX "application_listingId_idx";

-- DropIndex
DROP INDEX "application_listingId_status_idx";

-- DropIndex
DROP INDEX "replacement_listing_status_idx";

-- DropIndex
DROP INDEX "verification_identifier_idx";

-- CreateIndex
CREATE INDEX "app_listing_pending_idx" ON "application"("listingId", "createdAt" DESC) WHERE ("status" = 'PENDING');

-- CreateIndex
CREATE INDEX "app_applicant_pending_idx" ON "application"("applicantId", "createdAt" DESC) WHERE ("status" = 'PENDING');

-- CreateIndex
CREATE INDEX "app_applicant_shortlisted_idx" ON "application"("applicantId", "createdAt" DESC) WHERE ("status" = 'SHORTLISTED');

-- CreateIndex
CREATE INDEX "profile_specialty_idx" ON "profile"("specialty") WHERE ("isPublic" = true AND "verified" = true);

-- CreateIndex
CREATE INDEX "rl_open_createdAt_idx" ON "replacement_listing"("createdAt" DESC) WHERE ("status" = 'OPEN');

-- CreateIndex
CREATE INDEX "rl_indisc_createdAt_idx" ON "replacement_listing"("createdAt" DESC) WHERE ("status" = 'IN_DISCUSSION');

-- CreateIndex
CREATE INDEX "replacement_listing_createdAt_idx" ON "replacement_listing"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification" USING HASH ("identifier");
