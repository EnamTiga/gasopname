import { describe, it, expect } from "vitest";
import { createApp } from "../server/app";

describe("API dasar", () => {
  it("health tanpa password", async () => {
    const app = createApp();
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
  });
});
