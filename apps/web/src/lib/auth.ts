import type { Role } from '@blog/shared';
import { type BetterAuthOptions, betterAuth } from 'better-auth';
import { getMigrations } from 'better-auth/db';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { getPool } from './db.js';
import { getWebEnv } from './env.js';

const env = getWebEnv();
const pool = getPool();

const githubEnabled = Boolean(env.githubClientId && env.githubClientSecret);

const authOptions = {
  secret: env.betterAuthSecret,
  baseURL: env.appsWebUrl,
  database: pool,
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

let authSchemaReady: Promise<void> | undefined;

export function ensureAuthSchema(): Promise<void> {
  if (authSchemaReady) {
    return authSchemaReady;
  }

  authSchemaReady = (async () => {
    const migrations = await getMigrations(authOptions);
    const createCount = migrations.toBeCreated.length;
    const alterCount = migrations.toBeAdded.length;

    if (createCount === 0 && alterCount === 0) {
      return;
    }

    console.info(
      `[auth] Applying Better Auth schema changes (create=${createCount}, alter=${alterCount})`,
    );
    await migrations.runMigrations();
    console.info('[auth] Better Auth schema migration complete');
  })().catch((error) => {
    authSchemaReady = undefined;
    throw error;
  });

  return authSchemaReady;
}
