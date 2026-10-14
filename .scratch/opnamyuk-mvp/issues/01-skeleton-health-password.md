# 01: Skeleton proyek + D1 + password gate (tracer bullet end-to-end)

**What to build:** Website minimal yang sudah jalan end-to-end: Vite+React+Tailwind+shadcn
di Pages, Hono API di Workers dengan D1 ter-bind, satu endpoint `/api/health` yang menjawab
{ok:true} dari DB, satu halaman dashboard stub berisi teks dari API, dan middleware password.
User bisa buka URL tunnel, masukkan password, dan melihat halaman memanggil API nyata.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `npm run dev` (Workers + frontend) jalan lokal; `/api/health` mengembalikan {ok:true} via D1
- [ ] Password middleware: request tanpa kredensial → 401; dengan password benar → lolos
- [ ] Halaman web menampilkan data dari `/api/health`; lint + typecheck + test hijau
- [ ] File terpanjang < 700 baris; struktur folder modular (ADR-001)
