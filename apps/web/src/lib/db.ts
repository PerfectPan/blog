import { Pool } from 'pg';
import { getWebEnv } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var __blogPgPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!globalThis.__blogPgPool) {
    const env = getWebEnv();
    const connectionUrl = new URL(env.databaseUrl);
    const host = connectionUrl.hostname.toLowerCase();
    const sslMode = connectionUrl.searchParams.get('sslmode')?.toLowerCase();
    const isLocalHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1';
    const enableSsl =
      sslMode === 'disable'
        ? false
        : sslMode === 'require' ||
            sslMode === 'verify-ca' ||
            sslMode === 'verify-full'
          ? true
          : !isLocalHost;

    globalThis.__blogPgPool = new Pool({
      connectionString: env.databaseUrl,
      ssl: enableSsl ? { rejectUnauthorized: false } : undefined,
      max: 5,
      connectionTimeoutMillis: 5000,
    });
  }

  return globalThis.__blogPgPool;
}
