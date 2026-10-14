# 06: Kasbon + pembayaran (maker)

**What to build:** Halaman /kasbon: catat kasbon per mandor (nominal, tanggal, catatan,
opsional terkait 1 SPK) dan potongan kasbon. Halaman /pembayaran: catat pembayaran maker
per SPK per minggu (nominal, tanggal, catatan). Sisa kasbon mandor = Σ kasbon − Σ potongan,
tampil live. Semua terhubung ke rumus sisa opname di modul perhitungan.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] CRUD kasbon (terikat mandor, opsional SPK) + potongan kasbon via API
- [ ] CRUD pembayaran maker per SPK+minggu via API
- [ ] Sisa kasbon mandor terhitung dari modul perhitungan (unit test)
- [ ] Validasi: nominal integer rupiah > 0; pesan error Bahasa Indonesia
- [ ] UI shadcn interaktif; lint/typecheck/test hijau
