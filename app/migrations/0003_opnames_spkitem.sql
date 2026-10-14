-- Migration 0003: opnames pakai spk_items (bukan rab_items)
DROP TABLE IF EXISTS opnames;
CREATE TABLE opnames (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spk_item_id INTEGER NOT NULL REFERENCES spk_items(id),
  week_id INTEGER NOT NULL REFERENCES weeks(id),
  volume REAL NOT NULL DEFAULT 0,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(spk_item_id, week_id)
);
