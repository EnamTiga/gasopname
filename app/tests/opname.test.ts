// Test opname revisi (REVISI.md R4/R5): input manual volume, TANPA lock, recap detail + realisasi
import { describe, it, expect, beforeAll } from "vitest";
import { createTestD1, type TestD1 } from "./helpers/d1";
import { createAppWithDb } from "../server/app";

let d1: TestD1;
let app: ReturnType<typeof createAppWithDb>;
const AUTH = { "X-App-Password": "test-pass", "Content-Type": "application/json" };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asBody = async (res: Response): Promise<any> => res.json();

let spkItemId1 = 0;
let spkItemId2 = 0;
let weekId1 = 0;

beforeAll(async () => {
  d1 = await createTestD1();
  app = createAppWithDb({ DB: d1.db });
  await app.request("/api/projects", { method: "POST", headers: AUTH,
    body: JSON.stringify({ name: "PX", engineer: "SE", company: "PT", start_date: "2026-10-14" }) });
  await app.request("/api/projects/1/items", { method: "POST", headers: AUTH,
    body: JSON.stringify({ description: "Paving", unit: "m2", volume: 500, price_rab: 10000, price_rap: 8000 }) });
  await app.request("/api/projects/1/items", { method: "POST", headers: AUTH,
    body: JSON.stringify({ description: "Guardrail", unit: "m1", volume: 50, price_rab: 50000, price_rap: 40000 }) });
  await app.request("/api/mandors", { method: "POST", headers: AUTH, body: JSON.stringify({ name: "M1" }) });
  await app.request("/api/spks", { method: "POST", headers: AUTH,
    body: JSON.stringify({ project_id: 1, mandor_id: 1, no_spk: "SPK 01", retention_pct: 5, payment_method: "Cash",
      items: [ { project_item_id: 1, unit_price: 10000 }, { project_item_id: 2, unit_price: 50000 } ] }) });
  const det = await asBody(await app.request("/api/spks/1", { headers: AUTH }));
  spkItemId1 = det.items[0].id; spkItemId2 = det.items[1].id;
  const weeks = (await asBody(await app.request("/api/projects/1/weeks", { headers: AUTH }))).weeks;
  weekId1 = weeks[0].id;
});

describe("PUT /api/opnames", () => {
  it("input volume manual per item; nilai = volume x harga kontrak", async () => {
    const res = await app.request("/api/opnames", { method: "PUT", headers: AUTH,
      body: JSON.stringify({ spk_item_id: spkItemId1, week_id: weekId1, volume: 100 }) });
    expect(res.status).toBe(200);
    expect((await asBody(res)).nilai).toBe(1000000);
  });

  it("edit ulang volume minggu yang sama (upsert, tanpa lock)", async () => {
    const res = await app.request("/api/opnames", { method: "PUT", headers: AUTH,
      body: JSON.stringify({ spk_item_id: spkItemId1, week_id: weekId1, volume: 150 }) });
    expect(res.status).toBe(200);
    expect((await asBody(res)).nilai).toBe(1500000);
  });

  it("tolak volume negatif (400)", async () => {
    const res = await app.request("/api/opnames", { method: "PUT", headers: AUTH,
      body: JSON.stringify({ spk_item_id: spkItemId1, week_id: weekId1, volume: -3 }) });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/opnames/recap (Detail Opname)", () => {
  it("volume minggu + kumulatif + akumulasi nilai + retensi", async () => {
    await app.request("/api/opnames", { method: "PUT", headers: AUTH,
      body: JSON.stringify({ spk_item_id: spkItemId2, week_id: weekId1, volume: 10 }) });
    const body = await asBody(await app.request(`/api/opnames/recap?spk_id=1&week_id=${weekId1}`, { headers: AUTH }));
    const r = body.recap;
    expect(r.total_week).toBe(150 * 10000 + 10 * 50000);
    expect(r.total_cum).toBe(r.total_week);
    expect(r.retensi_pct).toBe(5);
    expect(r.retensi).toBe(Math.round(r.total_week * 0.05));
    expect(r.dibayar_minggu_ini).toBe(r.total_week - r.retensi);
    expect(r.sisa_spk).toBe(7500000 - r.total_cum);
  });

  it("tanpa penguncian: opname tetap bisa diedit setelah recap", async () => {
    const res = await app.request("/api/opnames", { method: "PUT", headers: AUTH,
      body: JSON.stringify({ spk_item_id: spkItemId1, week_id: weekId1, volume: 120 }) });
    expect(res.status).toBe(200);
  });
});

describe("Realisasi (R6)", () => {
  it("catat realisasi BG 30 Hari + daftar per SPK", async () => {
    const res = await app.request("/api/realizations", { method: "POST", headers: AUTH,
      body: JSON.stringify({ spk_id: 1, week_id: weekId1, amount: 1000000, method: "BG 30 Hari", date: "2026-10-20" }) });
    expect(res.status).toBe(201);
    const list = await asBody(await app.request("/api/realizations?spk_id=1", { headers: AUTH }));
    expect(list.realizations.length).toBe(1);
    expect(list.realizations[0].method).toBe("BG 30 Hari");
  });

  it("tolak nominal realisasi negatif (400)", async () => {
    const res = await app.request("/api/realizations", { method: "POST", headers: AUTH,
      body: JSON.stringify({ spk_id: 1, amount: -1, date: "2026-10-20" }) });
    expect(res.status).toBe(400);
  });
});
