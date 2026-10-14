// Routes kasbon revisi: kasbon per mandor (lintas SPK) + saldo berjalan
import { Hono } from "hono";
import type { AppEnv } from "../env";

function validAmount(amount: unknown): amount is number {
  return Number.isInteger(amount) && (amount as number) > 0;
}

export function registerKasbonRoutes(app: Hono<{ Variables: {} }>) {
  app.post("/api/kasbons", async (c) => {
    const env = c.env as AppEnv;
    const b = await c.req.json().catch(() => null);
    if (!Number.isInteger(b?.mandor_id)) return c.json({ error: "Mandor wajib dipilih" }, 400);
    if (!validAmount(b?.amount)) return c.json({ error: "Nominal harus rupiah utuh di atas 0" }, 400);
    if (!b?.date) return c.json({ error: "Tanggal wajib diisi" }, 400);
    const row = await env.DB.prepare(
      "INSERT INTO kasbons (mandor_id, spk_id, amount, date, note) VALUES (?1,?2,?3,?4,?5) RETURNING id, mandor_id, spk_id, amount, date, note",
    )
      .bind(b.mandor_id, Number.isInteger(b.spk_id) ? b.spk_id : null, b.amount, b.date, b.note?.trim() || null)
      .first();
    return c.json({ kasbon: row }, 201);
  });

  app.get("/api/kasbons", async (c) => {
    const env = c.env as AppEnv;
    const mandorId = Number(c.req.query("mandor_id"));
    const stmt = Number.isInteger(mandorId)
      ? env.DB.prepare("SELECT id, mandor_id, spk_id, amount, date, note FROM kasbons WHERE mandor_id = ?1 ORDER BY date").bind(mandorId)
      : env.DB.prepare("SELECT id, mandor_id, spk_id, amount, date, note FROM kasbons ORDER BY date");
    const { results } = await stmt.all();
    return c.json({ kasbons: results });
  });

  // Saldo kasbon per mandor: total kasbon - total yang sudah terpotong lewat opname (potongan kasbon mingguan dicatat via potongan field? sederhana: total kasbon saja + ringkasan)
  app.get("/api/kasbons/saldo", async (c) => {
    const env = c.env as AppEnv;
    const { results } = await env.DB.prepare(
      `SELECT m.id AS mandor_id, m.name,
              COALESCE((SELECT SUM(amount) FROM kasbons WHERE mandor_id = m.id), 0) AS total_kasbon
       FROM mandors m ORDER BY m.name`,
    ).all();
    return c.json({ saldo: results });
  });

  app.put("/api/kasbons/:id", async (c) => {
    const env = c.env as AppEnv;
    const b = await c.req.json().catch(() => null);
    if (!Number.isInteger(b?.mandor_id)) return c.json({ error: "Mandor wajib dipilih" }, 400);
    if (!validAmount(b?.amount)) return c.json({ error: "Nominal harus rupiah utuh di atas 0" }, 400);
    if (!b?.date) return c.json({ error: "Tanggal wajib diisi" }, 400);
    const row = await env.DB.prepare(
      "UPDATE kasbons SET mandor_id=?1, spk_id=?2, amount=?3, date=?4, note=?5 WHERE id=?6 RETURNING id, mandor_id, spk_id, amount, date, note",
    ).bind(b.mandor_id, Number.isInteger(b.spk_id) ? b.spk_id : null, b.amount, b.date, b.note?.trim() || null, Number(c.req.param("id"))).first();
    if (!row) return c.json({ error: "Kasbon tidak ditemukan" }, 404);
    return c.json({ kasbon: row });
  });

  app.delete("/api/kasbons/:id", async (c) => {
    const env = c.env as AppEnv;
    const row = await env.DB.prepare("DELETE FROM kasbons WHERE id = ?1 RETURNING id")
      .bind(Number(c.req.param("id"))).first();
    if (!row) return c.json({ error: "Kasbon tidak ditemukan" }, 404);
    return c.json({ ok: true });
  });

}
