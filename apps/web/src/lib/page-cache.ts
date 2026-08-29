import { parseCookies } from './unlock-cookie.js';

/**
 * Edge cache for article pages. SSR of a long post (shiki aside, just the
 * react-markdown render) is expensive enough on the free plan to blow the
 * per-request CPU limit intermittently — a cached HTML response turns every
 * repeat view into a zero-compute hit. Admin writes purge precisely.
 */
// Cookies that don't change the server-rendered HTML (both are applied
// client-side: skin + dark mode). ANY other cookie — session, per-post
// unlock — means the response could be personalized, so bypass the cache.
const BENIGN_COOKIES = new Set(['blog-dark', 'blog-skin']);

const cachePromise: Promise<Cache> | null =
  'caches' in globalThis ? caches.open('article-page-v1') : null;

async function getCache(): Promise<Cache | undefined> {
  return (await cachePromise) ?? undefined;
}

export function isArticlePath(url: URL): boolean {
  // /blog/<slug> only — never the list, feeds, APIs or admin.
  return /^\/blog\/[^/]+$/.test(url.pathname);
}

/** Returns the cache key request, or null when this request must bypass. */
export async function articleCacheKey(
  request: Request,
): Promise<Request | null> {
  if (request.method !== 'GET') return null;
  const url = new URL(request.url);
  if (!isArticlePath(url)) return null;
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    for (const [name] of Object.entries(parseCookies(cookieHeader))) {
      if (!BENIGN_COOKIES.has(name)) return null;
    }
  }
  const cache = await getCache();
  if (!cache) return null;
  return new Request(url.toString());
}

/**
 * Buffers a 200 HTML response so it can be stored (Cache API needs a
 * complete body) and returns both the copy to serve and the copy to cache.
 */
export async function toCacheablePair(res: Response): Promise<{
  serve: Response;
  store: Response;
} | null> {
  const contentType = res.headers.get('content-type') ?? '';
  if (res.status !== 200 || !contentType.includes('text/html')) return null;
  const body = await res.arrayBuffer();
  const headers = new Headers(res.headers);
  headers.set('cache-control', 'public, max-age=604800');
  return {
    serve: new Response(body, { status: res.status, headers: res.headers }),
    store: new Response(body, { status: res.status, headers }),
  };
}

export async function putArticleCache(
  key: Request,
  store: Response,
): Promise<void> {
  const cache = await getCache();
  await cache?.put(key, store);
}

export async function matchArticleCache(
  key: Request,
): Promise<Response | undefined> {
  const cache = await getCache();
  return cache?.match(key);
}

/** Purge after an admin write so readers never see stale content. */
export async function purgeArticleCache(slug: string): Promise<void> {
  const cache = await getCache();
  if (!cache) return;
  const base = process.env.APPS_WEB_URL;
  if (!base) return;
  const baseNorm = /^https?:\/\//i.test(base) ? base : `https://${base}`;
  const target = `${baseNorm.replace(/\/$/, '')}/blog/${slug}`;
  await cache.delete(new Request(target));
}
