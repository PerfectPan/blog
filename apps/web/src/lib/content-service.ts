import {
  POST_VISIBILITIES,
  type PostDetail,
  type PostStatus,
  type PostSummary,
  type PostVisibility,
} from '@blog/shared';
import matter from 'gray-matter';
import { getD1 } from './db.js';

/**
 * Two content sources, merged:
 *
 * 1. Legacy markdown in `content/blog/*.md`, inlined at build time. Read-only.
 * 2. Admin-managed posts in the D1 `post` table (created/edited via /admin).
 *
 * A D1 row with the same slug overrides its markdown counterpart, so the admin
 * UI can edit legacy posts too. Per-post visibility/password gating is the same
 * for both sources.
 */

// --- Source 1: legacy markdown (parsed once at module load) -----------------

const rawModules = import.meta.glob('../../../../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function slugFromPath(filePath: string): string {
  const file = filePath.split('/').pop() ?? filePath;
  return file.replace(/\.md$/i, '');
}

function normalizeVisibility(value: unknown): PostVisibility {
  if (
    typeof value === 'string' &&
    (POST_VISIBILITIES as readonly string[]).includes(value)
  ) {
    return value as PostVisibility;
  }
  return 'public';
}

function normalizeStatus(value: unknown): PostStatus {
  return value === 'draft' ? 'draft' : 'published';
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return new Date(0).toISOString();
}

function toTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
}

export type PostRecord = PostDetail & { readonly password?: string };

const MARKDOWN_POSTS: PostRecord[] = Object.entries(rawModules)
  .map(([filePath, raw]) => {
    const parsed = matter(raw);
    const data = parsed.data as Record<string, unknown>;
    const visibility = normalizeVisibility(data.visibility);
    const password =
      visibility === 'password' && typeof data.password === 'string'
        ? data.password
        : undefined;

    return {
      slug: slugFromPath(filePath),
      title: String(data.title ?? slugFromPath(filePath)),
      description: String(data.description ?? ''),
      publishedAt: toIsoDate(data.date),
      visibility,
      tags: toTags(data.tag ?? data.tags),
      contentMdx: parsed.content,
      status: normalizeStatus(data.status),
      passwordEnabled: visibility === 'password',
      password,
    } satisfies PostRecord;
  })
  .filter((post) => post.status === 'published');

// --- Source 2: D1 posts -----------------------------------------------------

type PostRow = {
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

function rowToRecord(row: PostRow): PostRecord {
  const visibility = normalizeVisibility(row.visibility);
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(row.tags) as unknown;
    tags = Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    tags = [];
  }

  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    publishedAt: row.publishedAt,
    visibility,
    tags,
    contentMdx: row.body,
    status: normalizeStatus(row.status),
    passwordEnabled: visibility === 'password',
    password:
      visibility === 'password' ? (row.password ?? undefined) : undefined,
  };
}

async function getD1Posts(): Promise<PostRecord[]> {
  try {
    const result = await getD1()
      .prepare(
        'SELECT slug, title, description, body, visibility, password, status, tags, publishedAt FROM "post"',
      )
      .all<PostRow>();
    return (result.results ?? []).map(rowToRecord);
  } catch (error) {
    console.error('[web] D1 post query failed, markdown only', error);
    return [];
  }
}

/** Merge D1 over markdown (D1 wins on slug), published only. */
async function getMergedPosts(): Promise<PostRecord[]> {
  const bySlug = new Map<string, PostRecord>();
  for (const post of MARKDOWN_POSTS) {
    bySlug.set(post.slug, post);
  }
  for (const post of await getD1Posts()) {
    bySlug.set(post.slug, post);
  }
  return [...bySlug.values()].filter((post) => post.status === 'published');
}

function toSummary(post: PostRecord): PostSummary {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    visibility: post.visibility,
    tags: post.tags,
  };
}

function toDetail(post: PostRecord): PostDetail {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    visibility: post.visibility,
    tags: post.tags,
    contentMdx: post.contentMdx,
    status: post.status,
    passwordEnabled: post.passwordEnabled,
  };
}

/** All published posts as summaries (visibility filtering happens upstream). */
export async function getAllPublishedPosts(): Promise<PostSummary[]> {
  return (await getMergedPosts()).map(toSummary);
}

/** A single published post by slug, or null. */
export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const posts = await getMergedPosts();
  const post = posts.find((item) => item.slug === slug);
  return post ? toDetail(post) : null;
}

/** Plaintext password check for `visibility: password` posts. */
export async function verifyPostPassword(
  slug: string,
  password: string,
): Promise<boolean> {
  const posts = await getMergedPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post || post.visibility !== 'password' || !post.password) {
    return false;
  }
  return post.password === password;
}

// --- Admin helpers ----------------------------------------------------------
// The admin list/edit views need to see the read-only markdown base too (the
// legacy `content/blog/*.md` posts), so an admin can browse every article and
// open a markdown post for editing (which then creates a D1 override on save).

/** Every parsed markdown post (read-only base, includes body + tags). */
export function getMarkdownPostsBase(): PostRecord[] {
  return MARKDOWN_POSTS;
}

/** A single markdown base post by slug (no published-only filter). */
export function getMarkdownPostBaseBySlug(slug: string): PostRecord | null {
  return MARKDOWN_POSTS.find((post) => post.slug === slug) ?? null;
}
