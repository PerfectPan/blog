import bcrypt from 'bcryptjs';
import type { CollectionConfig } from 'payload';
import { buildPublishedReadWhereForRole } from '../lib/access.js';

type RequestUser = {
  role?: 'member' | 'vip' | 'admin';
};

function isAdmin(user?: RequestUser | null): boolean {
  return user?.role === 'admin';
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['visibility', 'title', 'slug', 'updatedAt'],
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  access: {
    admin: ({ req }) => isAdmin(req.user as RequestUser | undefined),
    create: ({ req }) => isAdmin(req.user as RequestUser | undefined),
    read: ({ req }) => {
      const role = (req.user as RequestUser | undefined)?.role ?? null;
      if (role === 'admin') {
        return true;
      }
      return buildPublishedReadWhereForRole(role);
    },
    update: ({ req }) => isAdmin(req.user as RequestUser | undefined),
    delete: ({ req }) => isAdmin(req.user as RequestUser | undefined),
  },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        const mutableData: Record<string, unknown> = {
          ...((data ?? {}) as Record<string, unknown>),
        };
        const passwordPlain = String(mutableData.passwordPlain ?? '').trim();
        if (passwordPlain) {
          mutableData.passwordHash = await bcrypt.hash(passwordPlain, 10);
        }

        if (mutableData.visibility !== 'password') {
          mutableData.passwordHash = null;
        }

        if (mutableData._status === 'published' && !mutableData.publishedAt) {
          mutableData.publishedAt = new Date().toISOString();
        }

        mutableData.passwordPlain = undefined;
        return mutableData;
      },
    ],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'contentMdx',
      type: 'textarea',
      required: true,
    },
    {
      name: 'visibility',
      type: 'select',
      defaultValue: 'public',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Member', value: 'member' },
        { label: 'VIP', value: 'vip' },
        { label: 'Admin', value: 'admin' },
        { label: 'Password', value: 'password' },
      ],
      required: true,
    },
    {
      name: 'passwordPlain',
      type: 'text',
      admin: {
        description:
          'Set or rotate the article password. This value is never stored as plaintext.',
        condition: (_, siblingData) => siblingData.visibility === 'password',
      },
      access: {
        create: ({ req }) => isAdmin(req.user as RequestUser | undefined),
        read: () => false,
        update: ({ req }) => isAdmin(req.user as RequestUser | undefined),
      },
    },
    {
      name: 'passwordHash',
      type: 'text',
      access: {
        create: ({ req }) => isAdmin(req.user as RequestUser | undefined),
        read: ({ req }) => isAdmin(req.user as RequestUser | undefined),
        update: ({ req }) => isAdmin(req.user as RequestUser | undefined),
      },
      admin: {
        readOnly: true,
        condition: () => false,
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};
