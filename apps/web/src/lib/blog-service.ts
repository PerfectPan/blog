import { type PostSummary, getUnlockCookieName } from '@blog/shared';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import {
  fetchPostBySlugFromCms,
  fetchVisiblePostsFromCms,
  verifyPostPasswordWithCms,
} from './cms-client.js';
import { getSessionUserFromRequest } from './session.js';
import { isUnlockCookieValid, parseCookies } from './unlock-cookie.js';

function sortByPublishedDateDesc(posts: PostSummary[]): PostSummary[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

function toUniquePosts(posts: PostSummary[]): PostSummary[] {
  const map = new Map<string, PostSummary>();
  for (const post of posts) {
    map.set(post.slug, post);
  }
  return [...map.values()];
}

export const getBlogListServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getRequest();
    const sessionUser = await getSessionUserFromRequest(request);
    const posts = sortByPublishedDateDesc(
      toUniquePosts(await fetchVisiblePostsFromCms(sessionUser?.role)),
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
    const post = await fetchPostBySlugFromCms(data.slug);

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
    return verifyPostPasswordWithCms(data.slug, data.password);
  });
