# DESIGN.md - gasopname

## Identitas
gasopname adalah lembar kerja opname mingguan untuk engineer konstruksi: pengganti Google Sheets
"OPNAME BOBOL KARANGJATI". Audiens: 1 engineer admin (desktop-first), full Bahasa Indonesia.
Kepribadian: kertas kerja teknik yang rapi, tenang, angka adalah bintangnya.

## Palet (2 warna inti + 1 aksen, netral di luar itu - R-29)
- inti 1: tinta teal pekat `#0E7490` (aksi utama, angka penting) - alasan: warna tinta pulpen teknik,
  bukan biru SaaS default
- inti 2: tinta teks `#1A2B33` - alasan: teks gelap kebiruan agar tabel terbaca lama tanpa lelah
- aksen: oranye survei `#C2570B` - alasan: hanya untuk peringatan over-volume & error (konvensi alat ukur)
- netral: kertas `#F7F7F4`, lembar putih `#FFFFFF`, garis rule `#D9DEDB` - alasan: metafora lembar kerja
- Mode terang saja (R-21): alasan tertulis - dipakai di lapangan/kantor siang, sheet cetak adalah referensi
  mental user; dark mode tidak diminta dan tidak ada alasan brand.

## Tipografi (R-06, alasan tertulis)
- Archivo: display + UI. Alasan: grotesk kerja dengan angka rapat, karakter "dokumen teknis",
  bukan Inter/Geist default.
- JetBrains Mono: KHUSUS angka & uang (tabular-nums). Alasan: kolom uang harus rata kanan persis
  seperti lembar SPK; bukan estetika terminal (dose: angka saja, tidak pernah untuk heading).

## Layout (R-05)
Sidebar putih tipis (navigasi aktual 6 menu, semua nyata) + konten "lembar" bergaris rule 1px,
maks 6xl, rata kiri. Form di kiri (360px), daftar di kanan - mengikuti alur kerja isi-lalu-lihat.
Struktur tiap halaman mengikuti konten aslinya, bukan template hero+cards.

## Dial
ENERGY 1 / RHYTHM 1 / MOTION 1 - alasan: alat kerja harian; tenang, seragam, tanpa animasi
selain hover/focus & feedback aksi (toast).

## Motif identitas
Garis rule vertikal-halus ala buku besar + angka mono teal. Logo: teks "gasopname" dengan suku
"yuk" berwarna inti. Tidak ada grid dekoratif, glow, glass, gradien (R-01/R-07/R-10/R-13: tidak dipakai).

## Keadaan UI (R-27)
Setiap daftar wajib: memuat ("Memuat…"), kosong (teks ajakan + langkah), error (toast + teks).
