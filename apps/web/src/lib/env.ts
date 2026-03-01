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
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[web] Missing required environment variable: ${name}`);
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

function toUrlWithProtocol(name: string, value: string): string {
  const normalized = stripWrappedQuotes(value);
  if (!normalized) {
    throw new Error(`[web] Empty URL value for ${name}`);
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const localHostPattern =
    /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(:\d+)?(\/.*)?$/i;
  if (localHostPattern.test(normalized)) {
    return `http://${normalized}`;
  }

  return `https://${normalized}`;
}

function requireUrlEnv(name: string): string {
  const value = requireEnv(name);
  const url = toUrlWithProtocol(name, value);

  try {
    new URL(url);
  } catch (error) {
    throw new Error(
      `[web] Invalid URL value for ${name}: ${String((error as Error).message)}`,
    );
  }

  return url;
}

function requireDatabaseUrlEnv(name: string): string {
  const value = stripWrappedQuotes(requireEnv(name));

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch (error) {
    throw new Error(
      `[web] Invalid URL value for ${name}: ${String((error as Error).message)}`,
    );
  }

  if (!/^postgres(ql)?:$/i.test(parsed.protocol)) {
    throw new Error(
      `[web] Invalid protocol for ${name}: expected postgres or postgresql, got ${parsed.protocol}`,
    );
  }

  return value;
}

export function getWebEnv(): WebEnv {
  const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return {
    databaseUrl: requireDatabaseUrlEnv('DATABASE_URL'),
    betterAuthSecret: requireEnv('BETTER_AUTH_SECRET'),
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    payloadServiceToken: requireEnv('PAYLOAD_SERVICE_TOKEN'),
    payloadPublicUrl: requireUrlEnv('PAYLOAD_PUBLIC_URL'),
    appsWebUrl: requireUrlEnv('APPS_WEB_URL'),
    cookieDomain: process.env.COOKIE_DOMAIN,
    adminEmailAllowlist: allowlist,
  };
}
