-- gasopname: skema D1 lengkap (ticket 02)
PRAGMA foreign_keys = ON;

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  engineer TEXT NOT NULL,
  company TEXT NOT NULL,
  start_date TEXT NOT NULL,             -- YYYY-MM-DD
  status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','selesai')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE mandors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  bank TEXT,
  account_no TEXT,
  account_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE spks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  mandor_id INTEGER NOT NULL REFERENCES mandors(id),
  no_spk TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,      -- nilai kontrak (rupiah integer)
  work_type TEXT,
  retention_pct INTEGER NOT NULL DEFAULT 5 CHECK (retention_pct BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','selesai')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (project_id, no_spk)
);

CREATE TABLE catalog_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0,
  UNIQUE (project_id, description, unit)
);

CREATE TABLE rab_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spk_id INTEGER NOT NULL REFERENCES spks(id),
  catalog_item_id INTEGER REFERENCES catalog_items(id),
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  contract_volume REAL NOT NULL CHECK (contract_volume >= 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),  -- immutable saat SPK aktif
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE weeks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  number INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  UNIQUE (project_id, number)
);

CREATE TABLE opnames (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rab_item_id INTEGER NOT NULL REFERENCES rab_items(id),
  week_id INTEGER NOT NULL REFERENCES weeks(id),
  volume REAL NOT NULL CHECK (volume >= 0),
  note TEXT,
  UNIQUE (rab_item_id, week_id)
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spk_id INTEGER NOT NULL REFERENCES spks(id),
  week_id INTEGER REFERENCES weeks(id),
  kind TEXT NOT NULL CHECK (kind IN ('maker','kasbon_potong')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  note TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE kasbons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mandor_id INTEGER NOT NULL REFERENCES mandors(id),
  spk_id INTEGER REFERENCES spks(id),    -- opsional; kasbon bisa lintas SPK
  amount INTEGER NOT NULL CHECK (amount > 0),
  date TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spk_id INTEGER NOT NULL REFERENCES spks(id),
  week_id INTEGER NOT NULL REFERENCES weeks(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','diajukan','dibayar')),
  snapshot_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (spk_id, week_id)
);

CREATE INDEX idx_opnames_week ON opnames(week_id);
CREATE INDEX idx_opnames_item ON opnames(rab_item_id);
CREATE INDEX idx_payments_spk ON payments(spk_id);
CREATE INDEX idx_kasbons_mandor ON kasbons(mandor_id);
CREATE INDEX idx_submissions_week ON submissions(week_id);
