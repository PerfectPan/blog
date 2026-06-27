import { env } from 'cloudflare:workers';

/**
 * Returns the Cloudflare D1 binding (`DB`).
 *
 * D1 replaces the previous Postgres pool. The binding is declared in
 * `wrangler.jsonc` and surfaced on the worker `env` via `cloudflare:workers`.
 */
export function getD1(): D1Database {
  const db = (env as { DB?: D1Database }).DB;
  if (!db) {
    throw new Error(
      '[web] D1 binding "DB" is not configured. Check wrangler.jsonc d1_databases.',
    );
  }
  return db;
}
