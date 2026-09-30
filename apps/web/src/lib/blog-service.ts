import {
  canAccessVisibility,
  DEFAULT_LOCALE,
  filterByQuery,
  getUnlockCookieName,
  type PostDetail,
  type PostSummary,
  paginate,
  type Role,
  SEARCH_LIMIT,
} from '@blog/shared';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import {
  getAllPublishedPosts,
  getPostBySlug,
  verifyPostPassword,
} from './content-service.js';
import { htmlHasKatex, renderPostHtml } from './markdown-html.js';
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

/** Return the post without its body, so restricted content is never shipped to
 *  an unauthorized caller (route loaders also guard, but server fns are directly
 *  invocable over RPC, so the data layer must enforce this too). */
function withoutBody(post: PostDetail): PostDetail {
  return { ...post, contentMdx: '' };
}

export const getBlogListServerFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ page: z.number().int().min(1).optional() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const sessionUser = await getSessionUserFromRequest(request);
    const allPosts = await getAllPublishedPosts();
    const visible = sortByPublishedDateDesc(
      allPosts.filter((post) => isListedFor(post, sessionUser?.role)),
    );
    const result = paginate(visible, data?.page ?? 1);

    return {
      sessionUser,
      posts: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  });

/** Top-N visible posts matching a query — powers the global Cmd+K palette.
 *  Visibility filtering + search both happen server-side so restricted posts
 *  never reach the client, even as search suggestions. */
export const searchPostsServerFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ q: z.string() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const sessionUser = await getSessionUserFromRequest(request);
    const visible = sortByPublishedDateDesc(
      (await getAllPublishedPosts()).filter((post) =>
        isListedFor(post, sessionUser?.role),
      ),
    );
    return filterByQuery(visible, data.q).slice(0, SEARCH_LIMIT);
  });

export const getBlogPostServerFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const sessionUser = await getSessionUserFromRequest(request);
    const post = await getPostBySlug(data.slug);

    if (!post) {
      return { sessionUser, post: null, unlocked: false, contentHtml: '' };
    }

    // Enforce visibility at the data layer. The route loader also redirects/
    // 403s, but this server fn is reachable over RPC, so the body must not be
    // returned to a caller who isn't allowed to read it.
    if (post.visibility === 'password') {
      const cookies = parseCookies(request?.headers.get('cookie') ?? null);
      const unlocked =
        sessionUser?.role === 'admin' ||
        isUnlockCookieValid(data.slug, cookies[getUnlockCookieName(data.slug)]);
      if (!unlocked) {
        return {
          sessionUser,
          post: withoutBody(post),
          unlocked,
          contentHtml: '',
        };
      }
    } else if (
      !canAccessVisibility(post.visibility, sessionUser?.role ?? null)
    ) {
      return {
        sessionUser,
        post: withoutBody(post),
        unlocked: false,
        contentHtml: '',
      };
    }

    // The body ships as pre-rendered HTML, not markdown source: the client
    // hydrates it as a single node (no react-markdown in the browser). The
    // markdown source never reaches an authorized reader's payload twice.
    const locale = sessionUser?.locale ?? DEFAULT_LOCALE;
    const contentHtml = renderPostHtml(post.contentMdx, locale);
    return {
      sessionUser,
      post: withoutBody(post),
      unlocked: false,
      contentHtml,
      hasKatex: htmlHasKatex(contentHtml),
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
    return await verifyPostPassword(data.slug, data.password);
  });
