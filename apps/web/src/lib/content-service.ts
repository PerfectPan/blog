import {
  POST_VISIBILITIES,
  type PostDetail,
  type PostStatus,
  type PostSummary,
  type PostVisibility,
} from '@blog/shared';
import { getD1 } from './db.js';

/**
 * Content source: posts in the D1 `post` table (created/edited via /admin, plus
 * the one-time seed imported from the legacy markdown). The public blog and the
 * admin both read from here. Per-post visibility/password gating is applied
 * upstream of these helpers.
 */

export type PostRecord = PostDetail & { readonly password?: string };

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

async function getPosts(): Promise<PostRecord[]> {
  try {
    const result = await getD1()
      .prepare(
        'SELECT slug, title, description, body, visibility, password, status, tags, publishedAt FROM "post"',
      )
      .all<PostRow>();
    return (result.results ?? []).map(rowToRecord);
  } catch (error) {
    console.error('[web] D1 post query failed', error);
    return [];
  }
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
  return (await getPosts())
    .filter((post) => post.status === 'published')
    .map(toSummary);
}

/** A single published post by slug, or null. */
export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const post = (await getPosts()).find((item) => item.slug === slug);
  if (post?.status !== 'published') {
    return null;
  }
  return toDetail(post);
}

/**
 * A published post's visibility by slug, or null. Hits the slug primary key
 * (one row) instead of `getPostBySlug`'s full-table scan — for callers that
 * only need the visibility to make an access decision (e.g. the comment gate).
 */
export async function getPostVisibilityBySlug(
  slug: string,
): Promise<PostVisibility | null> {
  try {
    const row = await getD1()
      .prepare('SELECT "visibility", "status" FROM "post" WHERE "slug" = ?')
      .bind(slug)
      .first<{ visibility: string; status: string }>();
    if (row?.status !== 'published') {
      return null;
    }
    return normalizeVisibility(row.visibility);
  } catch (error) {
    console.error('[web] D1 post visibility query failed', error);
    return null;
  }
}

/** Plaintext password check for `visibility: password` posts. */
export async function verifyPostPassword(
  slug: string,
  password: string,
): Promise<boolean> {
  const post = (await getPosts()).find((item) => item.slug === slug);
  if (post?.visibility !== 'password' || !post?.password) {
    return false;
  }
  return post.password === password;
}
