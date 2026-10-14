// Routes opname revisi (REVISI.md R4/R5): opname per minggu = pengajuan, tanpa penguncian.
// Volume diinput manual per item SPK. Realisasi pembayaran menempel pada SPK+minggu.
import { Hono } from "hono";
import type { AppEnv } from "../env";

function validAmount(amount: unknown): amount is number {
  return Number.isInteger(amount) && (amount as number) > 0;
}

export function registerOpnameRoutes(app: Hono<{ Variables: {} }>) {
  // Simpan volume satu item untuk satu minggu (upsert, selalu bisa diedit ulang)
  app.put("/api/opnames", async (c) => {
    const env = c.env as AppEnv;
    const b = await c.req.json().catch(() => null);
    const spkItemId = Number(b?.spk_item_id);
    const weekId = Number(b?.week_id);
    const volume = Number(b?.volume);
    if (!Number.isInteger(spkItemId) || !Number.isInteger(weekId)) {
      return c.json({ error: "Pekerjaan SPK dan minggu wajib dipilih" }, 400);
    }
    if (!Number.isFinite(volume) || volume < 0) {
      return c.json({ error: "Volume tidak boleh negatif" }, 400);
    }
    const item = (await env.DB.prepare(
      "SELECT id, unit_price FROM spk_items WHERE id = ?1",
    ).bind(spkItemId).first());
    if (!item) return c.json({ error: "Pekerjaan SPK tidak ditemukan" }, 404);

    const existing = (await env.DB.prepare(
      "SELECT id FROM opnames WHERE spk_item_id = ?1 AND week_id = ?2",
    ).bind(spkItemId, weekId).first());
    if (existing) {
      await env.DB.prepare("UPDATE opnames SET volume = ?1 WHERE id = ?2").bind(volume, existing.id).run();
    } else {
      await env.DB.prepare("INSERT INTO opnames (spk_item_id, week_id, volume) VALUES (?1,?2,?3)")
        .bind(spkItemId, weekId, volume).run();
    }
    return c.json({ ok: true, nilai: Math.round(volume * item.unit_price) });
  });

  // Rekap satu SPK untuk satu minggu ( Detail Opname ): volume minggu, kumulatif, akumulasi nilai, retensi, kasbon
  app.get("/api/opnames/recap", async (c) => {
    const env = c.env as AppEnv;
    const spkId = Number(c.req.query("spk_id"));
    const weekId = Number(c.req.query("week_id"));
    if (!Number.isInteger(spkId) || !Number.isInteger(weekId)) {
      return c.json({ error: "spk_id dan week_id wajib" }, 400);
    }
    const spk = (await env.DB.prepare(
      "SELECT id, retention_pct, value FROM spks WHERE id = ?1",
    ).bind(spkId).first());
    if (!spk) return c.json({ error: "SPK tidak ditemukan" }, 404);

    const { results } = await env.DB.prepare(
      `SELECT si.id AS spk_item_id, pi.description, pi.unit, pi.volume AS contract_volume,
              si.unit_price,
              COALESCE((SELECT volume FROM opnames WHERE spk_item_id = si.id AND week_id = ?2), 0) AS volume_week,
              COALESCE((SELECT SUM(volume) FROM opnames WHERE spk_item_id = si.id AND week_id <= ?2), 0) AS volume_cum
       FROM spk_items si JOIN project_items pi ON pi.id = si.project_item_id
       WHERE si.spk_id = ?1 ORDER BY si.id`,
    ).bind(spkId, weekId).all();

    const items = (results as Array<Record<string, number | string>>).map((r) => {
      const nilaiWeek = Math.round(Number(r.volume_week) * Number(r.unit_price));
      const nilaiCum = Math.round(Number(r.volume_cum) * Number(r.unit_price));
      return { ...r, nilai_week: nilaiWeek, nilai_cum: nilaiCum };
    });
    const totalWeek = items.reduce((a, i) => a + i.nilai_week, 0);
    const totalCum = items.reduce((a, i) => a + i.nilai_cum, 0);
    const retensi = Math.round(totalWeek * spk.retention_pct / 100);
    const { results: kasbons } = await env.DB.prepare(
      "SELECT COALESCE(SUM(amount),0) AS total FROM kasbons WHERE spk_id = ?1",
    ).bind(spkId).all();
    const potonganKasbon = Number(kasbons[0]?.total ?? 0);
    const { results: real } = await env.DB.prepare(
      "SELECT id, amount, method, date, note FROM realizations WHERE spk_id = ?1 AND (week_id = ?2 OR week_id IS NULL) ORDER BY date",
    ).bind(spkId, weekId).all();
    const realisasi = (real as Array<{ amount: number }>).reduce((a, r) => a + r.amount, 0);

    return c.json({
      recap: {
        items, total_week: totalWeek, total_cum: totalCum,
        retensi_pct: spk.retention_pct, retensi,
        potongan_kasbon: potonganKasbon,
        dibayar_minggu_ini: totalWeek - retensi,
        realisasi_total: realisasi,
        sisa_spk: spk.value - totalCum,
        realizations: real,
      },
    });
  });

  // Realisasi pembayaran (REVISI.md R6): menempel SPK + minggu
  app.post("/api/realizations", async (c) => {
    const env = c.env as AppEnv;
    const b = await c.req.json().catch(() => null);
    if (!Number.isInteger(b?.spk_id)) return c.json({ error: "SPK wajib dipilih" }, 400);
    if (!validAmount(b?.amount)) return c.json({ error: "Nominal harus rupiah utuh di atas 0" }, 400);
    if (!b?.date) return c.json({ error: "Tanggal wajib diisi" }, 400);
    const row = await env.DB.prepare(
      "INSERT INTO realizations (spk_id, week_id, amount, method, date, note) VALUES (?1,?2,?3,?4,?5,?6) RETURNING id, spk_id, week_id, amount, method, date, note",
    )
      .bind(b.spk_id, Number.isInteger(b.week_id) ? b.week_id : null, b.amount, b.method?.trim() || null, b.date, b.note?.trim() || null)
      .first();
    return c.json({ realization: row }, 201);
  });

  app.get("/api/realizations", async (c) => {
    const env = c.env as AppEnv;
    const spkId = Number(c.req.query("spk_id"));
    const stmt = Number.isInteger(spkId)
      ? env.DB.prepare("SELECT id, spk_id, week_id, amount, method, date, note FROM realizations WHERE spk_id = ?1 ORDER BY date").bind(spkId)
      : env.DB.prepare("SELECT id, spk_id, week_id, amount, method, date, note FROM realizations ORDER BY date");
    const { results } = await stmt.all();
    return c.json({ realizations: results });
  });

  // Hapus volume satu item pada satu minggu (koreksi manual, tanpa lock)
  app.delete("/api/opnames/:id", async (c) => {
    const env = c.env as AppEnv;
    const row = await env.DB.prepare("DELETE FROM opnames WHERE id = ?1 RETURNING id")
      .bind(Number(c.req.param("id"))).first();
    if (!row) return c.json({ error: "Data opname tidak ditemukan" }, 404);
    return c.json({ ok: true });
  });

  // Hapus realisasi
  app.delete("/api/realizations/:id", async (c) => {
    const env = c.env as AppEnv;
    const row = await env.DB.prepare("DELETE FROM realizations WHERE id = ?1 RETURNING id")
      .bind(Number(c.req.param("id"))).first();
    if (!row) return c.json({ error: "Realisasi tidak ditemukan" }, 404);
    return c.json({ ok: true });
  });
}
