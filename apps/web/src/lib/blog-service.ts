import {
  type PostSummary,
  type Role,
  canAccessVisibility,
  getUnlockCookieName,
} from '@blog/shared';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import {
  getAllPublishedPosts,
  getPostBySlug,
  verifyPostPassword,
} from './content-service.js';
import { getSessionUserFromRequest } from './session-core.js';
import { isUnlockCookieValid, parseCookies } from './unlock-cookie.js';

function sortByPublishedDateDesc(posts: PostSummary[]): PostSummary[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** A post shows up in the list if the viewer's role can access its visibility. */
function isListedFor(post: PostSummary, role?: Role | null): boolean {
  if (post.visibility === 'password') {
    // Password posts are listed only to admins; everyone else reaches them via
    // a direct link + the unlock flow.
    return role === 'admin';
  }
  return canAccessVisibility(post.visibility, role ?? null);
}

export const getBlogListServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getRequest();
    const sessionUser = await getSessionUserFromRequest(request);
    const posts = sortByPublishedDateDesc(
      getAllPublishedPosts().filter((post) =>
        isListedFor(post, sessionUser?.role),
      ),
    );

    return {
      sessionUser,
      posts,
    };
  },
);

export const getBlogPostServerFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const sessionUser = await getSessionUserFromRequest(request);
    const post = getPostBySlug(data.slug);

    const cookies = parseCookies(request?.headers.get('cookie') ?? null);
    const unlockCookie = cookies[getUnlockCookieName(data.slug)];
    const unlocked = isUnlockCookieValid(data.slug, unlockCookie);

    return {
      sessionUser,
      post,
      unlocked,
    };
  });

export const verifyPostPasswordServerFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      slug: z.string().min(1),
      password: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    return verifyPostPassword(data.slug, data.password);
  });
