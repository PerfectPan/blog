/**
 * Pure helpers for image upload validation + object-key generation. No D1/R2/
 * session deps, so they live in the shared package and are unit-tested there.
 * Apps consume them via `@blog/shared`.
 */

/** 5 MB cap. Large enough for screenshots/figures, small enough to stay cheap. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export function isAllowedImageType(contentType: string): boolean {
  return contentType in EXT_BY_TYPE;
}

export function extensionFor(contentType: string): string | undefined {
  return EXT_BY_TYPE[contentType];
}

/**
 * `images/<YYYY>/<MM>/<uuid>.<ext>` — date-partitioned for browsability and
 * collision-free via crypto.randomUUID(), with no slug dependency (slugs can be
 * renamed). `now` is injectable for deterministic tests.
 */
export function buildObjectKey(ext: string, now: Date = new Date()): string {
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `images/${yyyy}/${mm}/${crypto.randomUUID()}.${ext}`;
}
