import { describe, expect, it } from 'vitest';
import { filterByQuery, PAGE_SIZE, paginate } from './list-query.js';
import type { PostSummary } from './types.js';

function post(partial: Partial<PostSummary>): PostSummary {
  return {
    slug: partial.slug ?? 's',
    title: partial.title ?? '',
    description: partial.description ?? '',
    publishedAt: partial.publishedAt ?? '2026-01-01',
    visibility: partial.visibility ?? 'public',
    tags: partial.tags ?? [],
  };
}

const POSTS: PostSummary[] = [
  post({
    slug: 'a',
    title: 'React Hooks',
    description: 'Deep dive',
    tags: ['react'],
  }),
  post({
    slug: 'b',
    title: 'CSS Tricks',
    description: 'Layouts',
    tags: ['css'],
  }),
  post({ slug: 'c', title: '理解 React', description: '入门', tags: ['前端'] }),
];

describe('filterByQuery', () => {
  it('returns all posts when q is empty or whitespace', () => {
    expect(filterByQuery(POSTS, '').length).toBe(3);
    expect(filterByQuery(POSTS, '   ').length).toBe(3);
  });

  it('matches titles case-insensitively', () => {
    expect(filterByQuery(POSTS, 'react').map((p) => p.slug)).toEqual([
      'a',
      'c',
    ]);
  });

  it('matches descriptions', () => {
    expect(filterByQuery(POSTS, 'layouts').map((p) => p.slug)).toEqual(['b']);
  });

  it('matches tags', () => {
    expect(filterByQuery(POSTS, 'css').map((p) => p.slug)).toEqual(['b']);
  });

  it('matches CJK substrings', () => {
    expect(filterByQuery(POSTS, '理解').map((p) => p.slug)).toEqual(['c']);
  });

  it('returns nothing when no match', () => {
    expect(filterByQuery(POSTS, 'nomatch')).toEqual([]);
  });
});

describe('paginate', () => {
  const many = Array.from({ length: 45 }, (_, i) =>
    post({
      slug: `p${i}`,
      publishedAt: `2026-01-${String(i + 1).padStart(2, '0')}`,
    }),
  );

  it('slices the requested page', () => {
    expect(paginate(many, 1).items.length).toBe(PAGE_SIZE);
    expect(paginate(many, 2).items[0].slug).toBe('p20');
  });

  it('reports total + totalPages', () => {
    const r = paginate(many, 1);
    expect(r.total).toBe(45);
    expect(r.totalPages).toBe(3);
    expect(r.pageSize).toBe(PAGE_SIZE);
  });

  it('clamps out-of-range pages to the last page', () => {
    expect(paginate(many, 99).page).toBe(3);
    expect(paginate(many, 0).page).toBe(1);
  });

  it('handles an empty list', () => {
    const r = paginate([], 1);
    expect(r.items).toEqual([]);
    expect(r.totalPages).toBe(1);
    expect(r.page).toBe(1);
  });

  it('respects a custom page size', () => {
    expect(paginate(many, 1, 10).items.length).toBe(10);
    expect(paginate(many, 1, 10).totalPages).toBe(5);
  });
});
