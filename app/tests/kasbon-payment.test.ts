// Test kasbon revisi: per mandor + saldo berjalan
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
  await app.request("/api/mandors", { method: "POST", headers: AUTH, body: JSON.stringify({ name: "M1" }) });
  await app.request("/api/kasbons", { method: "POST", headers: AUTH,
    body: JSON.stringify({ mandor_id: 1, amount: 150000000, date: "2026-10-14", note: "kasbon awal" }) });
  await app.request("/api/kasbons", { method: "POST", headers: AUTH,
    body: JSON.stringify({ mandor_id: 1, amount: 50000000, date: "2026-10-20", note: "kasbon tambahan" }) });
});

describe("Kasbon", () => {
  it("catat kasbon per mandor", async () => {
    const list = await asBody(await app.request("/api/kasbons?mandor_id=1", { headers: AUTH }));
    expect(list.kasbons.length).toBe(2);
  });

  it("saldo berjalan = total kasbon mandor", async () => {
    const body = await asBody(await app.request("/api/kasbons/saldo", { headers: AUTH }));
    expect(body.saldo[0]).toMatchObject({ mandor_id: 1, total_kasbon: 200000000 });
  });

  it("tolak nominal negatif (400)", async () => {
    const res = await app.request("/api/kasbons", { method: "POST", headers: AUTH,
      body: JSON.stringify({ mandor_id: 1, amount: -5, date: "2026-10-14" }) });
    expect(res.status).toBe(400);
  });
});
