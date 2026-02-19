import type { Role } from '@blog/shared';
import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/plugins';
import { getPool } from './db.js';
import { getWebEnv } from './env.js';

const env = getWebEnv();
const pool = getPool();

const githubEnabled = Boolean(env.githubClientId && env.githubClientSecret);

export const auth = betterAuth({
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
});
