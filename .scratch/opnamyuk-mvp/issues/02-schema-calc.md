# 02: Migrasi skema D1 + modul perhitungan keuangan (pure functions)

**What to build:** Seluruh skema D1 (projects, mandors, spks, catalog_items, rab_items,
weeks, opnames, payments, kasbons, submissions) sebagai migrasi wrangler, plus modul
perhitungan keuangan murni: nilai opname, total opname s.d. minggu N, retensi per-SPK,
sisa opname, sisa kasbon, deteksi over-volume. Diverifikasi lewat unit test dengan angka
kalibrasi dari sheet SPK 01.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Migrasi D1 jalan (`wrangler d1 migrations apply`) tanpa error
- [ ] Unit test rumus: retensi 5% × opname; sisa opname = opname − (realisasi+pot + retensi + pot kasbon); sisa kasbon
- [ ] Test kalibrasi: opname MGG 1 SPK 01 = Rp 151.301.511; total kasbon sheet = Rp 705.432.649 (dari 5 baris)
- [ ] Over-volume → hasil flag warning, bukan exception
- [ ] Lint + typecheck + test hijau
