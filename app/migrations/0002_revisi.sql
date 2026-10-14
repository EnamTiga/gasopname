-- Migration 0002: revisi struktur (REVISI.md R1-R6)
-- Proyek: + project_manager; pekerjaan pindah ke level proyek
ALTER TABLE projects ADD COLUMN project_manager TEXT;
ALTER TABLE projects ADD COLUMN work_type TEXT;

-- Pekerjaan level proyek (master RAB & RAP)
CREATE TABLE IF NOT EXISTS project_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  volume REAL NOT NULL DEFAULT 0,
  price_rab INTEGER NOT NULL DEFAULT 0,
  price_rap INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- SPK: sistem pembayaran; item SPK = pilih pekerjaan proyek + harga satuan kontrak
ALTER TABLE spks ADD COLUMN payment_method TEXT;
CREATE TABLE IF NOT EXISTS spk_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spk_id INTEGER NOT NULL REFERENCES spks(id),
  project_item_id INTEGER NOT NULL REFERENCES project_items(id),
  unit_price INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Realisasi pembayaran per minggu/opname (menu opname)
CREATE TABLE IF NOT EXISTS realizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spk_id INTEGER NOT NULL REFERENCES spks(id),
  week_id INTEGER REFERENCES weeks(id),
  amount INTEGER NOT NULL,
  method TEXT,
  date TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
