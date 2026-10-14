// Test environment: Hono app dengan D1 lokal (miniflare better-sqlite3 via wrangler unstable_dev
// terlalu berat; pakai D1 adapter in-memory dari @miniflare/d1 bila tersedia, else mock D1).
// Pendekatan: buat helper D1DrizzleLike kecil di atas better-sqlite3? Tidak — gunakan
// "test-d1" helper: implementasi minimal D1Database di atas better-sqlite3.
