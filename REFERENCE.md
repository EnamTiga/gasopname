# GASOPNAME — Referensi Proyek

> Dibuat: 14 Oktober 2026. Referensi utama untuk implementasi aplikasi web **gasopname**
> (aplikasi opname pekerjaan konstruksi / mandor).

## Sumber Data (Referensi Utama)

**Google Spreadsheet:** https://docs.google.com/spreadsheets/d/1yWO3dY_2-Pm8r5F2qL9Hep0lDhw8pGa9Yzcxc8MFcRs/edit

- Judul: **OPNAME BOBOL KARANGJATI**
- Akses: via Service Account GCP `test-699@lunar-landing-462609-r9.iam.gserviceaccount.com`
  (kredensial: `~/.gcp/lunar-landing-sa.json`, env `GOOGLE_APPLICATION_CREDENTIALS`).
  Status akses: **READ-ONLY** terverifikasi (spreadsheets.readonly + drive.readonly).
  Bila aplikasi perlu MENULIS ke sheet, SA harus diberi akses Editor pada spreadsheet.
- Snapshot data mentah tersimpan di `~/gasopname/raw/*.json` (per tab).

## Konteks Domain

Spreadsheet ini adalah workbook operasional untuk proyek konstruksi:

- **Paket/Pekerjaan**: "BOBOL KARANGJATI" — perusahaan **M C A**, engineer **IRFAN S**
- **SPK** (Surat Perintah Kerja) per **mandor**. Saat ini hanya SPK 01 yang terisi:
  - `SPK 01/MANDOR /MCA-BOB/SBY/X/2024` — mandor **UBAIDILLAH ISMAIL**
  - Nilai SPK: **Rp 985.606.696**
  - Jenis pekerjaan: PAVING, GUARDRAIL, PAVING Blok, dsb.
  - Bank MDR, rek `142-00-2359575-3` a.n. Anita Krestamia
- **Siklus mingguan (MGG)**: pekerjaan diopname per minggu. MGG 1–31 tercatat di DETAIL MGG,
  mulai **14 Okt 2024** (MGG 1 = 14–20 Okt 24, Minggu→Sabtu) hingga ± awal 2025.
  Ada juga kolom minggu pra-14-Okt (23 Sep–7 Okt) di tab detail.
- **Alur bisnis** (direkonstruksi dari sheet):
  1. SPK didefinisikan per mandor dengan RAB upah (item pekerjaan × volume terkontrak × harga satuan nego)
  2. Setiap minggu dilakukan **opname** volume realisasi per item → nilai opname minggu itu
  3. Mandor mengajukan **pengajuan** mingguan (rekap opname s.d. minggu berjalan)
  4. Perusahaan mencairkan via **maker** (transfer), sering memotong **kasbon**
  5. **Kasbon** dicatat (nilai kasbon, pengembalian/potongan)
  6. **Retensi** 5% dari total realisasi dipotong

## Struktur Tab (10 tab)

### 1. RKP (28 baris) — Rekap induk
"REKAP OPNAME + REALISASI". Baris 3 = header: NO SPK, KODE, NAMA MANDOR, TOTAL SPK,
OPNAME, RETENSI, OPNAME POT RETENSI, KASBON, POT KASBON, SISA KASBON, MAKER, dst (44 kolom).
Data aktif: 1 baris (SPK 01). Ini dashboard ringkasan per SPK/mandor.

### 2. KASBON (514 baris, 5 baris berisi) — Detail kasbon
Header: NO, TGL KASBON, SPK(kode), NO. SPK, MANDOR, NILAI KASBON, MGG KE, TGL PENGEMBALIAN,
NILAI PENGEMBALIAN, KETERANGAN. 5 transaksi kasbon milik SPK 01:
54.917.000 / 143.736.435 / 196.779.214 / 60.000.000 / 250.000.000 (semua MGG ke-8,
nilai pengembalian = nilai kasbon). Total kasbon ≈ **Rp 705.432.649**.

### 3. MAKER (74 baris, 3 baris berisi) — Realisasi pembayaran/maker
Header: MGG, Tgl Pengajuan, SPK, NO. SPK, MANDOR, NILAI PENGAJUAN, nilai MAKER, TGL MAKER,
NILAI BAYAR, KETERANGAN. Isi (kolom keterangan bebas teks):
MGG 1: "43.736.435 tf 100.000.000" ; MGG 2: "66.779.000 maker 130.000" ; MGG 3: "transfer".

### 4. PENGAJUAN (123 baris) — Form rekap pengajuan mingguan (per mandor)
Berisi 6 blok form, tiap blok 20 baris (baris 0,20,40,60,80,100):
- Header form: NAMA FORM ("REKAP PENGAJUAN OPNAME"), TANGGAL FORM (rentang minggu),
  NAMA PAKET, PERUSAHAAN, engineer
- Kolom tabel: NO SPK, MANDOR, NILAI SPK, JENIS PEKERJAAN, TOTAL OPNAME s.d MGG,
  TOTAL REALISASI + POT, TOTAL RETENSI s.d MGG (5% × total), REALISASI MINGGU LALU,
  STATUS REALISASI MGG, SISA OPNAME s.d MGG, TOTAL KASBON s.d MGG, TOTAL POTONGAN KASBON,
  TOTAL SISA KASBON, RENC POTONGAN KASBON, SISA KASBON MGG INI
- Rentang tercatat: 14–20 Okt, 21–27 Okt, 28 Okt–3 Nov, 4–10 Nov, 11–17 Nov 2024, + form 10 Jan 25
- Rumus penting: **RETENSI = 5% × TOTAL OPNAME s.d MGG**; **SISA OPNAME = OPNAME − (REALISASI+POT + RETENSI + POT KASBON)**

### 5. OPN UPAH (39 baris) — Sama seperti PENGAJUAN tapi khusus "UPAH"
2 blok form (PENGAJUAN KE 1 dan 2, minggu 14–20 Okt & 21–27 Okt 2024).
Banyak sel berisi `#ERROR!` (formula rusak pada baris template) — abaikan pola error ini,
struktur kolomnya identik dengan PENGAJUAN.

### 6. MASTER SPK (47 baris) — Daftar induk SPK
Header meta: PAKET "BOBOL KARANGJATI", ENGINEER "IRFAN S", PERUSAHAAN "M C A".
Tabel: NO (1–40 slot), NO SPK, NAMA MANDOR, NILAI SPK, JENIS PEKERJAAN, BANK, NO REK, NAMA REK.
Catatan data: baris 01 nilainya tampak tertukar kolom (nama mandor muncul di kolom NILAI SPK).

### 7. detail volume (817 baris) — RAB per SPK: item × volume × harga
Per SPK ada blok "BACK UP PERHITUNGAN": SPK, MANDOR, NILAI SPK, lalu tabel item:
No, Uraian Pekerjaan, Sat, Volume Terkontrak, Harga Satuan Nego, Jumlah SPK.
SPK 01 punya 18 item upah, total = 985.606.696 (cocok dengan NILAI SPK). Contoh item:
Mobilisasi Alat (Ls 1×10jt), Mess Pekerja (Ls 1×3jt), Upah Bongkar Paving (m2 7.808×1.000),
Upah Cor Beton (m3 4.281,42×65.000), Bekisting (m2 5.748,79×45.000), Wiremesh (kg 135.499×1.100),
Pembesian (kg 68.438×1.400), Borepile (m1 3.060×40.000), dll.
Setelah tabel item ada **grid mingguan** (kolom K+): kode minggu (01, 02, …) dan tanggal
mulai/akhir tiap minggu → volume realisasi per item per minggu.

### 8. detail NILAI (1000+ baris) — Nilai rupiah per item per minggu
Struktur = detail volume tapi isinya nilai (bukan volume): baris 0–2 = nomor & tanggal minggu
(14-Oct, 21-Oct, 28-Oct, 4-Nov, … 3-Feb, plus 23-Sep–7-Okt), baris 3 = total mingguan per SPK.
Total mingguan SPK 01: 151.301.511 / 207.136.015 / 120.965.320 / 117.618.226 / 79.570.631 /
156.828.737 / 53.141.186 / 60.868.778 (MGG 1–8) — sisanya kosong.

### 9. DETAIL OPNAME (47 baris) — Katalog kode item upah (UP)
Header: KODE, URAIAN, VOL, NILAI. Kode UP1–UP28 (upah cor, bekisting, wiremesh, pembesian,
guardrail, sewa base camp/gudang, petugas K3, dsb). Kolom VOL/NILAI di sini = rekap opname
berjalan (mis. UP7 Bekisting: vol 4.933,05 = Rp 221.987.250).

### 10. DETAIL MGG (215 baris) — Kalender minggu
MGG KE, (no), TGL — 1 minggu = 7 hari berturut (MGG 1: 14–20 Okt 24, … MGG 31: ± Juni 25).

## Insight untuk Desain Aplikasi

1. **Entitas inti**: `Project/Paket` → `SPK (mandor)` → `Item RAB (kode UP, satuan,
   volume terkontrak, harga satuan)` → `Opname mingguan (item × minggu → volume & nilai)` →
   `Pengajuan mingguan` → `Maker/pembayaran` → `Kasbon (pemberian & potongan)`.
2. **Waktu = minggu (MGG)** dengan kalender 7 hari; semua rekap relatif terhadap "s.d. MGG N".
3. **Perhitungan baku**: retensi 5%, potongan kasbon, sisa opname (lihat rumus di tab PENGAJUAN).
4. Data sheet berantakan (kolom tertukar, #ERROR!, format angka teks) — aplikasi harus
   punya model data bersih; sheet dipakai sebagai sumber kebenaran bisnis, bukan struktur teknis.
5. Angka di sheet memakai format teks dengan koma ribuan & spasi — parsing wajib dinormalisasi.
