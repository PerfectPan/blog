import type { Role } from '@blog/shared';
import { type BetterAuthOptions, betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { getD1 } from './db.js';
import { getWebEnv } from './env.js';
import {
  mailEnabled,
  sendMail,
  VERIFY_LINK_TTL_S,
  verificationMail,
} from './mail.js';

const env = getWebEnv();

// Better Auth talks to D1 through Kysely's D1 dialect.
const kysely = new Kysely<Record<string, unknown>>({
  dialect: new D1Dialect({ database: getD1() }),
});

const githubEnabled = Boolean(env.githubClientId && env.githubClientSecret);

// vite dev (pnpm dev) serves on :5173 while APPS_WEB_URL points at the
// wrangler-dev origin (:8787) — allow the vite origin in dev only, otherwise
// every sign-in from the dev server dies on Better Auth's origin check.
const devOrigins = import.meta.env.DEV
  ? ['http://localhost:5173', 'http://127.0.0.1:5173']
  : [];

const authOptions = {
  secret: env.betterAuthSecret,
  baseURL: env.appsWebUrl,
  database: { db: kysely, type: 'sqlite' },
  plugins: [tanstackStartCookies()],
  trustedOrigins: [env.appsWebUrl, ...devOrigins],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  // A verified email lets a later GitHub sign-in with the same address merge
  // into the account automatically (Better Auth only merges into verified
  // local accounts). Without mail configured (local dev, previews) the
  // endpoints report that verification isn't enabled.
  emailVerification: mailEnabled
    ? {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        expiresIn: VERIFY_LINK_TTL_S,
        // On sign-up this runs after the user row is written, so a throw
        // would fail a sign-up that already succeeded. Log instead; the user
        // can resend from /account.
        sendVerificationEmail: async ({ user, url }) => {
          try {
            await sendMail({
              to: user.email,
              ...verificationMail(user.name || user.email, url),
            });
          } catch (error) {
            console.error('[web] verification mail failed', error);
          }
        },
      }
    : undefined,
  // Resend's free tier allows 100 mails a day; keep one visitor from
  // spending it. The limiter is per isolate, so this is a speed bump.
  rateLimit: {
    customRules: {
      '/send-verification-email': { window: 60, max: 2 },
    },
  },
  account: {
    // Linking only runs from a signed-in session (/account), so a GitHub
    // account whose email differs from the user's still belongs to them.
    accountLinking: { allowDifferentEmails: true },
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
