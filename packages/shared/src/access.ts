import type {
  CommentStatus,
  PostVisibility,
  Role,
  SessionUser,
} from './types.js';

const ROLE_WEIGHT: Record<Role, number> = {
  member: 10,
  vip: 20,
  admin: 30,
};

export const PASSWORD_UNLOCK_COOKIE_PREFIX = 'blog_unlock_';

export const VISIBILITY_TO_MIN_ROLE: Partial<Record<PostVisibility, Role>> = {
  member: 'member',
  vip: 'vip',
  admin: 'admin',
};

export function isRoleAtLeast(currentRole: Role, requiredRole: Role): boolean {
  return ROLE_WEIGHT[currentRole] >= ROLE_WEIGHT[requiredRole];
}

export function canAccessVisibility(
  visibility: PostVisibility,
  role?: Role | null,
): boolean {
  if (visibility === 'public') {
    return true;
  }

  if (visibility === 'password') {
    return false;
  }

  if (!role) {
    return false;
  }

  const minRole = VISIBILITY_TO_MIN_ROLE[visibility];
  if (!minRole) {
    return false;
  }

  return isRoleAtLeast(role, minRole);
}

export function getUnlockCookieName(slug: string): string {
  return `${PASSWORD_UNLOCK_COOKIE_PREFIX}${slug}`;
}

/**
 * Can this viewer read (and therefore comment on) a post's comments?
 *
 * Comments are gated by the *post's* visibility, exactly like the post body is
 * (see docs/architecture.md §6). `getCommentsServerFn` is reachable over RPC, so
 * this gate is enforced inside the server fn — not only in the route loader.
 *
 * `unlocked` for a `password` post is computed upstream as
 * `role === 'admin' || validUnlockCookie`, then passed in here so this function
 * stays pure and unit-testable.
 */
export function canAccessComments(
  visibility: PostVisibility,
  role: Role | null | undefined,
  unlocked: boolean,
): boolean {
  if (visibility === 'public') {
    return true;
  }
  if (visibility === 'password') {
    return unlocked;
  }
  return canAccessVisibility(visibility, role);
}

/** Only `visible` comments are shown to non-admins; admins see all statuses. */
export function isCommentVisibleTo(
  status: CommentStatus,
  role: Role | null | undefined,
): boolean {
  if (role === 'admin') {
    return true;
  }
  return status === 'visible';
}

/**
 * Can this session user delete/hide a comment? The author can act on their own;
 * admins can act on anyone's. Used by `deleteCommentServerFn` (author|admin)
 * and `setCommentStatusServerFn` (admin only, checked separately via requireAdmin).
 */
export function canManageComment(
  commentUserId: string,
  sessionUser: SessionUser | null | undefined,
): boolean {
  if (!sessionUser) {
    return false;
  }
  return commentUserId === sessionUser.id || sessionUser.role === 'admin';
}
