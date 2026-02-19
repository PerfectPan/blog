import type { Role } from '@blog/shared';

const ROLE_TO_VISIBILITY: Record<Role, string[]> = {
  member: ['public', 'member'],
  vip: ['public', 'member', 'vip'],
  admin: ['public', 'member', 'vip', 'admin'],
};

export type Where = Record<string, unknown>;

export function getRoleFromRequest(req: Request): Role | null {
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

export function getServiceTokenFromRequest(req: Request): string {
  return (
    req.headers.get('x-service-token') ??
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    ''
  );
}
