-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'SHORTLISTED';

-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'FULL';

-- AlterTable
ALTER TABLE "application" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "viewedAt" TIMESTAMP(3),
ADD COLUMN     "withdrawnReason" TEXT;

-- AlterTable
ALTER TABLE "replacement_listing" ADD COLUMN     "maxApplications" INTEGER;
