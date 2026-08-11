-- CreateTable
CREATE TABLE "practice" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "practice_ownerId_idx" ON "practice"("ownerId");

-- AddForeignKey
ALTER TABLE "practice" ADD CONSTRAINT "practice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
