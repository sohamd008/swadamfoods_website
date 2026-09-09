PRAGMA foreign_keys = ON;

ALTER TABLE orders ADD COLUMN delivery_slot TEXT;

CREATE TABLE IF NOT EXISTS delivery_time_slots (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10 CHECK (capacity >= 0),
  booked INTEGER NOT NULL DEFAULT 0 CHECK (booked >= 0),
  is_active INTEGER NOT NULL DEFAULT 1,
  slot_date TEXT NOT NULL DEFAULT (date('now'))
);

CREATE INDEX IF NOT EXISTS idx_slots_date
  ON delivery_time_slots (slot_date, is_active);

INSERT OR IGNORE INTO delivery_time_slots (id, label, start_time, end_time, capacity, booked, is_active, slot_date)
VALUES
  ('morning', '10:00 AM – 1:00 PM', '10:00', '13:00', 10, 0, 1, date('now')),
  ('afternoon', '2:00 PM – 6:00 PM', '14:00', '18:00', 10, 0, 1, date('now')),
  ('evening', '6:00 PM – 9:00 PM', '18:00', '21:00', 10, 0, 1, date('now'));
