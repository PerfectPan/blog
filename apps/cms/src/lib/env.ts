import 'dotenv/config';

type CmsEnv = {
  dbDriver: 'postgres' | 'sqlite';
  databaseUrl?: string;
  sqliteUrl?: string;
  payloadSecret: string;
  payloadServiceToken: string;
  appsWebOrigins: string[];
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

function stripWrappedQuotes(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function normalizeOrigin(value: string): string {
  const normalized = stripWrappedQuotes(value);
  if (!normalized) {
    throw new Error('[cms] Empty origin value in APPS_WEB_URL');
  }

  const withProtocol = /^https?:\/\//i.test(normalized)
    ? normalized
    : /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(:\d+)?(\/.*)?$/i.test(
          normalized,
        )
      ? `http://${normalized}`
      : `https://${normalized}`;

  const origin = new URL(withProtocol).origin;
  return origin;
}

function getAppsWebOrigins(): string[] {
  const raw = requireEnv('APPS_WEB_URL');
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => normalizeOrigin(item));
}

function getPayloadPublicUrl(): string | undefined {
  const value = process.env.PAYLOAD_PUBLIC_URL;
  if (!value) {
    return undefined;
  }

  const normalized = normalizeOrigin(value);
  return normalized;
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
    appsWebOrigins: getAppsWebOrigins(),
    payloadPublicUrl: getPayloadPublicUrl(),
    adminEmailAllowlist,
  };
}
