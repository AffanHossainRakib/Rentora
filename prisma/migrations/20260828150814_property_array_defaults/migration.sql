-- AlterTable
ALTER TABLE "properties" ALTER COLUMN "amenities" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "pictures" SET DEFAULT ARRAY[]::TEXT[];
