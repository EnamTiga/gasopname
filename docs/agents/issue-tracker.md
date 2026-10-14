# Issue Tracker

- **Tracker**: local markdown
- **Lokasi issue**: `.scratch/<feature-slug>/issues/NN-<slug>.md`
- **Satu file per ticket**, bernomor urut dependensi (blockers dulu)
- **Blocked by** ditulis sebagai teks di dalam file ticket
- Ticket ditandai `ready-for-agent` saat siap dikerjakan
- Ticket dianggap selesai saat: semua acceptance criteria dicentang + CI hijau (lint, typecheck, test)
