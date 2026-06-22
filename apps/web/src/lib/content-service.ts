import {
  POST_VISIBILITIES,
  type PostDetail,
  type PostStatus,
  type PostSummary,
  type PostVisibility,
} from '@blog/shared';
import matter from 'gray-matter';

/**
 * Git-backed content source.
 *
 * Posts live as markdown files in the repo's `content/blog/` directory and are
 * inlined at build time via Vite's `import.meta.glob`. There is no CMS and no
 * database read on the content path — adding a post is `git add` + push.
 *
 * Per-post access control is preserved and driven entirely by frontmatter:
 *
 *   ---
 *   title: ...
 *   date: 2024-01-02
 *   description: ...
 *   tag: [TypeScript]
 *   visibility: public | member | vip | admin | password   # default: public
 *   password: "hunter2"   # only used when visibility === 'password'
 *   status: published | draft                                # default: published
 *   ---
 */

// Eagerly inline every markdown file under content/blog as a raw string.
// Path is relative to this file: apps/web/src/lib -> repo root is ../../../../
const rawModules = import.meta.glob('../../../../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

type ParsedPost = PostDetail;

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

// Internal full record keeps the plaintext password for server-side verify.
type PostRecord = ParsedPost & { readonly password?: string };

const ALL_POSTS: PostRecord[] = Object.entries(rawModules)
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
export function getAllPublishedPosts(): PostSummary[] {
  return ALL_POSTS.map(toSummary);
}

/** A single published post by slug, or null. */
export function getPostBySlug(slug: string): PostDetail | null {
  const post = ALL_POSTS.find((item) => item.slug === slug);
  return post ? toDetail(post) : null;
}

/** Constant-time-ish plaintext password check for `visibility: password` posts. */
export function verifyPostPassword(slug: string, password: string): boolean {
  const post = ALL_POSTS.find((item) => item.slug === slug);
  if (!post || post.visibility !== 'password' || !post.password) {
    return false;
  }
  return post.password === password;
}
