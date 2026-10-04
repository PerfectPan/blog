import {
  POST_VISIBILITIES,
  type PostDetail,
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

function normalizeVisibility(value: unknown): PostVisibility {
  if (
    typeof value === 'string' &&
    (POST_VISIBILITIES as readonly string[]).includes(value)
  ) {
    return value as PostVisibility;
  }
  return 'public';
}

type PostSummaryRow = {
  slug: string;
  title: string;
  description: string;
  visibility: string;
  tags: string;
  publishedAt: string;
};

type PostDetailRow = PostSummaryRow & { body: string };

const SUMMARY_COLUMNS =
  'slug, title, description, visibility, tags, publishedAt';

function toSummary(row: PostSummaryRow): PostSummary {
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
    visibility: normalizeVisibility(row.visibility),
    tags,
  };
}

function toDetail(row: PostDetailRow): PostDetail {
  const summary = toSummary(row);
  return {
    ...summary,
    contentMdx: row.body,
    status: 'published',
    passwordEnabled: summary.visibility === 'password',
  };
}

/** All published posts as summaries (visibility filtering happens upstream). */
export async function getAllPublishedPosts(): Promise<PostSummary[]> {
  try {
    const result = await getD1()
      .prepare(
        `SELECT ${SUMMARY_COLUMNS} FROM "post" WHERE status = 'published'`,
      )
      .all<PostSummaryRow>();
    return result.results.map(toSummary);
  } catch (error) {
    console.error('[web] D1 post summaries query failed', error);
    return [];
  }
}

/** All published posts with their full body (for RSS full-content feeds). */
export async function getAllPublishedPostDetails(): Promise<PostDetail[]> {
  try {
    const result = await getD1()
      .prepare(
        `SELECT ${SUMMARY_COLUMNS}, body FROM "post" WHERE status = 'published'`,
      )
      .all<PostDetailRow>();
    return result.results.map(toDetail);
  } catch (error) {
    console.error('[web] D1 post details query failed', error);
    return [];
  }
}

/** A single published post by slug, or null. */
export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  try {
    const row = await getD1()
      .prepare(
        `SELECT ${SUMMARY_COLUMNS}, body FROM "post" WHERE slug = ? AND status = 'published'`,
      )
      .bind(slug)
      .first<PostDetailRow>();
    return row ? toDetail(row) : null;
  } catch (error) {
    console.error('[web] D1 post query failed', error);
    return null;
  }
}

/**
 * A published post's visibility by slug, or null. Hits the slug primary key
 * (one row), without reading the body, for callers that only need visibility to make an access decision (e.g. the comment gate).
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
  try {
    const row = await getD1()
      .prepare(
        `SELECT password FROM "post" WHERE slug = ? AND status = 'published' AND visibility = 'password'`,
      )
      .bind(slug)
      .first<{ password: string | null }>();
    return Boolean(row?.password) && row?.password === password;
  } catch (error) {
    console.error('[web] D1 post password query failed', error);
    return false;
  }
}
