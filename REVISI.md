# REVISI UI/ALUR — catatan berjalan (ditulis per instruksi user)

Status: MENGUMPULKAN revisi. Eksekusi menyeluruh SETELAH user bilang semua revisi sudah disampaikan.

## R1 — Menu Proyek (form/modal Proyek Baru)
- Field identitas: Nama Paket, Perusahaan, Site Engineer, **Project Manager (field baru)**, Tanggal Mulai Kontrak.
- Bagian **"Tambahkan Pekerjaan"** (level PROYEK, bukan SPK): daftar item pekerjaan, tiap item:
  Volume, Satuan, Harga Satuan RAB -> Jumlah RAB (vol x harga, otomatis), Harga Satuan RAP -> Jumlah RAP (vol x harga, otomatis).
- Item pekerjaan ini adalah master di level proyek. TIDAK langsung jadi RAB SPK.

## R2 — Menu SPK (form/modal SPK Baru)
- Field: Nama Paket, Nama Mandor, No SPK, Retensi, **Sistem Pembayaran (field baru)**.
- Lalu **pilih Pekerjaan** (dari daftar pekerjaan level proyek, R1) + **input Harga Satuan Kontrak** (ini biaya sisi mandor; BUKAN RAP).
- RAP tetap milik proyek; Harga Satuan Kontrak milik SPK.

## R3 — Database
- RESET/kosongkan DB sekarang. TANPA seed ulang. Data fiktif nanti bila diminta (belum sekarang).

## Keputusan istilah
- RAB = harga owner/kontrak di level proyek. RAP = anggaran pelaksanaan di level proyek (bukan biaya mandor).
- Harga Satuan Kontrak = harga per mandor di level SPK (diinput saat buat SPK).

## R2 jawaban user (terkunci)
- Sistem Pembayaran = metode pembayaran: BG 30 Hari, Cash, dll (pilihan dropdown, bisa bertambah).
- Satu SPK bisa memilih LEBIH DARI 1 pekerjaan (subset dari pekerjaan proyek, bukan harus semua).
- Nilai SPK otomatis = SUM(vol pekerjaan terpilih x Harga Satuan Kontrak) atas semua pekerjaan terpilih.

## R4 — Menu Opname (jawaban user)
- Opname tetap INPUT MANUAL.
- Ada tombol **"Opname Baru"** (modal) berisi: Nama Mandor, Nama Paket, Nomor SPK, Minggu Ke. + tombol **search universal** (bisa mencari dari semua aspek/field).
- Search universal = di dalam modal Opname Baru (filter pilihan lintas field). KONFIRMASI user: "ya benar".
- **Detail Opname** (usulan saya DISETUJUI user, plus revisi):
  - Header: No SPK, Nama Paket, Nama Mandor, Minggu Ke + rentang tanggal, status terkunci/bisa edit.
  - Tabel per pekerjaan: nama, satuan, volume minggu ini, harga satuan kontrak, jumlah (otomatis), volume kumulatif vs kontrak + sisa + tanda over-volume, % progres per item.
  - TAMBAHAN user: **akumulasi Total Jumlah Opname s/d minggu ini**.
  - Footer: total opname minggu ini, retensi, potongan kasbon, nilai dibayarkan.

## R5-jawaban: TIDAK ADA LOCK (jawaban user)
- "Apapun jangan buat terkunci, saya bisa mengedit datanya lagi" -> data opname/pengajuan SELALU bisa diedit.
- Konfirmasi opname=pengajuan: simpan langsung jadi pengajuan, TANPA penguncian.

## R6 — Realisasi (pertanyaan user ke saya)
- User tanya: bagian Realisasi dibuatkan menu baru atau bagaimana? -> SAYA HARUS MENYAMPAIKAN OPSI.
- Menu Pengajuan TIDAK terpisah lagi: **Buat Opname = langsung Pengajuan** (disatukan dalam menu Opname).
- (implikasi teknis: flow draft->submit digabung; akan saya rancang & laporkan saat eksekusi)

## R6-KEPUTUSAN (disetujui user)
- Realisasi = bagian di dalam menu Opname (per pengajuan mingguan): tanggal cair + nominal + metode (BG 30 Hari/Cash), nyambung ke angka pengajuan.
- Kasbon = menu sendiri: daftar kasbon per mandor + saldo berjalan (total kasbon - terpotong dari opname).
- Struktur menu final: Dashboard, Proyek, SPK, Opname (opname=pengajuan+realisasi), Kasbon. Menu Pengajuan DIHAPUS.
- Penguncian data DIHAPUS total: semua data selalu bisa diedit.

## Status: FASE PENGUMPULAN REVISI SELESAI (user: "Lanjut apalagi?") -> lanjut EKSEKUSI dengan skills.
## Eksekusi: WAJIB skills (antislop during, TDD, e2e api+browser).


## R7 — Dead code (instruksi user)
- Hapus semua dead code akibat revisi: routes katalog lama, rab_items references, submissions stub, shared/calc yang tak terpakai, fungsi lama tak terpakai, test lama.
- Verifikasi: tidak ada import ke modul mati, tsc bersih, grep kosong.


## R8 — CRUD Penuh (14 Okt 2026)
- Semua entitas bisa EDIT & HAPUS dari UI (tombol di tiap baris): Proyek, Pekerjaan (RAB/RAP), Mandor, SPK (+ item SPK), Opname (volume per minggu), Realisasi, Kasbon.
- Modal edit = form yang sama, terisi data eksisting.
- Hapus selalu konfirmasi via dialog.
- TANPA proteksi/lock (sesuai R5).


## R9 — Mobile-Friendly (14 Okt 2026)
Status: PERENCANAAN (menunggu persetujuan user sebelum eksekusi).

Masalah kondisi sekarang:
- Sidebar tetap 240px (w-60) makan layar di ponsel, main px-10 (padding desktop).
- Tabel lebar (Proyek 7 kolom, Detail Opname 9 kolom) meluap di ponsel.
- Grid 2/3/4 kolom di modal & rekap tidak turun jadi 1 kolom.
- Tombol aksi Edit/Hapus kecil (h-8) di dekat target jempol.

Rencana (mengikuti skill antislop-layoutmobile, bukan desktop yang dikecilkan):
1. Navigasi: sidebar jadi bottom nav (ikon + label, 5 menu, aman safe-area) di layar sempit; sidebar tetap untuk desktop/tablet.
2. Tabel lebar -> scroll container dengan tepi halus DI LAYAR SEMPIT SAJA (data operasional tetap tabel, tidak dirusak jadi kartu); padding & type turun ke skala mobile.
3. Grid modal/rekap: grid-cols-1 di mobile, 2/4 kolom mulai sm/md.
4. Tap target: minimal 44px, gap antar tombol (tombol Edit/Hapus tetap ringkas di desktop).
5. Tiga keadaan lebar: ponsel (nav bawah, 1 kolom), tablet (2 kolom), desktop (sidebar, grid penuh) — bukan 2 keadaan.
6. Verifikasi di lebar 390px & 768px & 1440px via browser; tanpa scroll horizontal; menu bawah tidak menutup konten.


## R10 — Rombak Dashboard (14 Okt 2026, disetujui)
- Kartu ringkasan uang: Total SPK, Total opname, Retensi tertahan, Realisasi terbayar, Sisa SPK, Total kasbon.
- Progres per proyek (bar % kumulatif opname vs kontrak).
- Bagian "Minggu ini": nilai diajukan per SPK + belum realisasi.
- Tabel SPK lebih kaya: paket, mandor, progres, realisasi, sisa.
- Proyek & mandor teratas. TANPA aksi cepat (sudah ada menu).
- Interaktif & user-friendly.

## R11 — Rombak warna (disetujui)
- Tema baru "segar moderen": putih bersih, teal lebih terang, aksen kuning/amber.
- Tetap terang, kontras WCAG AA dijaga.


## R12 — Ganti nama "gasopname" + bersih-bersih (disetujui 14 Okt 2026)
- Nama project: opnamyuk -> gasopname (title, wrangler, kode, docs, sessionStorage key, ADR).
- Dead code dihapus: shared/recap.ts, shared/types.calc.ts, shared/calc.ts, tests/calc.test.ts (alur lama), tests/e2e_smoke*.py (alur lama).
- Repo GitHub dibuat & push (akun EnamTiga).


## R14 — Landing page + production polish + noindex
- index.html: title, description, favicon.svg di-link, lang="id", meta robots noindex
- robots.txt Disallow all + header X-Robots-Tag: noindex di server (tidak bisa dicari search engine)
- Landing page interaktif (src/pages/landing.tsx): hero stagger entrance, demo slider volume -> nilai opname/retensi live, kartu fitur 3D tilt, scroll reveal, press feedback, prefers-reduced-motion dihormati; masuk aplikasi sekali per perangkat (localStorage)
