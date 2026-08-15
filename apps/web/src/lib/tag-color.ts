/** Deterministic neon chip color for an arbitrary tag (synthwave palette). */
const NEON_COLORS = ['#ff4fd8', '#8b6cff', '#3ee6d2', '#ffd24f'];

export function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i += 1) {
    hash = (hash * 31 + tag.charCodeAt(i)) % 997;
  }
  return NEON_COLORS[hash % NEON_COLORS.length];
}
