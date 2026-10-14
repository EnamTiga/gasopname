# GASOPNAME — Rencana Final (hasil grilling, disetujui)

> Referensi bisnis: ~/gasopname/REFERENCE.md (workbook "OPNAME BOBOL KARANGJATI",
> https://docs.google.com/spreadsheets/d/1yWO3dY_2-Pm8r5F2qL9Hep0lDhw8pGa9Yzcxc8MFcRs/edit)
> Status: PERENCANAAN DISETUJUI — menunggu perintah eksekusi.

## 1. Keputusan Terkunci (semua hasil grilling dengan user)

### Platform & Arsitektur
- **Aplikasi penuh** dengan database sendiri. Google Sheets = referensi saja.
- **Cloudflare free tier**: Workers (API) + Pages (frontend statis).
- Database: **Cloudflare D1** (SQLite).
- Deploy: **wrangler lokal** dulu dari mesin ini; GitHub repo pakai akun gh terlogin; auto-deploy nanti.
- Domain: `gasopname.pages.dev`.
- Single user (user) untuk MVP; siap multi-role di fase berikutnya.

### Frontend
- React 19 + Vite + TypeScript (strict).
- TanStack Router + TanStack Query.
- react-hook-form + zod resolver.
- Tailwind CSS v4 + shadcn/ui (Radix Primitives di balik layar) — WAJIB pakai skills
  (frontend-design, web-design-guidelines, vercel-react-best-practices,
  vercel-composition-patterns) + MCP shadcn.
- Website **interaktif**: form reaktif, rekap ter-update otomatis, loading state,
  toast feedback, **grafik tren mingguan** per SPK di dashboard.

### Backend
- Hono di Workers, Zod untuk validasi (skema share frontend↔backend).
- Angka: rupiah = **integer** (tanpa pembulatan; pembulatan hanya di belakang koma),
  volume = REAL (desimal bebas).
- Proteksi akses: password sederhana di middleware Workers (secret, TIDAK di-hardcode,
  TIDAK di repo — password sudah pernah muncul di chat, rotasi disarankan nanti).
- Tanpa fitur export (Excel/CSV/PDF dihapus semua).
- Tanpa fitur backup.

### Domain/Bisnis
- **Multi-project dari awal**: >5 proyek, tiap proyek >5 mandor, tiap mandor bisa >2 SPK
  (bisa lintas proyek), <50 item RAB per SPK.
- Entitas **Mandor terpisah** (nama, bank, rekening) — 1 mandor bisa beberapa SPK lintas proyek.
- Status siklus hidup: **Aktif / Selesai** (tidak ada "Dibatalkan").
- **Minggu (MGG) otomatis** dari tanggal mulai proyek (mingguan berurutan 7 hari).
- Item RAB: **tanpa kode** (UP1 dsb dihapus), katalog item terpusat **per project**,
  boleh item custom per SPK.
- Harga satuan kontrak **tetap** selama kontrak jalan (tidak bisa nego/ubah).
- Volume opname melebihi kontrak: **warning/note**, tidak diblok.
- Retensi: **persentase per SPK, default 5%**.
- Kasbon terikat ke **mandor** (bisa menyentuh beberapa SPK/proyek).
- Alur pengajuan: **Draft → Diajukan → Dibayar**.
- Pengajuan = **snapshot** (freeze angka saat dibuat).
- Opname: bisa diedit **selama pengajuan minggu itu belum dibuat**; setelah itu terkunci.
- Realisasi = pembayaran terverifikasi via maker (bukan angka manual).
- Input opname: **manual diketik** per item per minggu.
- UI full **Bahasa Indonesia**, format **Rp** (Rp 1.234.567).
- Desktop-first untuk MVP.
- Data historis: mulai **kosong**; seed data SPK 01 dari sheet dilakukan di **fase pengujian**
  (sekaligus uji verifikasi silang rumus aplikasi vs sheet).

## 2. Rumus Baku (dari sheet, dikodekan bersih)

- `Nilai opname item = volume × harga satuan` (integer rupiah)
- `TOTAL OPNAME s.d MGG N` = Σ nilai opname SPK itu minggu 1..N
- `RETENSI = persen_retensi(SPK) × TOTAL OPNAME s.d MGG N`
- `REALISASI + POT` = pembayaran maker terverifikasi s.d MGG N
- `SISA OPNAME = TOTAL OPNAME − (REALISASI+POT + RETENSI + POT KASBON)`
- `SISA KASBON = total kasbon mandor − total potongan kasbon`

## 3. Model Data (draft D1 schema)

```sql
projects(id, name, engineer, company, start_date, status)           -- status: aktif|selesai
mandors(id, name, bank, account_no, account_name)
spks(id, project_id, mandor_id, no_spk, value, work_type,
     retention_pct DEFAULT 5, status)                                -- aktif|selesai
catalog_items(id, project_id, description, unit)                     -- katalog per project
rab_items(id, spk_id, catalog_item_id NULL, description, unit,
          contract_volume, unit_price)                               -- unit_price immutable saat kontrak jalan
weeks(id, project_id, number, start_date, end_date)                  -- dibuat otomatis dari start_date
opnames(id, spk_id, week_id, rab_item_id, volume REAL)               -- editable sampai pengajuan minggu itu dibuat
payments(id, spk_id, week_id, kind, amount, note, date)              -- kind: maker | kasbon_potong
kasbons(id, mandor_id, spk_id NULL, amount, date, note)              -- terikat mandor, bisa lintas SPK
submissions(id, spk_id, week_id, status,                             -- draft|diajukan|dibayar
            snapshot_json)                                           -- freeze angka
```

## 4. Halaman (usulan UI)

1. `/` Dashboard — ringkasan per proyek/SPK (nilai SPK, opname s.d. minggu ini,
   retensi, sisa opname, sisa kasbon) + grafik tren mingguan
2. `/proyek` — CRUD proyek, katalog item, kalender minggu
3. `/mandor` — CRUD mandor (lintas proyek)
4. `/spk` — daftar & detail SPK + RAB-nya
5. `/opname` — input volume per item per minggu (grid reaktif, warning over-volume,
   kunci otomatis setelah pengajuan)
6. `/pengajuan` — buat snapshot rekap mingguan (Draft → Diajukan → Dibayar)
7. `/kasbon` — kasbon per mandor + potongan
8. `/pembayaran` — maker/realisasi

## 5. Desain Visual (skill frontend-design)

- Arah: **industrial engineering** — dunia lapangan konstruksi, bukan SaaS generik
- Slate gelap + aksen safety-amber; tabel padat gaya lembar kerja; angka tabular
- Type: Archivo (UI) + JetBrains Mono (angka/rupiah)
- Kiri-sejajar, bukan grid kartu identik

## 6. Kualitas Kode (WAJIB)

- **Maksimal 700 baris per file** — pecah modul jika lebih.
- Kode rapi & terstruktur: pemisahan tanggung jawab jelas (UI / API / logika bisnis /
  validasi / util terpisah), folder modular per fitur.
- Mudah dimaintenance & skalabel: komponen kecil fokus satu tugas, logic bisnis
  (rumus keuangan) di modul tersendiri yang bisa diuji, tidak ada duplikasi.
- TypeScript strict + ESLint + Prettier.
- Loop engineering: kerjakan sampai lint, typecheck, dan uji fungsional lolos ketat.
- Verifikasi rumus dengan seed SPK 01 vs angka sheet (fase pengujian).
- Fungsi perhitungan keuangan diuji unit (retensi, sisa opname, snapshot).

## 7. Urutan Eksekusi (proposal — menunggu green light user)

1. Setup repo + Vite + Tailwind + shadcn + Hono + D1 schema & migrasi
2. CRUD proyek / mandor / SPK / RAB / katalog
3. Minggu otomatis + input opname mingguan
4. Kasbon + pembayaran (maker)
5. Pengajuan (snapshot, status) + rekap
6. Dashboard + grafik + desain final (audit web-design-guidelines)
7. Proteksi password + deploy wrangler lokal + verifikasi end-to-end
8. Fase pengujian: seed data SPK 01, verifikasi silang vs sheet
