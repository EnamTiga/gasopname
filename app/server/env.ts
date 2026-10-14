// Environment binding aplikasi.
// D1 di-type longgar agar test (miniflare) & runtime Workers (cloudflare-types) kompatibel.
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface D1Like {
  prepare(query: string): any;
}

export interface AppEnv {
  DB: D1Like;
  APP_PASSWORD?: string;
}
