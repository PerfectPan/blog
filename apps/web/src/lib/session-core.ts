import {
  isLocale,
  type Locale,
  type Role,
  type SessionUser,
} from '@blog/shared';
import { getRequest } from '@tanstack/react-start/server';
import { auth } from './auth.js';
import { getD1 } from './db.js';
import { getWebEnv } from './env.js';

type BetterAuthSession = {
  user?: {
    id?: string;
    email?: string | null;
    role?: Role;
  } | null;
} | null;

const env = getWebEnv();

async function maybePromoteFirstAdmin(
  sessionUser: SessionUser,
): Promise<SessionUser> {
  const allowlist = env.adminEmailAllowlist;
  if (!allowlist.includes(sessionUser.email.toLowerCase())) {
    return sessionUser;
  }

  try {
    const db = getD1();
    const adminRow = await db
      .prepare('SELECT COUNT(*) AS count FROM "user" WHERE "role" = ?')
      .bind('admin')
      .first<{ count: number }>();

    const count = Number(adminRow?.count ?? 0);
    if (count > 0) {
      return sessionUser;
    }

    await db
      .prepare('UPDATE "user" SET "role" = ? WHERE "id" = ?')
      .bind('admin', sessionUser.id)
      .run();

    return { ...sessionUser, role: 'admin' };
  } catch (error) {
    console.error('[web] promote-first-admin skipped', error);
    return sessionUser;
  }
}

/**
 * UI-language preference straight from the `user` row (`locale` column, added
 * by migration 0006). Better Auth doesn't know this column, so it never shows
 * up in the session payload. Returns null when unset/unknown (means zh) or
 * when the column isn't there yet (pre-migration window).
 */
async function readUserLocale(userId: string): Promise<Locale | null> {
  try {
    const row = await getD1()
      .prepare('SELECT "locale" FROM "user" WHERE "id" = ?')
      .bind(userId)
      .first<{ locale: string | null }>();
    return isLocale(row?.locale) ? row.locale : null;
  } catch (error) {
    console.error('[web] read user locale failed', error);
    return null;
  }
}

export async function getSessionUserFromRequest(
  request?: Request | null,
): Promise<SessionUser | null> {
  if (!request) {
    return null;
  }

  let session: BetterAuthSession = null;
  try {
    session = (await auth.api.getSession({
      headers: request.headers,
    })) as BetterAuthSession;
  } catch (error) {
    // If auth storage is unavailable, keep request flow alive as guest.
    console.error('[web] getSession failed, fallback to guest session', error);
    return null;
  }

  const user = session?.user;
  if (!user?.id || !user.email) {
    return null;
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    role: user.role ?? 'member',
    locale: await readUserLocale(user.id),
  };

  return maybePromoteFirstAdmin(sessionUser);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  return getSessionUserFromRequest(getRequest());
}
