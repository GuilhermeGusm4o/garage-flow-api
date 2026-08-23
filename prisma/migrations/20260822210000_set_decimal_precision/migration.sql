-- Keep money values at cents and stock quantities at millesimal precision.
ALTER TABLE "service_orders"
  ALTER COLUMN "total_amount" TYPE DECIMAL(10,2)
  USING ROUND("total_amount", 2);

ALTER TABLE "services"
  ALTER COLUMN "price" TYPE DECIMAL(10,2)
  USING ROUND("price", 2);

ALTER TABLE "inventory"
  ALTER COLUMN "unit_price" TYPE DECIMAL(10,2)
  USING ROUND("unit_price", 2),
  ALTER COLUMN "quantity" TYPE DECIMAL(12,3)
  USING ROUND("quantity", 3);

ALTER TABLE "os_services"
  ALTER COLUMN "price" TYPE DECIMAL(10,2)
  USING ROUND("price", 2);

ALTER TABLE "os_inventory"
  ALTER COLUMN "quantity" TYPE DECIMAL(12,3)
  USING ROUND("quantity", 3),
  ALTER COLUMN "unit_price" TYPE DECIMAL(10,2)
  USING ROUND("unit_price", 2);
