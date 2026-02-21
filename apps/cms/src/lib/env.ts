import 'dotenv/config';

type CmsEnv = {
  dbDriver: 'postgres' | 'sqlite';
  databaseUrl?: string;
  sqliteUrl?: string;
  payloadSecret: string;
  payloadServiceToken: string;
  appsWebUrl: string;
  payloadPublicUrl?: string;
  adminEmailAllowlist: string[];
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[cms] Missing required environment variable: ${name}`);
  }
  return value;
}

export function getCmsEnv(): CmsEnv {
  const adminEmailAllowlist = (process.env.ADMIN_EMAIL_ALLOWLIST ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const requestedDriver = process.env.CMS_DB_DRIVER?.trim().toLowerCase();
  const dbDriver = requestedDriver === 'sqlite' ? 'sqlite' : 'postgres';
  const databaseUrl = process.env.DATABASE_URL;
  const sqliteUrl = process.env.CMS_SQLITE_URL ?? 'file:./.payload/cms.sqlite';

  if (dbDriver === 'postgres' && !databaseUrl) {
    throw new Error(
      '[cms] Missing required environment variable: DATABASE_URL',
    );
  }

  return {
    dbDriver,
    databaseUrl,
    sqliteUrl,
    payloadSecret: requireEnv('PAYLOAD_SECRET'),
    payloadServiceToken: requireEnv('PAYLOAD_SERVICE_TOKEN'),
    appsWebUrl: requireEnv('APPS_WEB_URL'),
    payloadPublicUrl: process.env.PAYLOAD_PUBLIC_URL,
    adminEmailAllowlist,
  };
}
