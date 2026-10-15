import { createApp } from "./app";

const app = createApp();

export default {
  async fetch(req: Request, env: { ASSETS: { fetch: (r: Request) => Promise<Response> } }, ctx: ExecutionContext) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) {
      const res: Response = await app.fetch(req, env, ctx);
      res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      return res;
    }
    return env.ASSETS.fetch(req);
  },
} as ExportedHandler;
