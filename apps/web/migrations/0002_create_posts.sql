-- Admin-managed posts live in D1 (the git-markdown files in content/blog stay
-- as read-only legacy; a D1 row with the same slug overrides its markdown).

CREATE TABLE IF NOT EXISTS "post" (
  "slug" text NOT NULL PRIMARY KEY,
  "title" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "body" text NOT NULL DEFAULT '',
  "visibility" text NOT NULL DEFAULT 'public',
  "password" text,
  "status" text NOT NULL DEFAULT 'published',
  "tags" text NOT NULL DEFAULT '[]',
  "publishedAt" text NOT NULL,
  "createdAt" text NOT NULL,
  "updatedAt" text NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_post_status" ON "post" ("status");
