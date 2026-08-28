UPDATE "service_orders"
SET "status" = 'IN_DIAGNOSIS'
WHERE "status" = 'AWAITING_EXECUTION';

ALTER TABLE "service_orders"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TYPE "ServiceOrderStatus" RENAME TO "ServiceOrderStatus_old";

CREATE TYPE "ServiceOrderStatus" AS ENUM (
  'RECEIVED',
  'IN_DIAGNOSIS',
  'AWAITING_APPROVAL',
  'IN_EXECUTION',
  'FINISHED',
  'DELIVERED',
  'CANCELED'
);

ALTER TABLE "service_orders"
ALTER COLUMN "status" TYPE "ServiceOrderStatus"
USING "status"::text::"ServiceOrderStatus";

ALTER TABLE "service_orders"
ALTER COLUMN "status" SET DEFAULT 'RECEIVED';

DROP TYPE "ServiceOrderStatus_old";
