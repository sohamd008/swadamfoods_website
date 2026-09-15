ALTER TABLE orders ADD COLUMN inventory_deducted INTEGER NOT NULL DEFAULT 0 CHECK (inventory_deducted IN (0, 1));

CREATE INDEX IF NOT EXISTS idx_orders_inventory_deducted
  ON orders (inventory_deducted, payment_status);
