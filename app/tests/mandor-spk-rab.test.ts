// Test SPK revisi (REVISI.md R2): multi pekerjaan + harga satuan kontrak + payment_method
import { describe, it, expect, beforeAll } from "vitest";
import { createTestD1, type TestD1 } from "./helpers/d1";
import { createAppWithDb } from "../server/app";

let d1: TestD1;
let app: ReturnType<typeof createAppWithDb>;
const AUTH = { "X-App-Password": "test-pass", "Content-Type": "application/json" };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asBody = async (res: Response): Promise<any> => res.json();

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
});

describe("POST /api/spks", () => {
  it("buat SPK: 2 pekerjaan dipilih + harga satuan kontrak + payment_method; nilai otomatis", async () => {
    const res = await app.request("/api/spks", { method: "POST", headers: AUTH,
      body: JSON.stringify({
        project_id: 1, mandor_id: 1, no_spk: "SPK 01/X/2026", retention_pct: 5, payment_method: "BG 30 Hari",
        items: [ { project_item_id: 1, unit_price: 9000 }, { project_item_id: 2, unit_price: 45000 } ],
      }) });
    expect(res.status).toBe(201);
    const body = await asBody(res);
    // nilai = 500x9000 + 50x45000 = 4.500.000 + 2.250.000 = 6.750.000
    expect(body.value).toBe(6750000);
    expect(body.spk.payment_method).toBe("BG 30 Hari");
  });

  it("tolak SPK tanpa pekerjaan (400)", async () => {
    const res = await app.request("/api/spks", { method: "POST", headers: AUTH,
      body: JSON.stringify({ project_id: 1, mandor_id: 1, no_spk: "SPK 02", items: [] }) });
    expect(res.status).toBe(400);
  });

  it("tolak harga satuan kontrak negatif (400)", async () => {
    const res = await app.request("/api/spks", { method: "POST", headers: AUTH,
      body: JSON.stringify({ project_id: 1, mandor_id: 1, no_spk: "SPK 03", items: [{ project_item_id: 1, unit_price: -5 }] }) });
    expect(res.status).toBe(400);
  });

  it("detail SPK berisi item + harga kontrak; edit harga -> nilai recompute", async () => {
    const det = await asBody(await app.request("/api/spks/1", { headers: AUTH }));
    expect(det.items.length).toBe(2);
    expect(det.items[0].description).toBe("Paving");
    const upd = await app.request("/api/spks/1/items/" + det.items[0].id, {
      method: "PUT", headers: AUTH, body: JSON.stringify({ unit_price: 10000 }) });
    expect(upd.status).toBe(200);
    const body = await asBody(upd);
    expect(body.value).toBe(500 * 10000 + 50 * 45000);
  });
});
