// Routes dashboard revisi (REVISI.md R10): ringkasan uang, progres per proyek, ringkasan per SPK.
import { Hono } from "hono";
import type { AppEnv } from "../env";

export function registerDashboardRoutes(app: Hono<{ Variables: {} }>) {
  app.get("/api/dashboard", async (c) => {
    const env = c.env as AppEnv;

    const totals = (await env.DB.prepare(
      `SELECT
         COALESCE((SELECT SUM(value) FROM spks), 0) AS total_spk,
         COALESCE((SELECT SUM(amount) FROM kasbons), 0) AS total_kasbon,
         COALESCE((SELECT SUM(amount) FROM realizations), 0) AS total_realisasi`,
    ).first()) as Record<string, number>;

    // Opname kumulatif & realisasi per SPK
    const { results: perSpk } = await env.DB.prepare(
      `SELECT s.id, s.no_spk, s.value, s.retention_pct, s.status, s.project_id, s.mandor_id,
              COALESCE((SELECT SUM(ROUND(o.volume * si.unit_price)) FROM opnames o
                        JOIN spk_items si ON si.id = o.spk_item_id WHERE si.spk_id = s.id), 0) AS opname_cum,
              COALESCE((SELECT SUM(amount) FROM realizations r WHERE r.spk_id = s.id), 0) AS realisasi
       FROM spks s ORDER BY s.id DESC`,
    ).all();

    // Progres per proyek: volume opname kumulatif / volume kontrak dari item yang diambil SPK
    const { results: perProject } = await env.DB.prepare(
      `SELECT p.id, p.name,
              COALESCE((SELECT SUM(pi.volume) FROM project_items pi WHERE pi.id IN
                        (SELECT si.project_item_id FROM spk_items si
                         JOIN spks s2 ON s2.id = si.spk_id WHERE s2.project_id = p.id)), 0) AS vol_kontrak,
              COALESCE((SELECT SUM(o.volume) FROM opnames o
                        JOIN spk_items si ON si.id = o.spk_item_id
                        JOIN spks s2 ON s2.id = si.spk_id WHERE s2.project_id = p.id), 0) AS vol_opname
       FROM projects p ORDER BY p.id DESC`,
    ).all();

    const { results: mandorKasbon } = await env.DB.prepare(
      `SELECT m.id, m.name, COALESCE(SUM(k.amount),0) AS total
       FROM mandors m LEFT JOIN kasbons k ON k.mandor_id = m.id GROUP BY m.id ORDER BY total DESC LIMIT 5`,
    ).all();

    const spks = (perSpk as Array<Record<string, number>>) ?? [];
    const totalOpname = spks.reduce((a, s) => a + Number(s.opname_cum), 0);
    const totalRetensi = spks.reduce((a, s) => a + Math.round(Number(s.opname_cum) * Number(s.retention_pct) / 100), 0);

    return c.json({
      totals: {
        total_spk: Number(totals?.total_spk ?? 0),
        total_opname: totalOpname,
        total_retensi: totalRetensi,
        total_realisasi: Number(totals?.total_realisasi ?? 0),
        sisa_spk: Number(totals?.total_spk ?? 0) - totalOpname,
        total_kasbon: Number(totals?.total_kasbon ?? 0),
      },
      spks,
      projects: perProject,
      mandorKasbon,
    });
  });
}
