# SPEC: gasopname MVP — Sistem Opname Konstruksi

Status: ready-for-agent
Sumber: hasil grilling (PLAN.md), referensi bisnis (REFERENCE.md, GLOSSARY.md)

## Problem Statement

Perusahaan konstruksi (M C A) mencatat opname pekerjaan, pengajuan mingguan mandor,
kasbon, retensi, dan pembayaran (maker) di Google Spreadsheet. Spreadsheet rawan error
(rumus #ERROR!, kolom tertukar, angka format teks), tidak bisa dipakai bersama, dan
tidak skalabel untuk multi-proyek. Engineer butuh sistem yang benar, cepat diisi, dan
rekapnya otomatis.

## Solution

Aplikasi web (Bahasa Indonesia, desktop-first, interaktif) untuk mengelola proyek,
mandor, SPK, RAB, opname mingguan (MGG), kasbon, pembayaran, dan pengajuan mingguan
dengan snapshot. Semua rekap (retensi, sisa opname, sisa kasbon) dihitung otomatis.
Di-hosting di Cloudflare (Workers + D1), diakses dengan password.

## User Stories

1. Sebagai engineer, saya ingin membuat proyek dengan tanggal mulai, sehingga kalender minggu (MGG) otomatis terbentuk.
2. Sebagai engineer, saya ingin mengelola katalog item per proyek, sehingga uraian upah standar tidak diketik ulang.
3. Sebagai engineer, saya ingin mendaftarkan mandor sekali, sehingga bisa dipakai lintas proyek dan SPK.
4. Sebagai engineer, saya ingin membuat SPK per mandor dengan retensi %, sehingga kontrak tercatat resmi.
5. Sebagai engineer, saya menyusun RAB SPK dari katalog (atau item custom), sehingga nilai SPK terhitung dari Σ item.
6. Sebagai engineer, saya tidak bisa mengubah harga satuan saat kontrak jalan, sehingga sesuai kontrak.
7. Sebagai engineer, saya menginput volume opname per item per minggu, sehingga realisasi lapangan tercatat.
8. Sebagai engineer, saya melihat nilai rupiah terhitung saat mengetik, sehingga input terasa instan.
9. Sebagai engineer, saya diberi warning bila kumulatif melebihi volume kontrak, sehingga over-volume terlihat tapi tidak diblok.
10. Sebagai engineer, saya tidak bisa mengedit opname minggu yang sudah diajukan, sehingga angka pengajuan konsisten.
11. Sebagai engineer, saya mencatat kasbon per mandor (lintas SPK), sehingga utang uang muka terkelola.
12. Sebagai engineer, saya mencatat pembayaran (maker) dan potongan kasbon, sehingga realisasi terverifikasi.
13. Sebagai engineer, saya membuat pengajuan mingguan yang terhitung otomatis (opname s.d. MGG, retensi, sisa opname, sisa kasbon), sehingga tidak ada rumus manual.
14. Sebagai engineer, angka pengajuan ter-freeze saat berstatus diajukan, sehingga dokumen tidak berubah setelah dikirim.
15. Sebagai engineer, saya mengubah status pengajuan draft → diajukan → dibayar, sehingga siklus pembayaran jelas.
16. Sebagai engineer, saya melihat dashboard semua proyek/SPK + grafik tren mingguan, sehingga kondisi keuangan terpantau.
17. Sebagai pengguna, aplikasi dilindungi password, sehingga data keuangan tidak publik.
18. Sebagai pengguna, semua angka tampil format Rupiah, sehingga mudah dibaca.
19. Sebagai engineer, SPK/proyek selesai berstatus "selesai" (bukan terhapus), sehingga riwayat tetap ada.
20. Sebagai engineer, form reaktif memberi feedback (toast, loading), sehingga jelas aksi berhasil.

## Implementation Decisions

- Stack & batasan kode: lihat ADR-001 (Hono + D1 di Workers; React/Vite; maks 700 baris/file).
- Skema D1: projects, mandors, spks, catalog_items, rab_items, weeks, opnames,
  payments, kasbons, submissions (snapshot_json). Lihat PLAN.md §3.
- Minggu dibuat otomatis berurutan 7 hari dari tanggal mulai proyek.
- Logika keuangan (nilai opname, retensi, sisa opname, sisa kasbon, over-volume)
  berada di modul perhitungan murni (pure functions) terpisah dari API & UI.
- Snapshot pengajuan: JSON freeze dibuat saat transisi draft → diajukan.
- API: REST JSON di Hono, validasi Zod, skema share frontend↔backend.
- Frontend: TanStack Router/Query, react-hook-form + zod, shadcn/ui, toast (sonner),
  grafik (recharts). UI Bahasa Indonesia, Rp dengan pemisah ribuan titik.
- Proteksi: middleware password (secret Workers env).
- Seed data SPK 01 (verifikasi silang vs sheet) hanya di fase pengujian.

## Testing Decisions

- Seam utama: **API HTTP** (Hono app diuji via `app.request`) + **modul perhitungan murni**
  (unit test tanpa I/O). UI diuji sampai typecheck/build lolos; verifikasi manual via tunnel.
- Semua rumus keuangan diuji unit: retensi per-SPK, sisa opname, sisa kasbon,
  snapshot freeze, deteksi over-volume, normalisasi angka.
- Kasus uji kalibrasi dari data sheet SPK 01 (nilai 985.606.696; kasbon 705.432.649;
  opname MGG 1 = 151.301.511; retensi 5%).
- CI lokal: lint + typecheck + test harus hijau sebelum ticket selesai.
- **Penggunaan skills WAJIB di semua tahap** (build & pengujian):
  - Build UI: `frontend-design`, `vercel-react-best-practices`, `vercel-composition-patterns`,
    komponen via **MCP shadcn**.
  - Implementasi per ticket: `test-driven-development` (RED-GREEN-REFACTOR), `tdd`.
  - Debugging saat gagal: `systematic-debugging`.
  - Review pra-selesai: `requesting-code-review` + `code-review` (mattpocock) per
    alur `implement-spec`, dan audit UI `web-design-guidelines`.
  - Commit: `git-commit` + `git-guardrails-claude-code`.
  - Deploy & tunnel: `wrangler` (Cloudflare quick tunnel untuk review manual).
  - Alur kerja tiket: `to-spec` → `to-tickets` → `implement-spec`.
  - Setelah kegagalan/koreksi user: `self-improving-agent` untuk merekam pelajaran.

## Out of Scope

- Export file (Excel/CSV/PDF) — dihapus dari rencana.
- Multi-user/role & otorisasi per mandor (fase berikutnya).
- Tulis-balik ke Google Sheets; kredensial GCP tidak dipakai.
- Mobile-native / mobile-first layout (desktop-first, mobile-friendly menyusul).
- Fitur backup; pembatalan proyek (hanya aktif|selesai); perubahan harga kontrak.
