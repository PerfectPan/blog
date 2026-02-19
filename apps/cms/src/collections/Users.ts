import type { Role, UserStatus } from '@blog/shared';
import type { CollectionConfig } from 'payload';
import { getCmsEnv } from '../lib/env.js';

type UserShape = {
  id: string;
  email?: string;
  role?: Role;
  status?: UserStatus;
};

type UserCountRequest = {
  payload: {
    find: (args: Record<string, unknown>) => Promise<{ totalDocs: number }>;
  };
};

function isAdmin(user?: UserShape | null): boolean {
  return user?.role === 'admin';
}

function isSelf(user: UserShape | null | undefined, id: string): boolean {
  return Boolean(user?.id && user.id === id);
}

async function isFirstUser(req: UserCountRequest): Promise<boolean> {
  const result = await req.payload.find({
    collection: 'users',
    limit: 1,
    depth: 0,
  });

  return result.totalDocs === 0;
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24,
  },
  access: {
    admin: ({ req }) => isAdmin(req.user as UserShape | undefined),
    create: async ({ req }) => {
      if (isAdmin(req.user as UserShape | undefined)) {
        return true;
      }

      return isFirstUser(req);
    },
    read: ({ req }) => {
      const user = req.user as UserShape | undefined;
      if (!user) {
        return false;
      }

      if (isAdmin(user)) {
        return true;
      }

      return {
        id: {
          equals: user.id,
        },
      };
    },
    update: ({ req, id }) => {
      const user = req.user as UserShape | undefined;
      if (!user) {
        return false;
      }

      if (isAdmin(user)) {
        return true;
      }

      return isSelf(user, String(id));
    },
    delete: ({ req }) => isAdmin(req.user as UserShape | undefined),
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (!data) {
          return data;
        }

        if (operation === 'create') {
          const env = getCmsEnv();
          const email = String(data.email ?? '').toLowerCase();
          const shouldPromote =
            env.adminEmailAllowlist.includes(email) && (await isFirstUser(req));
          if (shouldPromote) {
            data.role = 'admin';
          }
        }

        if (!data.role) {
          data.role = 'member';
        }

        if (!data.status) {
          data.status = 'active';
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'member',
      options: [
        { label: 'Member', value: 'member' },
        { label: 'VIP', value: 'vip' },
        { label: 'Admin', value: 'admin' },
      ],
      saveToJWT: true,
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Disabled', value: 'disabled' },
      ],
      saveToJWT: true,
      required: true,
    },
    {
      name: 'githubId',
      type: 'text',
      unique: true,
    },
  ],
};
