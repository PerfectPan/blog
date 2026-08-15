/** Site founding date — day offsets from this date are the stable post index. */
const EPOCH = new Date('2019-01-01T00:00:00Z').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Stable per-post index number (№): whole days since 2019-01-01. Monotonic
 * with publish date, so the blog list (desc) and the article rail agree.
 */
export function postIndex(publishedAt: string): number {
  return Math.floor((new Date(publishedAt).getTime() - EPOCH) / DAY_MS);
}

/** Deterministic rating-palette color for an arbitrary tag. */
const RATING_COLORS = [
  '#98a0a6',
  '#3f9e4c',
  '#2fa8b8',
  '#3d6be8',
  '#8f5ae8',
  '#e8973d',
  '#e5484d',
];

export function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i += 1) {
    hash = (hash * 31 + tag.charCodeAt(i)) % 997;
  }
  return RATING_COLORS[hash % RATING_COLORS.length];
}
