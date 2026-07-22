import { createFileRoute } from '@tanstack/react-router';
import { getMediaBucket } from '../../../lib/storage.js';

/**
 * Worker-proxied media fallback. Streams an object from the MEDIA_BUCKET R2
 * binding. Used when `ASSETS_BASE_URL` (the R2 public custom domain) isn't
 * configured — i.e. dev and preview. Post images are public (embedded in post
 * bodies), so this route is intentionally unauthenticated; keys are
 * unguessable UUIDs under images/<YYYY>/<MM>/.
 */
async function handleAsset({
  request,
}: {
  request: Request;
}): Promise<Response> {
  const { pathname } = new URL(request.url);
  const key = decodeURIComponent(pathname.replace(/^\/api\/asset\//, ''));
  // Guard against path traversal — keys are flat under images/ (an empty key
  // fails the startsWith check, so no separate emptiness guard needed).
  if (!key.startsWith('images/') || key.includes('..')) {
    return new Response('Not found', { status: 404 });
  }

  const object = await getMediaBucket().get(key);
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  // Media keys are content-addressed by UUID and never overwritten — safe to
  // cache aggressively.
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}

export const Route = createFileRoute('/api/asset/$')({
  server: { handlers: { GET: handleAsset } },
  component: () => null,
});
