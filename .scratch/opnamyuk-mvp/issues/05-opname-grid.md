# 05: Input opname mingguan (grid interaktif + kunci otomatis)

**What to build:** Halaman /opname: pilih SPK + minggu → grid semua item RAB, engineer
ketik volume per item, nilai rupiah terhitung live saat mengetik, kumulatif vs kontrak
tampil dengan warning merah bila over-volume (tetap bisa disimpan). Simpan via API.
Minggu yang sudah punya pengajuan berstatus diajukan/dibayar → grid read-only (terkunci).

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Simpan opname (upsert per item per minggu) via API, validasi Zod
- [ ] Nilai live saat mengetik (volume × harga, integer rupiah)
- [ ] Warning over-volume kumulatif, tidak memblokir simpan
- [ ] Grid terkunci ketika minggu sudah diajukan/dibayar (API menolak + UI read-only)
- [ ] Test API: upsert, lock minggu terkunci, over-volume diterima; UI interaktif; semua hijau
