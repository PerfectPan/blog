-- Self-hosted comments (replaces utteranc.es / GitHub Issues).
-- See docs/superpowers/specs/2026-07-14-self-hosted-comments-design.md
--
-- One row per comment. `parentId` is nullable: NULL = top-level comment; a
-- non-null value points at a top-level comment, so reply depth is capped at 1
-- (enforced in apps/web/src/lib/comments-service.ts on write).
-- `status` drives post-moderation: visible (default, shown to everyone) /
-- hidden / spam (both hidden from non-admins; differ only for admin triage).
-- Hard delete (DELETE row) is separate and used by the author or an admin.
--
-- No FK constraints, matching the `post` table (D1 ships with
-- `foreign_keys=OFF`); slug/user existence is validated at the app layer.

CREATE TABLE IF NOT EXISTS "comment" (
  "id"        text NOT NULL PRIMARY KEY,
  "slug"      text NOT NULL,
  "userId"    text NOT NULL,
  "parentId"  text,
  "body"      text NOT NULL,
  "status"    text NOT NULL DEFAULT 'visible',
  "createdAt" text NOT NULL,
  "updatedAt" text NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_comment_slug_created" ON "comment" ("slug","createdAt");
CREATE INDEX IF NOT EXISTS "idx_comment_parent"       ON "comment" ("parentId");
CREATE INDEX IF NOT EXISTS "idx_comment_user"         ON "comment" ("userId");
CREATE INDEX IF NOT EXISTS "idx_comment_status"       ON "comment" ("status");
