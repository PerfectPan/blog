import 'dotenv/config';

type WebEnv = {
  databaseUrl: string;
  betterAuthSecret: string;
  githubClientId?: string;
  githubClientSecret?: string;
  payloadServiceToken: string;
  payloadPublicUrl: string;
  appsWebUrl: string;
  cookieDomain?: string;
  adminEmailAllowlist: string[];
  enableMarkdownFallback: boolean;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[web] Missing required environment variable: ${name}`);
  }
  return value;
}

export function getWebEnv(): WebEnv {
  const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return {
    databaseUrl: requireEnv('DATABASE_URL'),
    betterAuthSecret: requireEnv('BETTER_AUTH_SECRET'),
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    payloadServiceToken: requireEnv('PAYLOAD_SERVICE_TOKEN'),
    payloadPublicUrl: requireEnv('PAYLOAD_PUBLIC_URL'),
    appsWebUrl: requireEnv('APPS_WEB_URL'),
    cookieDomain: process.env.COOKIE_DOMAIN,
    adminEmailAllowlist: allowlist,
    enableMarkdownFallback:
      (process.env.ENABLE_MARKDOWN_FALLBACK ?? 'true') !== 'false',
  };
}
