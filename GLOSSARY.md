# GLOSSARY — gasopname

Istilah domain (sumber: workbook "OPNAME BOBOL KARANGJATI", lihat REFERENCE.md):

- **Proyek (Project/Paket)** — pekerjaan konstruksi induk. Punya nama, engineer,
  perusahaan, tanggal mulai, status (aktif|selesai). Memiliki banyak SPK.
- **Mandor** — pihak pelaksana yang dikontrak via SPK. Entitas terpisah: 1 mandor bisa
  punya banyak SPK, bisa lintas proyek. Punya data bank/rekening.
- **SPK (Surat Perintah Kerja)** — kontrak kerja per mandor dalam satu proyek.
  Punya no SPK, nilai (rupiah), jenis pekerjaan, persentase retensi (default 5%),
  status (aktif|selesai). Berisi RAB.
- **RAB / Item RAB** — rincian item upah dalam SPK: uraian, satuan (m², m³, kg, Ls, …),
  volume terkontrak, harga satuan. Harga satuan TIDAK boleh berubah selama kontrak jalan.
- **Katalog Item** — master uraian item standar per proyek (tanpa kode), sumber pilihan
  saat menyusun RAB. SPK boleh punya item custom di luar katalog.
- **MGG (Minggu)** — satuan waktu opname. 1 MGG = 7 hari, dibuat otomatis berurutan
  dari tanggal mulai proyek. MGG 1 = minggu pertama.
- **Opname** — pencatatan volume realisasi per item RAB per minggu. Nilai = volume ×
  harga satuan (integer rupiah). Bisa diedit selama pengajuan minggu itu belum dibuat.
- **Over-volume** — kumulatif opname melebihi volume terkontrak. Diberi warning, tidak diblok.
- **Kasbon** — uang muka yang diberikan ke mandor, terikat ke mandor (bisa lintas SPK).
- **Potongan kasbon (kasbon_potong)** — pemotongan dari pembayaran untuk mengembalikan kasbon.
- **Maker** — pembayaran/transfer terverifikasi dari perusahaan ke mandor ("realisasi").
- **Retensi** — persentase (default 5%) dari total opname yang ditahan.
- **Pengajuan (Submission)** — rekap mingguan per SPK. Status: draft → diajukan → dibayar.
  Saat berubah draft→diajukan, angka di-freeze sebagai **snapshot** dan minggu itu terkunci.
- **Sisa Opname** = Total Opname s.d MGG − (Realisasi+Pot + Retensi + Potongan Kasbon)
- **Sisa Kasbon** = total kasbon mandor − total potongan kasbon

Rumus baku diuji di modul perhitungan (lihat PLAN.md §2).
