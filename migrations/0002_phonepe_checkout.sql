ALTER TABLE orders ADD COLUMN payment_checkout_url TEXT;
ALTER TABLE orders ADD COLUMN payment_expires_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_orders_gateway_order
  ON orders (payment_gateway, gateway_order_id);
