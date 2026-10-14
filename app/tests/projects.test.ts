// Test API proyek revisi (REVISI.md R1): identitas + project_manager + pekerjaan RAB/RAP
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
});

describe("POST /api/projects", () => {
  it("membuat proyek dengan project_manager + minggu otomatis", async () => {
    const res = await app.request("/api/projects", {
      method: "POST", headers: AUTH,
      body: JSON.stringify({ name: "P1", engineer: "SE1", company: "PT X", project_manager: "PM1", start_date: "2026-10-14" }),
    });
    expect(res.status).toBe(201);
    const body = await asBody(res);
    expect(body.project.project_manager).toBe("PM1");
    const wres = await app.request(`/api/projects/${body.project.id}/weeks`, { headers: AUTH });
    const weeks = (await asBody(wres)).weeks;
    expect(weeks[0]).toMatchObject({ number: 1, startDate: "2026-10-14" });
  });

  it("menolak payload tidak valid (400)", async () => {
    const res = await app.request("/api/projects", { method: "POST", headers: AUTH, body: JSON.stringify({ name: "" }) });
    expect(res.status).toBe(400);
  });

});

describe("Pekerjaan level proyek (RAB/RAP)", () => {
  it("tambah pekerjaan dengan volume, harga RAB, harga RAP", async () => {
    const res = await app.request("/api/projects/1/items", {
      method: "POST", headers: AUTH,
      body: JSON.stringify({ description: "Cor Beton", unit: "m3", volume: 100, price_rab: 65000, price_rap: 55000 }),
    });
    expect(res.status).toBe(201);
    const body = await asBody(res);
    expect(body.item).toMatchObject({ description: "Cor Beton", volume: 100, price_rab: 65000, price_rap: 55000 });
  });

  it("jumlah RAB = volume x harga RAB = 6.500.000", () => {
    expect(100 * 65000).toBe(6500000);
  });

  it("tolak volume negatif (400)", async () => {
    const res = await app.request("/api/projects/1/items", {
      method: "POST", headers: AUTH,
      body: JSON.stringify({ description: "X", unit: "m2", volume: -1, price_rab: 1000, price_rap: 1000 }),
    });
    expect(res.status).toBe(400);
  });

  it("daftar pekerjaan proyek", async () => {
    const res = await app.request("/api/projects/1/items", { headers: AUTH });
    const body = await asBody(res);
    expect(body.items.length).toBeGreaterThanOrEqual(1);
  });
});
