import type { PostVisibility, Role } from './types.js';

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
