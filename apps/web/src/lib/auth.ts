import type { Role } from '@blog/shared';
import { type BetterAuthOptions, betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { getD1 } from './db.js';
import { getWebEnv } from './env.js';

const env = getWebEnv();

// Better Auth talks to D1 through Kysely's D1 dialect.
const kysely = new Kysely<Record<string, unknown>>({
  dialect: new D1Dialect({ database: getD1() }),
});

const githubEnabled = Boolean(env.githubClientId && env.githubClientSecret);

const authOptions = {
  secret: env.betterAuthSecret,
  baseURL: env.appsWebUrl,
  database: { db: kysely, type: 'sqlite' },
  plugins: [tanstackStartCookies()],
  trustedOrigins: [env.appsWebUrl],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: githubEnabled
    ? {
        github: {
          clientId: env.githubClientId ?? '',
          clientSecret: env.githubClientSecret ?? '',
        },
      }
    : undefined,
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'member' satisfies Role,
        required: false,
        input: false,
      },
    },
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth(authOptions);

/**
 * No-op on D1: the Better Auth schema is applied as a versioned D1 migration
 * (`pnpm exec wrangler d1 migrations apply`), not at request time. Kept as an
 * async function so call sites (the auth route handler) don't need to change.
 */
export function ensureAuthSchema(): Promise<void> {
  return Promise.resolve();
}
