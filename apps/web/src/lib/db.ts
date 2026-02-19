import { Pool } from 'pg';
import { getWebEnv } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var __blogPgPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!globalThis.__blogPgPool) {
    const env = getWebEnv();
    globalThis.__blogPgPool = new Pool({
      connectionString: env.databaseUrl,
      max: 5,
    });
  }

  return globalThis.__blogPgPool;
}
