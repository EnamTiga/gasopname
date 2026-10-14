# 09: Verifikasi end-to-end + seed kalibrasi + deploy tunnel

**What to build:** Suite verifikasi akhir: seed data SPK 01 dari sheet (RAB 18 item,
opname MGG 1–8, 5 kasbon) ke DB lokal, jalankan seluruh test, bandingkan angka aplikasi
vs sheet (nilai SPK 985.606.696; opname MGG 1 = 151.301.511; dst). Lalu deploy lokal via
wrangler dan buka **Cloudflare quick tunnel**, kirim URL ke user untuk review manual.
Perbaiki semua temuan review (code-review + web-design-guidelines) sebelum serah terima.

**Blocked by:** 08

**Status:** ready-for-agent

- [ ] Seed SPK 01; angka rekap aplikasi = angka sheet (dicek otomatis via API)
- [ ] Seluruh suite hijau: lint, typecheck, test, build produksi
- [ ] code-review (skill) selesai; temuan material diperbaiki
- [ ] `wrangler dev` + `cloudflared tunnel --url` hidup; URL dikirim ke user
- [ ] Alur manual end-to-end oleh user: buat proyek → SPK → opname → pengajuan
