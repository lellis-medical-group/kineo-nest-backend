-- Supports bounded-box filtering used by geographic practice searches.
CREATE INDEX "practice_latitude_longitude_idx" ON "practice"("latitude", "longitude");
