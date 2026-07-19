export const ROLES = ['member', 'vip', 'admin'] as const;

export const POST_VISIBILITIES = [
  'public',
  'member',
  'vip',
  'admin',
  'password',
] as const;

export const COMMENT_STATUSES = ['visible', 'hidden', 'spam'] as const;

export type Role = (typeof ROLES)[number];

export type PostVisibility = (typeof POST_VISIBILITIES)[number];

export type CommentStatus = (typeof COMMENT_STATUSES)[number];

export type PostStatus = 'draft' | 'published';

export type UserStatus = 'active' | 'disabled';

export interface SessionUser {
  id: string;
  role: Role;
  email: string;
}

/**
 * Author of a comment. Resolved at read time from the `user` table (never
 * snapshotted into the comment row), so name/avatar stay current. `email` is
 * intentionally NOT included — it never leaves the server.
 */
export interface CommentAuthor {
  name: string;
  image: string | null;
  role: Role;
}

/**
 * A single comment as shipped to the client. `isOwn` is computed server-side
 * (author id === session user id) so the client can show a delete control
 * without ever receiving the author's user id.
 */
export interface Comment {
  id: string;
  slug: string;
  body: string;
  createdAt: string;
  parentId: string | null;
  status: CommentStatus;
  author: CommentAuthor;
  isOwn: boolean;
}

/** A top-level comment with its one level of replies threaded under it. */
export interface CommentThread extends Comment {
  replies: Comment[];
}

export interface PostSummary {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  visibility: PostVisibility;
  tags: string[];
}

export interface PostDetail extends PostSummary {
  contentMdx: string;
  status: PostStatus;
  passwordEnabled: boolean;
}
