CREATE TABLE IF NOT EXISTS inventory_vendor_material_rates (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  material_id TEXT NOT NULL,
  rate REAL NOT NULL CHECK (rate >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  effective_from TEXT NOT NULL,
  notes TEXT,
  updated_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (vendor_id, material_id),
  FOREIGN KEY (vendor_id) REFERENCES inventory_vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES inventory_materials(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_vendor_material_rate_versions (
  id TEXT PRIMARY KEY,
  rate_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  previous_rate REAL CHECK (previous_rate IS NULL OR previous_rate >= 0),
  new_rate REAL NOT NULL CHECK (new_rate >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  effective_from TEXT NOT NULL,
  notes TEXT,
  changed_by TEXT NOT NULL,
  changed_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (rate_id, version),
  FOREIGN KEY (rate_id) REFERENCES inventory_vendor_material_rates(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inventory_vendor_rates_vendor_material
  ON inventory_vendor_material_rates(vendor_id, material_id);

CREATE INDEX IF NOT EXISTS idx_inventory_vendor_rate_versions_rate
  ON inventory_vendor_material_rate_versions(rate_id, version DESC);
