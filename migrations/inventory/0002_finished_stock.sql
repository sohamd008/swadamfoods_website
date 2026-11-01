CREATE TABLE IF NOT EXISTS inventory_finished_stock (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  pack_size_g INTEGER NOT NULL CHECK (pack_size_g > 0),
  packets_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (packets_on_hand >= 0),
  notes TEXT,
  updated_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (product_id, pack_size_g),
  FOREIGN KEY (product_id) REFERENCES inventory_products(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_inventory_finished_stock_updated
  ON inventory_finished_stock(updated_at DESC);
