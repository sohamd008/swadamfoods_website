PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS inventory_deductions (
  order_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
