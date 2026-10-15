import { createApp } from "./app";

const app = createApp();

export default {
  async fetch(req, env, ctx) {
    const res: Response = await app.fetch(req, env, ctx);
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return res;
  },
} as ExportedHandler;
