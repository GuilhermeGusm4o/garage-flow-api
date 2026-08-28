-- Minimum recommended stock level per inventory item.
-- Existing rows start at 0, meaning "no minimum configured yet".
ALTER TABLE "inventory" ADD COLUMN "min_quantity" DECIMAL(12,3) NOT NULL DEFAULT 0;
