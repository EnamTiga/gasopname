# ADR-001: Stack & Arsitektur gasopname

## Keputusan
- Frontend: React 19 + Vite + TypeScript strict, TanStack Router + Query,
  react-hook-form + zod, Tailwind v4 + shadcn/ui.
- Backend: Hono di Cloudflare Workers, database Cloudflare D1 (SQLite).
- Validasi: Zod schema dishare frontend↔backend (`shared/`).
- Angka: rupiah integer, volume REAL. Tanpa pembulatan (kecuali di belakang koma).
- Auth MVP: password tunggal via middleware Workers (secret env, bukan kode).
- Tanpa export file, tanpa fitur backup.
- Kode: maks 700 baris/file, modular per fitur, logika bisnis di modul teruji.

## Alasan
- Free tier Cloudflare, deploy wrangler lokal, aplikasi data penuh (bukan statis).
- Sheets Google hanya referensi; kebenaran data di D1.

## Konsekuensi
- Skema D1 harus relasional (proyek→SPK→RAB→opname; mandor lintas proyek).
- Snapshot pengajuan disimpan sebagai JSON freeze.
