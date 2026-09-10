-- AlterTable
ALTER TABLE "replacement_listing" ADD COLUMN "title" TEXT;

-- Backfill: derive a human-readable title from the specialty for existing rows
UPDATE
  "replacement_listing"
SET
  "title" = CASE "specialty"
    WHEN 'GENERALIST' THEN 'Remplacement généraliste'
    WHEN 'DENTIST' THEN 'Remplacement dentiste'
    WHEN 'DERMATOLOGIST' THEN 'Remplacement dermatologue'
    WHEN 'PSYCHIATRIST' THEN 'Remplacement psychiatre'
    ELSE 'Remplacement'
  END;

-- AlterTable
ALTER TABLE "replacement_listing" ALTER COLUMN "title" SET NOT NULL;
