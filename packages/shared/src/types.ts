export const ROLES = ['member', 'vip', 'admin'] as const;

export const POST_VISIBILITIES = [
  'public',
  'member',
  'vip',
  'admin',
  'password',
] as const;

export type Role = (typeof ROLES)[number];

export type PostVisibility = (typeof POST_VISIBILITIES)[number];

export type PostStatus = 'draft' | 'published';

export type UserStatus = 'active' | 'disabled';

export interface SessionUser {
  id: string;
  role: Role;
  email: string;
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
