import { env } from 'cloudflare:workers';
import { getWebEnv } from './env.js';

/**
 * Media storage lives in R2 (`MEDIA_BUCKET` binding, declared in wrangler.jsonc).
 * Mirrors the D1 binding access pattern in db.ts.
 */
export function getMediaBucket(): R2Bucket {
  const bucket = (env as { MEDIA_BUCKET?: R2Bucket }).MEDIA_BUCKET;
  if (!bucket) {
    throw new Error(
      '[web] R2 binding "MEDIA_BUCKET" is not configured. Check wrangler.jsonc r2_buckets.',
    );
  }
  return bucket;
}

/**
 * Public URL for a stored media object. Prefers the R2 custom domain
 * (`ASSETS_BASE_URL`) when configured; otherwise falls back to the
 * Worker-proxied `/api/asset/<key>` route, which works in dev/preview without a
 * custom domain. Either way the same R2 object is served.
 */
export function mediaUrl(key: string): string {
  const { assetsBaseUrl } = getWebEnv();
  return assetsBaseUrl ? `${assetsBaseUrl}/${key}` : `/api/asset/${key}`;
}
