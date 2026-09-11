import type { PostSummary } from '@blog/shared';

export type BlogListData = {
  posts: PostSummary[];
  total: number;
  page: number;
  totalPages: number;
};

/** Group posts by year, newest year first, newest post first within a year. */
export function groupByYear(
  posts: PostSummary[],
): { year: string; blogs: PostSummary[] }[] {
  const groups = new Map<string, PostSummary[]>();
  for (const post of posts) {
    const year = new Date(post.publishedAt).getFullYear().toString();
    const existing = groups.get(year);
    if (existing) {
      existing.push(post);
    } else {
      groups.set(year, [post]);
    }
  }
  return [...groups.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, blogs]) => ({
      year,
      blogs: [...blogs].sort((a, b) =>
        b.publishedAt.localeCompare(a.publishedAt),
      ),
    }));
}
