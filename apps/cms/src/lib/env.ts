import 'dotenv/config';

type CmsEnv = {
  databaseUrl: string;
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

  return {
    databaseUrl: requireEnv('DATABASE_URL'),
    payloadSecret: requireEnv('PAYLOAD_SECRET'),
    payloadServiceToken: requireEnv('PAYLOAD_SERVICE_TOKEN'),
    appsWebUrl: requireEnv('APPS_WEB_URL'),
    payloadPublicUrl: process.env.PAYLOAD_PUBLIC_URL,
    adminEmailAllowlist,
  };
}
