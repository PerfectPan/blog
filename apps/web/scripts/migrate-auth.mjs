import 'dotenv/config';
import { getMigrations } from 'better-auth/db';
import { Pool } from 'pg';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[migrate-auth] Missing required environment variable: ${name}`,
    );
  }
  return value;
}

function stripWrappedQuotes(value) {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function getDatabaseUrl() {
  const value = stripWrappedQuotes(requireEnv('DATABASE_URL'));
  const parsed = new URL(value);
  if (!/^postgres(ql)?:$/i.test(parsed.protocol)) {
    throw new Error(
      `[migrate-auth] Invalid DATABASE_URL protocol: ${parsed.protocol}. Expected postgres or postgresql.`,
    );
  }
  return value;
}

function shouldEnableSsl(databaseUrl) {
  const parsed = new URL(databaseUrl);
  const host = parsed.hostname.toLowerCase();
  const sslMode = parsed.searchParams.get('sslmode')?.toLowerCase();
  const isLocalHost =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1';

  if (sslMode === 'disable') {
    return false;
  }

  if (
    sslMode === 'require' ||
    sslMode === 'verify-ca' ||
    sslMode === 'verify-full'
  ) {
    return true;
  }

  return !isLocalHost;
}

async function main() {
  const databaseUrl = getDatabaseUrl();
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: shouldEnableSsl(databaseUrl)
      ? { rejectUnauthorized: false }
      : undefined,
    max: 1,
  });

  try {
    const migrations = await getMigrations({
      database: pool,
      emailAndPassword: {
        enabled: true,
        autoSignIn: true,
      },
      user: {
        additionalFields: {
          role: {
            type: 'string',
            defaultValue: 'member',
            required: false,
            input: false,
          },
        },
      },
    });

    const toCreate = migrations.toBeCreated.length;
    const toAdd = migrations.toBeAdded.length;

    if (toCreate === 0 && toAdd === 0) {
      console.log('[migrate-auth] Schema is already up to date.');
      return;
    }

    console.log(
      `[migrate-auth] Applying Better Auth migrations (create=${toCreate}, alter=${toAdd})...`,
    );
    await migrations.runMigrations();
    console.log('[migrate-auth] Migration complete.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[migrate-auth] Failed:', error);
  process.exit(1);
});
