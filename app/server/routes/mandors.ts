// Routes mandor (ticket 04)
import { Hono } from "hono";
import type { AppEnv } from "../env";

export function registerMandorRoutes(app: Hono<{ Variables: {} }>) {
  app.post("/api/mandors", async (c) => {
    const env = c.env as AppEnv;
    const body = await c.req.json().catch(() => null);
    if (!body?.name || !String(body.name).trim()) {
      return c.json({ error: "Nama mandor wajib diisi" }, 400);
    }
    try {
      const row = await env.DB.prepare(
        "INSERT INTO mandors (name, bank, account_no, account_name) VALUES (?1,?2,?3,?4) RETURNING id, name, bank, account_no, account_name",
      )
        .bind(String(body.name).trim(), body.bank ?? null, body.account_no ?? null, body.account_name ?? null)
        .first();
      return c.json({ mandor: row }, 201);
    } catch {
      return c.json({ error: "Mandor dengan nama itu sudah ada" }, 409);
    }
  });

  app.get("/api/mandors", async (c) => {
    const env = c.env as AppEnv;
    const { results } = await env.DB.prepare(
      "SELECT id, name, bank, account_no, account_name FROM mandors ORDER BY name",
    ).all();
    return c.json({ mandors: results });
  });

  app.patch("/api/mandors/:id", async (c) => {
    const env = c.env as AppEnv;
    const body = await c.req.json().catch(() => null);
    const fields: string[] = [];
    const vals: unknown[] = [];
    for (const key of ["name", "bank", "account_no", "account_name"] as const) {
      if (body && key in body) {
        fields.push(`${key} = ?`);
        vals.push(body[key]);
      }
    }
    if (!fields.length) return c.json({ error: "Tidak ada data untuk diubah" }, 400);
    vals.push(Number(c.req.param("id")));
    const row = await env.DB.prepare(`UPDATE mandors SET ${fields.join(", ")} WHERE id = ? RETURNING *`)
      .bind(...vals)
      .first();
    if (!row) return c.json({ error: "Mandor tidak ditemukan" }, 404);
    return c.json({ mandor: row });
  });

  app.delete("/api/mandors/:id", async (c) => {
    const env = c.env as AppEnv;
    const id = Number(c.req.param("id"));
    await env.DB.prepare("DELETE FROM kasbons WHERE mandor_id=?1").bind(id).run();
    await env.DB.prepare("DELETE FROM realizations WHERE spk_id IN (SELECT id FROM spks WHERE mandor_id=?1)").bind(id).run();
    await env.DB.prepare("DELETE FROM opnames WHERE spk_item_id IN (SELECT si.id FROM spk_items si JOIN spks s ON s.id=si.spk_id WHERE s.mandor_id=?1)").bind(id).run();
    await env.DB.prepare("DELETE FROM spk_items WHERE spk_id IN (SELECT id FROM spks WHERE mandor_id=?1)").bind(id).run();
    await env.DB.prepare("DELETE FROM spks WHERE mandor_id=?1").bind(id).run();
    const row = await env.DB.prepare("DELETE FROM mandors WHERE id=?1 RETURNING id").bind(id).first();
    if (!row) return c.json({ error: "Mandor tidak ditemukan" }, 404);
    return c.json({ ok: true });
  });
}
