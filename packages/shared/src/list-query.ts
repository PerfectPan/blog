import type { PostSummary } from './types.js';

export const PAGE_SIZE = 20;
export const SEARCH_LIMIT = 8;

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * Case-insensitive substring match on title + description + tags. An empty `q`
 * returns everything. Plain toLowerCase().includes() — CJK-safe (non-ASCII has
 * no case to fold) and sidesteps SQL-LIKE injection concerns. Applied AFTER the
 * visibility ladder, so restricted posts can never leak into search results.
 */
export function filterByQuery(posts: PostSummary[], q: string): PostSummary[] {
  const needle = q.trim().toLowerCase();
  if (!needle) {
    return posts;
  }
  return posts.filter((post) =>
    [post.title, post.description, post.tags.join(' ')]
      .join(' ')
      .toLowerCase()
      .includes(needle),
  );
}

/**
 * Offset-paginate an already-sorted list, clamping `page` into [1, totalPages].
 * Returns counts so the UI can render "page X / Y" and disable prev/next.
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number = PAGE_SIZE,
): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clamped = Math.min(Math.max(1, page), totalPages);
  const start = (clamped - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page: clamped,
    pageSize,
    totalPages,
  };
}
