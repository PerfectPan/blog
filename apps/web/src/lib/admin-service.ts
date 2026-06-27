import {
  POST_VISIBILITIES,
  type PostVisibility,
  type SessionUser,
} from '@blog/shared';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import {
  type PostRecord,
  getMarkdownPostBaseBySlug,
  getMarkdownPostsBase,
} from './content-service.js';
import { getD1 } from './db.js';
import { getSessionUserFromRequest } from './session-core.js';

async function requireAdmin(): Promise<SessionUser> {
  const sessionUser = await getSessionUserFromRequest(getRequest());
  if (!sessionUser) {
    // Not logged in -> send to the login page.
    throw redirect({ to: '/login' });
  }
  if (sessionUser.role !== 'admin') {
    // Logged in but not an admin -> bounce home (no admin content leaks).
    throw redirect({ to: '/' });
  }
  return sessionUser;
}

export type PostSource = 'markdown' | 'd1';

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
  /** Where this post lives: `markdown` = read-only base file, `d1` = managed row. */
  source: PostSource;
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
    source: 'd1',
  };
}

function markdownRecordToAdminPost(record: PostRecord): AdminPost {
  return {
    slug: record.slug,
    title: record.title,
    description: record.description,
    body: record.contentMdx,
    visibility: record.visibility,
    password: record.password ?? '',
    status: record.status,
    tags: record.tags,
    publishedAt: record.publishedAt,
    source: 'markdown',
  };
}

/** Throws 401/403 if the caller is not an admin; used to guard admin routes. */
export const ensureAdminServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const sessionUser = await requireAdmin();
    return { sessionUser };
  },
);

/**
 * List every post for the admin table, merging both sources:
 *   - D1-managed posts (including drafts) — `source: 'd1'`
 *   - read-only markdown base posts (`content/blog/*.md`) — `source: 'markdown'`
 * A D1 row with the same slug as a markdown file wins (and hides the markdown
 * entry), so editing a legacy post replaces it rather than duplicating it.
 */
export const listAdminPostsServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin();
    const result = await getD1()
      .prepare(
        'SELECT slug, title, description, body, visibility, password, status, tags, publishedAt FROM "post"',
      )
      .all<AdminRow>();
    const d1Posts = (result.results ?? []).map(rowToAdminPost);
    const d1Slugs = new Set(d1Posts.map((post) => post.slug));

    const markdownPosts = getMarkdownPostsBase()
      .filter((record) => !d1Slugs.has(record.slug))
      .map(markdownRecordToAdminPost);

    const posts = [...d1Posts, ...markdownPosts].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
    return { posts };
  },
);

export const getAdminPostServerFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    // D1 row wins; fall back to the read-only markdown base so legacy posts can
    // be opened for editing (saving then creates a D1 override).
    const row = await getD1()
      .prepare(
        'SELECT slug, title, description, body, visibility, password, status, tags, publishedAt FROM "post" WHERE "slug" = ?',
      )
      .bind(data.slug)
      .first<AdminRow>();
    if (row) {
      return { post: rowToAdminPost(row) };
    }
    const markdown = getMarkdownPostBaseBySlug(data.slug);
    return { post: markdown ? markdownRecordToAdminPost(markdown) : null };
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
