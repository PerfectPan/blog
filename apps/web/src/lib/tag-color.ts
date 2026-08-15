/** Deterministic sticker color for an arbitrary tag (neo-pop palette). */
const STICKER_COLORS = [
  '#FFDE59',
  '#FF6B35',
  '#7C5CFF',
  '#FF90C2',
  '#21CBA8',
  '#57B8FF',
];

export function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i += 1) {
    hash = (hash * 31 + tag.charCodeAt(i)) % 997;
  }
  return STICKER_COLORS[hash % STICKER_COLORS.length];
}
