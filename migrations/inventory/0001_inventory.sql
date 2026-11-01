PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS inventory_products (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventory_vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  gstin TEXT,
  address TEXT,
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventory_materials (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'g', 'litre', 'unit')),
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventory_purchase_lots (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL,
  vendor_id TEXT NOT NULL,
  vendor_lot_number TEXT,
  invoice_number TEXT,
  purchased_on TEXT NOT NULL,
  received_qty REAL NOT NULL CHECK (received_qty > 0),
  unit_cost REAL CHECK (unit_cost IS NULL OR unit_cost >= 0),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (material_id) REFERENCES inventory_materials(id) ON DELETE RESTRICT,
  FOREIGN KEY (vendor_id) REFERENCES inventory_vendors(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS inventory_production_batches (
  id TEXT PRIMARY KEY,
  batch_no TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  manufactured_on TEXT NOT NULL,
  output_qty_kg REAL NOT NULL CHECK (output_qty_kg > 0),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_progress', 'qc_hold', 'released', 'rejected')),
  best_before TEXT,
  operator_name TEXT,
  packaging_lot TEXT,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES inventory_products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS inventory_batch_material_usage (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  material_id TEXT NOT NULL,
  purchase_lot_id TEXT NOT NULL,
  qty_used REAL NOT NULL CHECK (qty_used > 0),
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'g', 'litre', 'unit')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (batch_id) REFERENCES inventory_production_batches(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES inventory_materials(id) ON DELETE RESTRICT,
  FOREIGN KEY (purchase_lot_id) REFERENCES inventory_purchase_lots(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS inventory_quality_checks (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  qc_status TEXT NOT NULL CHECK (qc_status IN ('approved', 'hold', 'rejected')),
  moisture_pct REAL CHECK (moisture_pct IS NULL OR (moisture_pct >= 0 AND moisture_pct <= 100)),
  remarks TEXT,
  checked_by TEXT NOT NULL,
  checked_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (batch_id) REFERENCES inventory_production_batches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_audit_logs (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inventory_batches_product_date
  ON inventory_production_batches(product_id, manufactured_on DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_status
  ON inventory_production_batches(status, manufactured_on DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_purchase_lots_material_vendor
  ON inventory_purchase_lots(material_id, vendor_id, purchased_on DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_batch
  ON inventory_batch_material_usage(batch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_lot
  ON inventory_batch_material_usage(purchase_lot_id);
CREATE INDEX IF NOT EXISTS idx_inventory_qc_batch_date
  ON inventory_quality_checks(batch_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_created
  ON inventory_audit_logs(created_at DESC);

CREATE TRIGGER IF NOT EXISTS inventory_validate_material_usage
BEFORE INSERT ON inventory_batch_material_usage
BEGIN
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM inventory_purchase_lots l
      WHERE l.id = NEW.purchase_lot_id AND l.material_id = NEW.material_id
    )
    THEN RAISE(ABORT, 'PURCHASE_LOT_MATERIAL_MISMATCH')
  END;

  SELECT CASE
    WHEN NEW.qty_used > (
      SELECT l.received_qty - COALESCE((
        SELECT SUM(u.qty_used)
        FROM inventory_batch_material_usage u
        WHERE u.purchase_lot_id = l.id
      ), 0)
      FROM inventory_purchase_lots l
      WHERE l.id = NEW.purchase_lot_id
    )
    THEN RAISE(ABORT, 'INSUFFICIENT_PURCHASE_LOT_BALANCE')
  END;
END;
