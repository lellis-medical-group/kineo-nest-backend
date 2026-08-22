-- CreateIndex
CREATE INDEX "application_listingId_status_idx" ON "application"("listingId", "status");

-- CreateIndex
CREATE INDEX "application_applicantId_status_idx" ON "application"("applicantId", "status");

-- CreateIndex
CREATE INDEX "replacement_listing_createdById_status_idx" ON "replacement_listing"("createdById", "status");
