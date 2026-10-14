// Routes SPK revisi (REVISI.md R2): pilih beberapa pekerjaan proyek + harga satuan kontrak per item
import { Hono } from "hono";
import type { AppEnv } from "../env";


async function recomputeSpkValue(env: AppEnv, spkId: number): Promise<number> {
  const { results } = await env.DB.prepare(
    `SELECT si.unit_price, pi.volume FROM spk_items si
     JOIN project_items pi ON pi.id = si.project_item_id WHERE si.spk_id = ?1`,
  ).bind(spkId).all();
  const total = (results as Array<{ unit_price: number; volume: number }>).reduce(
    (sum, r) => sum + Math.round(r.volume * r.unit_price), 0,
  );
  await env.DB.prepare("UPDATE spks SET value = ?1 WHERE id = ?2").bind(total, spkId).run();
  return total;
}

export function registerSpkRoutes(app: Hono<{ Variables: {} }>) {
  app.post("/api/spks", async (c) => {
    const env = c.env as AppEnv;
    const b = await c.req.json().catch(() => null);
    if (!Number.isInteger(b?.project_id) || !Number.isInteger(b?.mandor_id) || !b?.no_spk?.trim()) {
      return c.json({ error: "Nama paket, mandor, dan no SPK wajib diisi" }, 400);
    }
    const retention = Number.isInteger(b.retention_pct) ? b.retention_pct : 5;
    if (retention < 0 || retention > 100) return c.json({ error: "Retensi harus 0 sampai 100 persen" }, 400);
    const items = Array.isArray(b.items) ? b.items : [];
    if (items.length === 0) return c.json({ error: "Pilih minimal satu pekerjaan" }, 400);
    for (const it of items) {
      if (!Number.isInteger(it?.project_item_id)) return c.json({ error: "Pekerjaan tidak valid" }, 400);
      if (!Number.isInteger(it?.unit_price) || it.unit_price < 0) return c.json({ error: "Harga satuan kontrak harus rupiah utuh" }, 400);
    }

    const project = await env.DB.prepare("SELECT id FROM project_items WHERE project_id = ?1 LIMIT 1")
      .bind(b.project_id).first();
    if (!project) return c.json({ error: "Proyek belum punya pekerjaan. Tambahkan pekerjaan dulu di menu Proyek." }, 400);

    const row = await env.DB.prepare(
      "INSERT INTO spks (project_id, mandor_id, no_spk, retention_pct, payment_method, work_type) VALUES (?1,?2,?3,?4,?5,?6) RETURNING id, project_id, mandor_id, no_spk, retention_pct, payment_method, value, status",
    )
      .bind(b.project_id, b.mandor_id, b.no_spk.trim(), retention, b.payment_method?.trim() || null, b.work_type?.trim() || null)
      .first();
    if (!row) return c.json({ error: "Gagal membuat SPK" }, 500);

    for (const it of items) {
      await env.DB.prepare(
        "INSERT INTO spk_items (spk_id, project_item_id, unit_price) VALUES (?1,?2,?3)",
      ).bind(row.id, it.project_item_id, it.unit_price).run();
    }
    const value = await recomputeSpkValue(env, row.id as number);
    return c.json({ spk: { ...row, value }, value }, 201);
  });

  app.get("/api/spks", async (c) => {
    const env = c.env as AppEnv;
    const { results } = await env.DB.prepare(
      "SELECT id, project_id, mandor_id, no_spk, retention_pct, payment_method, value, status FROM spks ORDER BY id DESC",
    ).all();
    return c.json({ spks: results });
  });

  app.get("/api/spks/:id", async (c) => {
    const env = c.env as AppEnv;
    const id = Number(c.req.param("id"));
    const spk = await env.DB.prepare(
      "SELECT id, project_id, mandor_id, no_spk, retention_pct, payment_method, value, status FROM spks WHERE id = ?1",
    ).bind(id).first();
    if (!spk) return c.json({ error: "SPK tidak ditemukan" }, 404);
    const { results } = await env.DB.prepare(
      `SELECT si.id, si.spk_id, si.project_item_id, si.unit_price,
              pi.description, pi.unit, pi.volume, pi.price_rab, pi.price_rap
       FROM spk_items si JOIN project_items pi ON pi.id = si.project_item_id
       WHERE si.spk_id = ?1 ORDER BY si.id`,
    ).bind(id).all();
    return c.json({ spk, items: results });
  });

  // Ubah harga satuan kontrak satu item SPK (data selalu bisa diedit, tanpa lock)
  app.put("/api/spks/:id/items/:itemId", async (c) => {
    const env = c.env as AppEnv;
    const itemId = Number(c.req.param("itemId"));
    const b = await c.req.json().catch(() => null);
    if (!Number.isInteger(b?.unit_price) || b.unit_price < 0) {
      return c.json({ error: "Harga satuan kontrak harus rupiah utuh" }, 400);
    }
    const row = await env.DB.prepare(
      "UPDATE spk_items SET unit_price = ?1 WHERE id = ?2 AND spk_id = ?3 RETURNING id",
    ).bind(b.unit_price, itemId, Number(c.req.param("id"))).first();
    if (!row) return c.json({ error: "Item SPK tidak ditemukan" }, 404);
    const value = await recomputeSpkValue(env, Number(c.req.param("id")));
    return c.json({ ok: true, value });
  });

  // Edit header SPK (tanpa lock): no SPK, retensi, metode bayar, mandor
  app.put("/api/spks/:id", async (c) => {
    const env = c.env as AppEnv;
    const id = Number(c.req.param("id"));
    const b = await c.req.json().catch(() => null);
    if (!Number.isInteger(b?.project_id) || !Number.isInteger(b?.mandor_id) || !b?.no_spk?.trim()) {
      return c.json({ error: "Nama paket, mandor, dan no SPK wajib diisi" }, 400);
    }
    const retention = Number.isInteger(b.retention_pct) ? b.retention_pct : 5;
    if (retention < 0 || retention > 100) return c.json({ error: "Retensi harus 0 sampai 100 persen" }, 400);
    const row = await env.DB.prepare(
      "UPDATE spks SET project_id=?1, mandor_id=?2, no_spk=?3, retention_pct=?4, payment_method=?5 WHERE id=?6 RETURNING id, project_id, mandor_id, no_spk, retention_pct, payment_method, value, status",
    ).bind(b.project_id, b.mandor_id, b.no_spk.trim(), retention, b.payment_method?.trim() || null, id).first();
    if (!row) return c.json({ error: "SPK tidak ditemukan" }, 404);
    return c.json({ spk: row });
  });

  // Hapus SPK + seluruh item & opname turunannya
  app.delete("/api/spks/:id", async (c) => {
    const env = c.env as AppEnv;
    const id = Number(c.req.param("id"));
    await env.DB.prepare("DELETE FROM kasbons WHERE spk_id=?1").bind(id).run();
    await env.DB.prepare("DELETE FROM realizations WHERE spk_id=?1").bind(id).run();
    await env.DB.prepare("DELETE FROM opnames WHERE spk_item_id IN (SELECT id FROM spk_items WHERE spk_id=?1)").bind(id).run();
    await env.DB.prepare("DELETE FROM spk_items WHERE spk_id=?1").bind(id).run();
    const row = await env.DB.prepare("DELETE FROM spks WHERE id=?1 RETURNING id").bind(id).first();
    if (!row) return c.json({ error: "SPK tidak ditemukan" }, 404);
    return c.json({ ok: true });
  });

  // Lepas satu pekerjaan dari SPK
  app.delete("/api/spks/:id/items/:itemId", async (c) => {
    const env = c.env as AppEnv;
    await env.DB.prepare("DELETE FROM opnames WHERE spk_item_id=?1").bind(Number(c.req.param("itemId"))).run();
    const row = await env.DB.prepare("DELETE FROM spk_items WHERE id=?1 AND spk_id=?2 RETURNING id")
      .bind(Number(c.req.param("itemId")), Number(c.req.param("id"))).first();
    if (!row) return c.json({ error: "Item SPK tidak ditemukan" }, 404);
    const value = await recomputeSpkValue(env, Number(c.req.param("id")));
    return c.json({ ok: true, value });
  });
}
