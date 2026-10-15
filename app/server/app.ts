// Aplikasi Hono — wiring DB, auth, dan routes (ticket 01/03)
import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "./env";
export type { AppEnv } from "./env";
import { registerProjectRoutes } from "./routes/projects";
import { registerMandorRoutes } from "./routes/mandors";
import { registerSpkRoutes } from "./routes/spks";
import { registerOpnameRoutes } from "./routes/opnames";
import { registerKasbonRoutes } from "./routes/kasbons";
import { registerDashboardRoutes } from "./routes/dashboard";

export function createApp(middleware: MiddlewareHandler[] = []) {
  const app = new Hono();
  for (const mw of middleware) {
    app.use("*", mw);
  }
  app.get("/api/health", (c) => c.json({ ok: true }));
  app.use("*", async (c, next) => {
    await next();
    c.header("X-Robots-Tag", "noindex, nofollow, noarchive");
  });
  registerProjectRoutes(app as unknown as Parameters<typeof registerProjectRoutes>[0]);
  registerMandorRoutes(app as unknown as Parameters<typeof registerMandorRoutes>[0]);
  registerSpkRoutes(app as unknown as Parameters<typeof registerSpkRoutes>[0]);
  registerOpnameRoutes(app as unknown as Parameters<typeof registerOpnameRoutes>[0]);
  registerKasbonRoutes(app as unknown as Parameters<typeof registerKasbonRoutes>[0]);
  registerDashboardRoutes(app as unknown as Parameters<typeof registerDashboardRoutes>[0]);
  return app;
}

/** Variant test/lokal: env DB diinjeksi langsung (tanpa password). */
export function createAppWithDb(env: AppEnv) {
  const app = new Hono<{ Variables: {} }>();
  app.use("*", async (c, next) => {
    c.env = { ...env } as typeof c.env;
    await next();
  });
  registerProjectRoutes(app as unknown as Parameters<typeof registerProjectRoutes>[0]);
  registerMandorRoutes(app as unknown as Parameters<typeof registerMandorRoutes>[0]);
  registerSpkRoutes(app as unknown as Parameters<typeof registerSpkRoutes>[0]);
  registerOpnameRoutes(app as unknown as Parameters<typeof registerOpnameRoutes>[0]);
  registerKasbonRoutes(app as unknown as Parameters<typeof registerKasbonRoutes>[0]);
  registerDashboardRoutes(app as unknown as Parameters<typeof registerDashboardRoutes>[0]);
  return app;
}
