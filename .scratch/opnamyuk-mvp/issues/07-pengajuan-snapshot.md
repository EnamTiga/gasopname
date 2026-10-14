# 07: Pengajuan mingguan (snapshot + status alur)

**What to build:** Halaman /pengajuan: pilih SPK + minggu → sistem hitung rekap lengkap
(total opname s.d. MGG, retensi, realisasi+potongan, potongan kasbon, sisa opname, sisa
kasbon) seperti tab PENGAJUAN di sheet. Simpan sebagai draft. Transisi draft → diajukan
membekukan angka (snapshot_json) dan mengunci opname minggu itu. Alur status
draft → diajukan → dibayar. Daftar pengajuan per SPK.

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] API hitung rekap dari modul perhitungan; test angka sesuai kalibrasi sheet
- [ ] Transisi draft→diajukan menyimpan snapshot; API menolak edit opname minggu tsb
- [ ] Status hanya maju (tidak bisa dibayar→diajukan); test transisi ilegal → 422
- [ ] UI: detail rekap rapi ala lembar kerja; toast tiap aksi
- [ ] Lint/typecheck/test hijau
