import type { Role } from '@blog/shared';
import type { Where } from 'payload';

const ROLE_TO_VISIBILITY: Record<Role, string[]> = {
  member: ['public', 'member'],
  vip: ['public', 'member', 'vip'],
  admin: ['public', 'member', 'vip', 'admin'],
};

type RequestLikeWithHeaders = {
  headers: Headers;
};

export function getRoleFromRequest(req: RequestLikeWithHeaders): Role | null {
  const roleHeader = req.headers.get('x-user-role');
  if (
    roleHeader === 'member' ||
    roleHeader === 'vip' ||
    roleHeader === 'admin'
  ) {
    return roleHeader;
  }

  return null;
}

export function buildPublishedReadWhereForRole(role: Role | null): Where {
  if (!role) {
    return {
      and: [
        { _status: { equals: 'published' } },
        { visibility: { equals: 'public' } },
      ],
    };
  }

  if (role === 'admin') {
    return {
      _status: { equals: 'published' },
    };
  }

  return {
    and: [
      { _status: { equals: 'published' } },
      { visibility: { in: ROLE_TO_VISIBILITY[role] } },
    ],
  };
}

export function getServiceTokenFromRequest(
  req: RequestLikeWithHeaders,
): string {
  return (
    req.headers.get('x-service-token') ??
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    ''
  );
}
