# 04: CRUD Mandor + SPK + RAB

**What to build:** Engineer mendaftarkan mandor (nama, bank, rekening) sekali dan memakainya
lintas proyek. Membuat SPK per proyek: pilih mandor, no SPK, jenis pekerjaan, retensi %
(default 5), status aktif. Menyusun RAB SPK: pilih item katalog (atau custom), volume
terkontrak, harga satuan → nilai SPK otomatis = Σ item. Harga satuan terkunci setelah SPK
aktif (immutable). Halaman /mandor dan /spk.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] CRUD mandor; 1 mandor dipakai di SPK proyek berbeda
- [ ] CRUD SPK dengan retensi % default 5 dan status aktif|selesai
- [ ] RAB: pilih katalog / custom; nilai SPK terhitung dari Σ (volume × harga)
- [ ] Harga satuan tidak bisa diubah via API saat SPK aktif (422), test membuktikan
- [ ] Test API + UI shadcn; lint/typecheck/test hijau
