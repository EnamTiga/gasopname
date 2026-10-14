// Shared Zod schemas & types (frontend + backend single source of truth)
import { z } from "zod";

export const rupiahInt = z.number().int("Nominal harus rupiah utuh").nonnegative();

export const projectCreateSchema = z.object({
  name: z.string().min(1, "Nama paket wajib diisi"),
  engineer: z.string().min(1, "Site engineer wajib diisi"),
  company: z.string().min(1, "Perusahaan wajib diisi"),
  project_manager: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
});
export type ProjectCreate = z.infer<typeof projectCreateSchema>;

export const healthResponseSchema = z.object({ ok: z.literal(true) });
export type HealthResponse = z.infer<typeof healthResponseSchema>;
