# 03: CRUD Proyek + minggu otomatis + katalog item

**What to build:** Engineer bisa membuat proyek (nama, engineer, perusahaan, tanggal mulai)
dan melihat daftar proyek. Saat proyek dibuat, kalender minggu (MGG 1, 2, 3… 7 hari berurutan)
otomatis terbentuk sampai akhir tahun. Engineer juga mengelola katalog item per proyek
(uraian + satuan): tambah, ubah, arsip. Halaman /proyek dengan form reaktif + toast.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Buat proyek → weeks MGG 1..N terbentuk otomatis (7 hari, mulai tanggal mulai)
- [ ] CRUD katalog item per proyek via API + UI, validasi Zod
- [ ] Proyek bisa diubah status aktif → selesai
- [ ] Test API: create proyek → weeks terbuat; validasi gagal → 400 dengan pesan Indonesia
- [ ] Lint + typecheck + test hijau; UI komponen dari shadcn MCP
