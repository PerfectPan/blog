import type { Role, SessionUser } from '@blog/shared';
import { getRequest } from '@tanstack/react-start/server';
import type { Pool } from 'pg';
import { auth } from './auth.js';
import { getPool } from './db.js';
import { getWebEnv } from './env.js';

type BetterAuthSession = {
  user?: {
    id?: string;
    email?: string | null;
    role?: Role;
  } | null;
} | null;

const env = getWebEnv();
const pool = getPool();

async function maybePromoteFirstAdmin(
  db: Pool,
  sessionUser: SessionUser,
): Promise<SessionUser> {
  const allowlist = env.adminEmailAllowlist;
  if (!allowlist.includes(sessionUser.email.toLowerCase())) {
    return sessionUser;
  }

  try {
    const adminResult = await db.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM "user" WHERE "role" = $1',
      ['admin'],
    );

    const count = Number.parseInt(adminResult.rows[0]?.count ?? '0', 10);
    if (count > 0) {
      return sessionUser;
    }

    await db.query('UPDATE "user" SET "role" = $1 WHERE "id" = $2', [
      'admin',
      sessionUser.id,
    ]);

    return { ...sessionUser, role: 'admin' };
  } catch (error) {
    console.error('[web] promote-first-admin skipped', error);
    return sessionUser;
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
  };

  return maybePromoteFirstAdmin(pool, sessionUser);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  return getSessionUserFromRequest(getRequest());
}
