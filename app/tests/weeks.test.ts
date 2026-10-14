// TDD RED: kalender minggu otomatis
import { describe, it, expect } from "vitest";
import { generateWeeks, formatMggLabel } from "../shared/weeks";

describe("generateWeeks", () => {
  it("membuat minggu berurutan 7 hari mulai tanggal mulai", () => {
    const weeks = generateWeeks("2026-10-14", "2026-10-14");
    expect(weeks[0]).toEqual({ number: 1, startDate: "2026-10-14", endDate: "2026-10-20" });
    expect(weeks[1]).toEqual({ number: 2, startDate: "2026-10-21", endDate: "2026-10-27" });
  });

  it("minimal 8 minggu walau hari ini masih sebelum minggu ke-8", () => {
    const weeks = generateWeeks("2026-10-14", "2026-10-14");
    expect(weeks.length).toBeGreaterThanOrEqual(8);
  });

  it("mencakup minggu yang sudah lewat dari hari ini", () => {
    // 40 hari setelah mulai ≈ minggu ke-6 berjalan → harus ada ≥ 8
    const weeks = generateWeeks("2026-01-01", "2026-02-10");
    expect(weeks.length).toBeGreaterThanOrEqual(8);
    const today = "2026-02-10";
    const covering = weeks.some((w) => w.startDate <= today && today <= w.endDate);
    expect(covering).toBe(true);
  });
});

describe("formatMggLabel", () => {
  it("MGG 3", () => {
    expect(formatMggLabel(3)).toBe("MGG 3");
  });
});
