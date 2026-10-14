// Routes proyek revisi (REVISI.md R1): identitas + project_manager + pekerjaan level proyek (RAB/RAP)
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { generateWeeks } from "../../shared/weeks";


export function registerProjectRoutes(app: Hono<{ Variables: {} }>) {
  app.post("/api/projects", async (c) => {
    const env = c.env as AppEnv;
    const b = await c.req.json().catch(() => null);
    if (!b?.name?.trim() || !b?.company?.trim() || !b?.engineer?.trim() || !b?.start_date) {
      return c.json({ error: "Nama paket, perusahaan, site engineer, dan tanggal mulai wajib diisi" }, 400);
    }
    const pm = typeof b.project_manager === "string" && b.project_manager.trim() ? b.project_manager.trim() : null;
    const result = await env.DB.prepare(
      "INSERT INTO projects (name, engineer, company, project_manager, start_date) VALUES (?1,?2,?3,?4,?5) RETURNING id, name, engineer, company, project_manager, start_date, status",
    )
      .bind(b.name.trim(), b.engineer.trim(), b.company.trim(), pm, b.start_date)
      .first();
    if (!result) return c.json({ error: "Gagal membuat proyek" }, 500);

    const weeks = generateWeeks(b.start_date, new Date().toISOString().slice(0, 10));
    for (const wk of weeks) {
      await env.DB.prepare(
        "INSERT INTO weeks (project_id, number, start_date, end_date) VALUES (?1,?2,?3,?4)",
      ).bind(result.id, wk.number, wk.startDate, wk.endDate).run();
    }
    return c.json({ project: result }, 201);
  });

  app.get("/api/projects", async (c) => {
    const env = c.env as AppEnv;
    const { results: projects } = await env.DB.prepare(
      "SELECT id, name, engineer, company, project_manager, start_date, status FROM projects ORDER BY id DESC",
    ).all();
    return c.json({ projects });
  });

  app.get("/api/projects/:id/weeks", async (c) => {
    const env = c.env as AppEnv;
    const pid = Number(c.req.param("id"));
    const { results } = await env.DB.prepare(
      "SELECT id, number, start_date AS startDate, end_date AS endDate FROM weeks WHERE project_id = ?1 ORDER BY number",
    ).bind(pid).all();
    return c.json({ weeks: results });
  });

  // Pekerjaan level proyek
  app.post("/api/projects/:id/items", async (c) => {
    const env = c.env as AppEnv;
    const pid = Number(c.req.param("id"));
    const b = await c.req.json().catch(() => null);
    if (!b?.description?.trim() || !b?.unit?.trim()) {
      return c.json({ error: "Nama pekerjaan dan satuan wajib diisi" }, 400);
    }
    const volume = Number(b.volume);
    const priceRab = Number(b.price_rab);
    const priceRap = Number(b.price_rap);
    if (!Number.isFinite(volume) || volume <= 0) return c.json({ error: "Volume harus angka di atas 0" }, 400);
    if (!Number.isInteger(priceRab) || priceRab < 0) return c.json({ error: "Harga satuan RAB harus rupiah utuh" }, 400);
    if (!Number.isInteger(priceRap) || priceRap < 0) return c.json({ error: "Harga satuan RAP harus rupiah utuh" }, 400);
    const row = await env.DB.prepare(
      "INSERT INTO project_items (project_id, description, unit, volume, price_rab, price_rap) VALUES (?1,?2,?3,?4,?5,?6) RETURNING id, project_id, description, unit, volume, price_rab, price_rap",
    ).bind(pid, b.description.trim(), b.unit.trim(), volume, priceRab, priceRap).first();
    if (!row) return c.json({ error: "Gagal menambah pekerjaan" }, 500);
    return c.json({ item: row }, 201);
  });

  app.put("/api/projects/:id", async (c) => {
    const env = c.env as AppEnv;
    const id = Number(c.req.param("id"));
    const b = await c.req.json().catch(() => null);
    if (!b?.name?.trim() || !b?.company?.trim() || !b?.engineer?.trim() || !b?.start_date) {
      return c.json({ error: "Nama paket, perusahaan, site engineer, dan tanggal mulai wajib diisi" }, 400);
    }
    const pm = typeof b.project_manager === "string" && b.project_manager.trim() ? b.project_manager.trim() : null;
    const row = await env.DB.prepare(
      "UPDATE projects SET name=?1, engineer=?2, company=?3, project_manager=?4, start_date=?5 WHERE id=?6 RETURNING id, name, engineer, company, project_manager, start_date, status",
    ).bind(b.name.trim(), b.engineer.trim(), b.company.trim(), pm, b.start_date, id).first();
    if (!row) return c.json({ error: "Proyek tidak ditemukan" }, 404);
    return c.json({ project: row });
  });

  app.delete("/api/projects/:id", async (c) => {
    const env = c.env as AppEnv;
    const id = Number(c.req.param("id"));
    // Hapus berantai: data turunan proyek ikut hilang (tanpa lock, sesuai R5)
    await env.DB.prepare("DELETE FROM kasbons WHERE spk_id IN (SELECT id FROM spks WHERE project_id=?1)").bind(id).run();
    await env.DB.prepare("DELETE FROM realizations WHERE spk_id IN (SELECT id FROM spks WHERE project_id=?1)").bind(id).run();
    await env.DB.prepare("DELETE FROM opnames WHERE spk_item_id IN (SELECT si.id FROM spk_items si JOIN spks s ON s.id=si.spk_id WHERE s.project_id=?1)").bind(id).run();
    await env.DB.prepare("DELETE FROM spk_items WHERE spk_id IN (SELECT id FROM spks WHERE project_id=?1)").bind(id).run();
    await env.DB.prepare("DELETE FROM spks WHERE project_id=?1").bind(id).run();
    await env.DB.prepare("DELETE FROM weeks WHERE project_id=?1").bind(id).run();
    await env.DB.prepare("DELETE FROM project_items WHERE project_id=?1").bind(id).run();
    const row = await env.DB.prepare("DELETE FROM projects WHERE id=?1 RETURNING id").bind(id).first();
    if (!row) return c.json({ error: "Proyek tidak ditemukan" }, 404);
    return c.json({ ok: true });
  });

  app.put("/api/projects/:id/items/:itemId", async (c) => {
    const env = c.env as AppEnv;
    const itemId = Number(c.req.param("itemId"));
    const b = await c.req.json().catch(() => null);
    if (!b?.description?.trim() || !b?.unit?.trim()) {
      return c.json({ error: "Nama pekerjaan dan satuan wajib diisi" }, 400);
    }
    const volume = Number(b.volume);
    const priceRab = Number(b.price_rab);
    const priceRap = Number(b.price_rap);
    if (!Number.isFinite(volume) || volume <= 0) return c.json({ error: "Volume harus angka di atas 0" }, 400);
    if (!Number.isInteger(priceRab) || priceRab < 0) return c.json({ error: "Harga satuan RAB harus rupiah utuh" }, 400);
    if (!Number.isInteger(priceRap) || priceRap < 0) return c.json({ error: "Harga satuan RAP harus rupiah utuh" }, 400);
    const row = await env.DB.prepare(
      "UPDATE project_items SET description=?1, unit=?2, volume=?3, price_rab=?4, price_rap=?5 WHERE id=?6 RETURNING id, project_id, description, unit, volume, price_rab, price_rap",
    ).bind(b.description.trim(), b.unit.trim(), volume, priceRab, priceRap, itemId).first();
    if (!row) return c.json({ error: "Pekerjaan tidak ditemukan" }, 404);
    return c.json({ item: row });
  });

  app.delete("/api/projects/:id/items/:itemId", async (c) => {
    const env = c.env as AppEnv;
    const itemId = Number(c.req.param("itemId"));
    // Lepas dari SPK apa pun yang memakai item ini agar FK tetap konsisten
    await env.DB.prepare("DELETE FROM spk_items WHERE project_item_id=?1").bind(itemId).run();
    const row = await env.DB.prepare("DELETE FROM project_items WHERE id=?1 RETURNING id").bind(itemId).first();
    if (!row) return c.json({ error: "Pekerjaan tidak ditemukan" }, 404);
    return c.json({ ok: true });
  });

  app.get("/api/projects/:id/items", async (c) => {
    const env = c.env as AppEnv;
    const pid = Number(c.req.param("id"));
    const { results } = await env.DB.prepare(
      "SELECT id, project_id, description, unit, volume, price_rab, price_rap FROM project_items WHERE project_id = ?1 ORDER BY id",
    ).bind(pid).all();
    return c.json({ items: results });
  });
}
