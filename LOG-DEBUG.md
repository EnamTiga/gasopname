# LOG DEBUGGING UI — gasopname (14 Okt 2026)

## Status saat ini
- **Backend API (Hono + D1 di wrangler, port 8787): SEHAT** ✅
  - `/api/health` → 200 `{"ok":true}`
  - Password middleware aktif: tanpa header → 401; salah → 401; benar → 200
  - **E2E API 27/27 LOLOS** (tests/e2e_smoke.py): proyek → minggu otomatis → mandor → katalog → SPK+RAB (nilai otomatis 250jt) → opname MGG1/MGG2 → kasbon → potongan kasbon → rekap angka persis (175.000.000 / 8.750.000 / 10.000.000 / 156.250.000) → pengajuan draft → submit (snapshot freeze) → opname terkunci (423) → dibayar → payment maker → rekap MGG3 (sisa 56.250.000)
  - Unit tests Vitest: 48/48 hijau; typecheck tsc bersih
- **Frontend (Vite dev, port 5173): BUG AKTIF** ⚠️
  - Halaman login (AuthGate) muncul & login berhasil
  - Dashboard pernah tampil dengan data live (Proyek 1, SPK Aktif 1, Rp250.000.000, tabel SPK 01/E2E) ✅
  - **Gejala:** beberapa detik setelah load, DOM root tiba-tiba kosong (mount/unmount loop); kadang UI hidup, kadang kosong; klik nav kadang tidak merespons
  - Tidak ada console error yang tertangkap (React 19 melempar error tanpa jejak di console headless)

## Kronologi investigasi (berurutan)
1. `vite.config.ts` BERTERUSAN ditimpa kembali ke template default (tanpa alias `@`, tanpa proxy `/api`, tanpa plugin tailwind) — penyebab error "Failed to resolve import @/pages/dashboard". → **Solusi sementara: pindah ke `vite.config.mts`** (tidak ditimpa lagi). File .ts dibuang.
2. `src/main.tsx` juga BERTERUSAN ditimpa ke template create-vite (`StrictMode` + `App.tsx`), menghapus perbaikan saya (guard double-createRoot, ErrorBoundary). Terbukti: tulis via `write_file` → dalam <1 detik isi kembali template; tulis via kernel Python langsung → bertahan. Dugaan: ada formatter/restore otomatis di tooling Hermes yang me-restore file hasil scaffold `npm create vite`.
3. Ditemukan error React "createRoot() on a container that has already been passed" → root cause double-mount loop (main.tsx dieksekusi ulang dengan root baru tiap kali HMR full reload + file tertimpa bolak-balik StrictMode/non-StrictMode).
4. `index.css` sempat ditimpa template juga (sudah dikembalikan: tailwind + tw-animate-css + shadcn + theme font).
5. Penambahan `ErrorBoundary` (src/components/error-boundary.tsx) — file ini BERTAHAN (tidak ikut ditimpa).
6. `AuthGate` sudah dibungkus di App.tsx — login flow bekerja (terverifikasi via agent-browser: isi password → masuk → dashboard tampil).
7. `server.watch.ignored` ditambah `.wrangler/**` di vite.config.mts (sebelumnya vite full-reload setiap D1 sqlite berubah).

## Dugaan kuat penyebab bug UI
Kombinasi: (a) main.tsx bolak-balik ditimpa → StrictMode on/off + createRoot ganda → React unmount loop; (b) react-refresh HMR kehilangan sinkron. BUKAN bug di kode halaman (API & UI pernah tampil benar-benar lengkap dengan data live).

## Langkah berikutnya
1. Kunci main.tsx final (guard root + ErrorBoundary + tanpa StrictMode) — tulis via kernel, VERIFIKASI isi bertahan, baru reload browser.
2. Jika masih blank: uji build produksi (`vite build` + serve dist via wrangler assets) yang tidak memakai HMR sama sekali — mode inilah yang akan dipakai production & tunnel.
3. Commit semua perbaikan.

## Skrip & artefak pengujian
- `tests/e2e_smoke.py` — E2E API lengkap (27 assertions) — SEMUA LOLOS
- `tests/*.test.ts` — 48 unit tests — SEMUA LOLOS
- agent-browser (skill vercel-labs/agent-browser) — dipakai untuk uji UI
- chrome-devtools skill (chromedevtools/chrome-devtools-mcp) sudah ter-install & didaftarkan di Hermes config (mcp_servers.chrome-devtools) — aktif setelah restart Hermes
