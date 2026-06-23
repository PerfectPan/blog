import {
  POST_VISIBILITIES,
  type PostVisibility,
  type SessionUser,
} from '@blog/shared';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { getD1 } from './db.js';
import { getSessionUserFromRequest } from './session-core.js';

async function requireAdmin(): Promise<SessionUser> {
  const sessionUser = await getSessionUserFromRequest(getRequest());
  if (!sessionUser) {
    throw new Response('Authentication required', { status: 401 });
  }
  if (sessionUser.role !== 'admin') {
    throw new Response('Forbidden', { status: 403 });
  }
  return sessionUser;
}

export type AdminPost = {
  slug: string;
  title: string;
  description: string;
  body: string;
  visibility: PostVisibility;
  password: string;
  status: 'draft' | 'published';
  tags: string[];
  publishedAt: string;
};

type AdminRow = {
  slug: string;
  title: string;
  description: string;
  body: string;
  visibility: string;
  password: string | null;
  status: string;
  tags: string;
  publishedAt: string;
};

function rowToAdminPost(row: AdminRow): AdminPost {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(row.tags) as unknown;
    tags = Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    tags = [];
  }
  const visibility = (POST_VISIBILITIES as readonly string[]).includes(
    row.visibility,
  )
    ? (row.visibility as PostVisibility)
    : 'public';

  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    body: row.body,
    visibility,
    password: row.password ?? '',
    status: row.status === 'draft' ? 'draft' : 'published',
    tags,
    publishedAt: row.publishedAt,
  };
}

/** Throws 401/403 if the caller is not an admin; used to guard admin routes. */
export const ensureAdminServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const sessionUser = await requireAdmin();
    return { sessionUser };
  },
);

/** List every D1 post (including drafts) for the admin table. */
export const listAdminPostsServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin();
    const result = await getD1()
      .prepare(
        'SELECT slug, title, description, body, visibility, password, status, tags, publishedAt FROM "post" ORDER BY "publishedAt" DESC',
      )
      .all<AdminRow>();
    return { posts: (result.results ?? []).map(rowToAdminPost) };
  },
);

export const getAdminPostServerFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const row = await getD1()
      .prepare(
        'SELECT slug, title, description, body, visibility, password, status, tags, publishedAt FROM "post" WHERE "slug" = ?',
      )
      .bind(data.slug)
      .first<AdminRow>();
    return { post: row ? rowToAdminPost(row) : null };
  });

const upsertSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug 只能是小写字母/数字/连字符'),
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(''),
  body: z.string().default(''),
  visibility: z.enum(POST_VISIBILITIES),
  password: z.string().max(200).default(''),
  status: z.enum(['draft', 'published']),
  tags: z.array(z.string()).default([]),
  publishedAt: z.string().min(1),
});

export const upsertPostServerFn = createServerFn({ method: 'POST' })
  .inputValidator(upsertSchema)
  .handler(async ({ data }) => {
    await requireAdmin();
    const now = new Date().toISOString();
    const password = data.visibility === 'password' ? data.password : '';

    await getD1()
      .prepare(
        `INSERT INTO "post"
           ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt")
         VALUES (?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT("slug") DO UPDATE SET
           "title"=excluded."title",
           "description"=excluded."description",
           "body"=excluded."body",
           "visibility"=excluded."visibility",
           "password"=excluded."password",
           "status"=excluded."status",
           "tags"=excluded."tags",
           "publishedAt"=excluded."publishedAt",
           "updatedAt"=excluded."updatedAt"`,
      )
      .bind(
        data.slug,
        data.title,
        data.description,
        data.body,
        data.visibility,
        password,
        data.status,
        JSON.stringify(data.tags),
        data.publishedAt,
        now,
        now,
      )
      .run();

    return { ok: true, slug: data.slug };
  });

export const deletePostServerFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    await getD1()
      .prepare('DELETE FROM "post" WHERE "slug" = ?')
      .bind(data.slug)
      .run();
    return { ok: true };
  });
