-- Add the client complaint description, backfilling existing rows with an empty string
ALTER TABLE "service_orders" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "service_orders" ALTER COLUMN "description" DROP DEFAULT;

-- New service orders default to RECEIVED at the database level
ALTER TABLE "service_orders" ALTER COLUMN "status" SET DEFAULT 'RECEIVED';
