import {
  COMMENT_STATUSES,
  type Comment,
  type CommentStatus,
  type CommentThread,
  canAccessComments,
  canManageComment,
  getUnlockCookieName,
  ROLES,
  type Role,
  type SessionUser,
} from '@blog/shared';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { getPostBySlug } from './content-service.js';
import { getD1 } from './db.js';
import { getSessionUserFromRequest } from './session-core.js';
import { isUnlockCookieValid, parseCookies } from './unlock-cookie.js';

/**
 * Self-hosted comments (replaces utteranc.es). See
 * docs/superpowers/specs/2026-07-14-self-hosted-comments-design.md.
 *
 * Every fn resolves the session and re-checks post access *inside the handler*,
 * because server fns are reachable over RPC — the route loader's gate is not
 * enough on its own (docs/architecture.md §6).
 */

/** Min gap between two comments from the same user. */
const COMMENT_COOLDOWN_MS = 60_000;
/** Max comment body length (markdown source). */
const COMMENT_BODY_MAX = 2000;
const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;

/** Throws toward /login if there is no session; returns the session user. */
async function requireSession(): Promise<SessionUser> {
  const sessionUser = await getSessionUserFromRequest(getRequest());
  if (!sessionUser) {
    throw redirect({ to: '/login' });
  }
  return sessionUser;
}

/** Throws toward /login (no session) or / (not admin); returns the session user. */
async function requireAdmin(): Promise<SessionUser> {
  const sessionUser = await requireSession();
  if (sessionUser.role !== 'admin') {
    throw redirect({ to: '/' });
  }
  return sessionUser;
}

/**
 * Can the current viewer read/comment on `slug`? Re-derives the same gate as
 * `getBlogPostServerFn` (content-service): public → anyone; password → admin or
 * a valid signed unlock cookie; member/vip/admin → role ladder. Returns false
 * for missing or unpublished posts, so callers can silently return an empty
 * result without leaking that comments exist.
 */
async function canViewerAccessPostSlug(
  slug: string,
  sessionUser: SessionUser | null,
): Promise<boolean> {
  const post = await getPostBySlug(slug);
  if (!post) {
    return false;
  }

  let unlocked = false;
  if (post.visibility === 'password') {
    const request = getRequest();
    const cookies = parseCookies(request?.headers.get('cookie') ?? null);
    unlocked =
      sessionUser?.role === 'admin' ||
      isUnlockCookieValid(slug, cookies[getUnlockCookieName(slug)]);
  }

  return canAccessComments(
    post.visibility,
    sessionUser?.role ?? null,
    unlocked,
  );
}

type CommentRow = {
  id: string;
  slug: string;
  body: string;
  createdAt: string;
  parentId: string | null;
  status: string;
  userId: string;
  authorName: string | null;
  authorImage: string | null;
  authorRole: string | null;
};

function normalizeStatus(value: string): CommentStatus {
  return (COMMENT_STATUSES as readonly string[]).includes(value)
    ? (value as CommentStatus)
    : 'visible';
}

function normalizeRole(value: string | null): Role {
  return (ROLES as readonly string[]).includes(value ?? '')
    ? (value as Role)
    : 'member';
}

function toComment(row: CommentRow, sessionUser: SessionUser | null): Comment {
  return {
    id: row.id,
    slug: row.slug,
    body: row.body,
    createdAt: row.createdAt,
    parentId: row.parentId,
    status: normalizeStatus(row.status),
    author: {
      name: row.authorName ?? '匿名',
      image: row.authorImage ?? null,
      role: normalizeRole(row.authorRole),
    },
    isOwn: sessionUser != null && row.userId === sessionUser.id,
  };
}

const COMMENT_COLUMNS = `
  c."id", c."slug", c."body", c."createdAt", c."parentId", c."status", c."userId",
  u."name" AS "authorName", u."image" AS "authorImage", u."role" AS "authorRole"
`;

const TOP_LEVEL_PUBLIC_SQL = `
  SELECT ${COMMENT_COLUMNS}
  FROM "comment" c LEFT JOIN "user" u ON u."id" = c."userId"
  WHERE c."slug" = ? AND c."parentId" IS NULL AND c."status" = 'visible'
  ORDER BY c."createdAt" DESC
  LIMIT ? OFFSET ?`;

const TOP_LEVEL_ADMIN_SQL = `
  SELECT ${COMMENT_COLUMNS}
  FROM "comment" c LEFT JOIN "user" u ON u."id" = c."userId"
  WHERE c."slug" = ? AND c."parentId" IS NULL
  ORDER BY c."createdAt" DESC
  LIMIT ? OFFSET ?`;

const COUNT_PUBLIC_SQL = `SELECT COUNT(*) AS "total" FROM "comment" WHERE "slug" = ? AND "parentId" IS NULL AND "status" = 'visible'`;
const COUNT_ADMIN_SQL = `SELECT COUNT(*) AS "total" FROM "comment" WHERE "slug" = ? AND "parentId" IS NULL`;

const REPLY_FILTER_VISIBLE = `AND c."status" = 'visible'`;

const getCommentsInput = z.object({
  slug: z.string().min(1).max(120),
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(PAGE_SIZE_MAX).default(PAGE_SIZE_DEFAULT),
});

/** First page (or a deeper page) of threaded comments for a post. */
export const getCommentsServerFn = createServerFn({ method: 'GET' })
  .inputValidator(getCommentsInput)
  .handler(async ({ data }) => {
    const request = getRequest();
    const sessionUser = await getSessionUserFromRequest(request);

    if (!(await canViewerAccessPostSlug(data.slug, sessionUser))) {
      return { comments: [] as CommentThread[], total: 0, hasMore: false };
    }

    const isAdmin = sessionUser?.role === 'admin';
    const db = getD1();

    const topResult = await db
      .prepare(isAdmin ? TOP_LEVEL_ADMIN_SQL : TOP_LEVEL_PUBLIC_SQL)
      .bind(data.slug, data.limit, data.offset)
      .all<CommentRow>();
    const topRows = topResult.results ?? [];

    const countRow = await db
      .prepare(isAdmin ? COUNT_ADMIN_SQL : COUNT_PUBLIC_SQL)
      .bind(data.slug)
      .first<{ total: number }>();
    const total = Number(countRow?.total ?? 0);

    // Replies for the fetched top-level comments (one level deep). Placeholder
    // list is built from the count only — ids are still bound, never interpolated.
    const repliesByParent = new Map<string, CommentRow[]>();
    if (topRows.length > 0) {
      const ids = topRows.map((row) => row.id);
      const placeholders = ids.map(() => '?').join(',');
      const replySql = `
        SELECT ${COMMENT_COLUMNS}
        FROM "comment" c LEFT JOIN "user" u ON u."id" = c."userId"
        WHERE c."parentId" IN (${placeholders}) ${isAdmin ? '' : REPLY_FILTER_VISIBLE}
        ORDER BY c."createdAt" ASC`;
      const replyResult = await db
        .prepare(replySql)
        .bind(...ids)
        .all<CommentRow>();
      for (const row of replyResult.results ?? []) {
        const list = repliesByParent.get(row.parentId ?? '');
        if (list) {
          list.push(row);
        } else {
          repliesByParent.set(row.parentId ?? '', [row]);
        }
      }
    }

    const comments: CommentThread[] = topRows.map((row) => {
      const comment = toComment(row, sessionUser);
      const replies = (repliesByParent.get(comment.id) ?? []).map((r) =>
        toComment(r, sessionUser),
      );
      return { ...comment, replies };
    });

    const hasMore = data.offset + comments.length < total;
    return { comments, total, hasMore };
  });

const createCommentInput = z.object({
  slug: z.string().min(1).max(120),
  parentId: z.string().min(1).optional(),
  body: z
    .string()
    .max(COMMENT_BODY_MAX)
    .refine((s) => s.trim().length >= 1, { message: '评论不能为空' }),
});

/** Post a comment (top-level if no parentId, else a one-level reply). */
export const createCommentServerFn = createServerFn({ method: 'POST' })
  .inputValidator(createCommentInput)
  .handler(async ({ data }) => {
    const sessionUser = await requireSession();

    if (!(await canViewerAccessPostSlug(data.slug, sessionUser))) {
      throw new Error('无权在该文章评论');
    }

    const db = getD1();

    // Depth ≤ 1: a reply's parent must exist, belong to the same post, and
    // itself be top-level (parentId IS NULL).
    if (data.parentId) {
      const parent = await db
        .prepare('SELECT "slug", "parentId" FROM "comment" WHERE "id" = ?')
        .bind(data.parentId)
        .first<{ slug: string; parentId: string | null }>();
      if (!parent || parent.slug !== data.slug || parent.parentId !== null) {
        throw new Error('回复目标无效');
      }
    }

    // Rate limit: at most one comment per user per cooldown window. Backed by
    // D1 (shared state), so it works across isolates — unlike an in-process Map.
    const last = await db
      .prepare(
        'SELECT "createdAt" FROM "comment" WHERE "userId" = ? ORDER BY "createdAt" DESC LIMIT 1',
      )
      .bind(sessionUser.id)
      .first<{ createdAt: string }>();
    if (last?.createdAt) {
      const elapsedMs = Date.now() - new Date(last.createdAt).getTime();
      if (elapsedMs < COMMENT_COOLDOWN_MS) {
        throw new Error('评论太快了，请稍后再试');
      }
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await db
      .prepare(
        'INSERT INTO "comment" ("id","slug","userId","parentId","body","status","createdAt","updatedAt") VALUES (?,?,?,?,?,?,?,?)',
      )
      .bind(
        id,
        data.slug,
        sessionUser.id,
        data.parentId ?? null,
        data.body,
        'visible',
        now,
        now,
      )
      .run();

    const userRow = await db
      .prepare('SELECT "name", "image" FROM "user" WHERE "id" = ?')
      .bind(sessionUser.id)
      .first<{ name: string | null; image: string | null }>();

    const comment: Comment = {
      id,
      slug: data.slug,
      body: data.body,
      createdAt: now,
      parentId: data.parentId ?? null,
      status: 'visible',
      author: {
        name: userRow?.name ?? '匿名',
        image: userRow?.image ?? null,
        role: sessionUser.role,
      },
      isOwn: true,
    };
    return { comment };
  });

const deleteCommentInput = z.object({ id: z.string().min(1) });

/** Hard-delete a comment. The author or an admin may do this. */
export const deleteCommentServerFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteCommentInput)
  .handler(async ({ data }) => {
    const sessionUser = await requireSession();
    const db = getD1();

    const row = await db
      .prepare('SELECT "userId" FROM "comment" WHERE "id" = ?')
      .bind(data.id)
      .first<{ userId: string }>();
    if (!row) {
      throw new Error('评论不存在');
    }
    if (!canManageComment(row.userId, sessionUser)) {
      throw new Error('无权删除该评论');
    }

    await db
      .prepare('DELETE FROM "comment" WHERE "id" = ?')
      .bind(data.id)
      .run();
    return { ok: true };
  });

const setCommentStatusInput = z.object({
  id: z.string().min(1),
  status: z.enum(COMMENT_STATUSES),
});

/** Soft-moderate a comment (hide / mark spam / restore). Admin only. */
export const setCommentStatusServerFn = createServerFn({ method: 'POST' })
  .inputValidator(setCommentStatusInput)
  .handler(async ({ data }) => {
    await requireAdmin();
    const now = new Date().toISOString();
    await getD1()
      .prepare(
        'UPDATE "comment" SET "status" = ?, "updatedAt" = ? WHERE "id" = ?',
      )
      .bind(data.status, now, data.id)
      .run();
    return { ok: true };
  });

const listCommentsInput = z.object({
  status: z.enum(COMMENT_STATUSES).optional(),
  slug: z.string().optional(),
});

/** Every comment (newest-first) for the admin moderation view. Admin only. */
export const listCommentsServerFn = createServerFn({ method: 'GET' })
  .inputValidator(listCommentsInput)
  .handler(async ({ data }) => {
    const sessionUser = await requireAdmin();
    const db = getD1();

    const result = await db
      .prepare(
        `SELECT ${COMMENT_COLUMNS}
         FROM "comment" c LEFT JOIN "user" u ON u."id" = c."userId"
         ORDER BY c."createdAt" DESC`,
      )
      .all<CommentRow>();

    let comments = (result.results ?? []).map((row) =>
      toComment(row, sessionUser),
    );
    if (data.status) {
      comments = comments.filter((c) => c.status === data.status);
    }
    if (data.slug) {
      const needle = data.slug.trim().toLowerCase();
      comments = comments.filter((c) => c.slug.toLowerCase().includes(needle));
    }
    return { comments };
  });
