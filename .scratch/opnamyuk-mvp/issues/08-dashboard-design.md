# 08: Dashboard + grafik tren + desain final

**What to build:** Halaman `/` menjadi dashboard: ringkasan semua proyek & SPK aktif
(nilai SPK, opname s.d. minggu berjalan, retensi tertahan, sisa opname, sisa kasbon),
grafik tren opname mingguan per SPK (recharts), navigasi lengkap. Desain final menerapkan
arah industrial engineering (slate gelap + safety-amber, Archivo + JetBrains Mono, tabel
padat gaya lembar kerja, angka tabular) sesuai skill frontend-design. Audit menyeluruh
dengan skill web-design-guidelines sampai bersih.

**Blocked by:** 07

**Status:** ready-for-agent

- [ ] Dashboard menampilkan angka agregat dari modul perhitungan (test API agregasi)
- [ ] Grafik tren mingguan per SPK interaktif (tooltip, hover)
- [ ] Desain sesuai arah visual PLAN.md §5; konsisten semua halaman
- [ ] Audit web-design-guidelines: semua temuan material diperbaiki
- [ ] Lint/typecheck/test hijau; tidak ada file > 700 baris
