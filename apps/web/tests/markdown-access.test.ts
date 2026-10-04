import type { PostDetail, SessionUser } from '@blog/shared';
import { beforeEach, expect, it, vi } from 'vitest';
import { getBlogPostServerFn } from '../src/lib/blog-service.js';
import { getPostBySlug } from '../src/lib/content-service.js';
import { renderCommentHtml, renderPostHtml } from '../src/lib/markdown-html.js';
import {
  previewCommentServerFn,
  previewPostServerFn,
} from '../src/lib/markdown-preview.js';
import { getSessionUserFromRequest } from '../src/lib/session-core.js';
import { isUnlockCookieValid } from '../src/lib/unlock-cookie.js';

// Exercise handlers independently of the RPC transport so direct invocation
// has the same access boundary as route loaders.
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({
    inputValidator() {
      return this;
    },
    handler(fn: unknown) {
      return fn;
    },
  }),
}));
vi.mock('@tanstack/react-start/server', () => ({
  getRequest: () => new Request('https://blog.test/'),
}));
vi.mock('../src/lib/content-service.js', () => ({
  getPostBySlug: vi.fn(),
  getAllPublishedPosts: vi.fn(),
  verifyPostPassword: vi.fn(),
}));
vi.mock('../src/lib/session-core.js', () => ({
  getSessionUserFromRequest: vi.fn(),
}));
vi.mock('../src/lib/unlock-cookie.js', () => ({
  isUnlockCookieValid: vi.fn(),
  parseCookies: () => ({}),
}));
vi.mock('../src/lib/markdown-html.js', () => ({
  renderPostHtml: vi.fn(() => '<p>protected body</p>'),
  renderCommentHtml: vi.fn(() => '<p>comment</p>'),
  htmlHasKatex: () => false,
}));

const post: PostDetail = {
  slug: 'protected',
  title: 'Protected',
  description: '',
  tags: [],
  publishedAt: '2026-01-01',
  status: 'published',
  visibility: 'password',
  passwordEnabled: true,
  contentMdx: 'protected body',
};
const admin: SessionUser = {
  id: 'admin',
  email: 'admin@example.test',
  role: 'admin',
  locale: 'en',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSessionUserFromRequest).mockResolvedValue(null);
  vi.mocked(getPostBySlug).mockResolvedValue(post);
  vi.mocked(isUnlockCookieValid).mockReturnValue(false);
});

it('preserves password unlock and admin exemption in the response', async () => {
  vi.mocked(isUnlockCookieValid).mockReturnValue(true);
  expect(
    await getBlogPostServerFn({ data: { slug: post.slug } }),
  ).toMatchObject({
    unlocked: true,
    contentHtml: '<p>protected body</p>',
    post: { contentMdx: '' },
  });
  vi.mocked(isUnlockCookieValid).mockReturnValue(false);
  vi.mocked(getSessionUserFromRequest).mockResolvedValue(admin);
  expect(
    await getBlogPostServerFn({ data: { slug: post.slug } }),
  ).toMatchObject({ unlocked: true });
  expect(renderPostHtml).toHaveBeenLastCalledWith('protected body', 'en');
});

it('never renders or returns protected content to an unauthorized caller', async () => {
  for (const visibility of ['password', 'member', 'vip', 'admin'] as const) {
    vi.mocked(getPostBySlug).mockResolvedValue({ ...post, visibility });
    expect(
      await getBlogPostServerFn({ data: { slug: post.slug } }),
    ).toMatchObject({
      unlocked: false,
      contentHtml: '',
      post: { contentMdx: '' },
    });
  }
  expect(renderPostHtml).not.toHaveBeenCalled();
});

it('rejects anonymous previews and non-admin post previews before rendering', async () => {
  await expect(
    previewPostServerFn({ data: { body: 'body' } }),
  ).rejects.toMatchObject({ options: { to: '/login' } });
  await expect(
    previewCommentServerFn({ data: { body: 'body' } }),
  ).rejects.toMatchObject({ options: { to: '/login' } });
  vi.mocked(getSessionUserFromRequest).mockResolvedValue({
    ...admin,
    role: 'member',
  });
  await expect(
    previewPostServerFn({ data: { body: 'body' } }),
  ).rejects.toMatchObject({ options: { to: '/' } });
  expect(renderPostHtml).not.toHaveBeenCalled();
  expect(renderCommentHtml).not.toHaveBeenCalled();
});

it('uses the authorized session locale without resolving the session twice', async () => {
  vi.mocked(getSessionUserFromRequest).mockResolvedValue(admin);
  await previewPostServerFn({ data: { body: 'body' } });
  expect(renderPostHtml).toHaveBeenCalledWith('body', 'en');
  expect(getSessionUserFromRequest).toHaveBeenCalledOnce();
});
