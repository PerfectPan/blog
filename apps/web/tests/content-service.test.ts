import { readFileSync } from 'node:fs';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getAllPublishedPostDetails,
  getAllPublishedPosts,
  getPostBySlug,
  getPostVisibilityBySlug,
  verifyPostPassword,
} from '../src/lib/content-service.js';
import { getD1 } from '../src/lib/db.js';

vi.mock('../src/lib/db.js', () => ({ getD1: vi.fn() }));

let db: DatabaseSync;
let returnedRows: Record<string, unknown>[];

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  db.exec(
    readFileSync(
      new URL('../migrations/0002_create_posts.sql', import.meta.url),
      'utf8',
    ),
  );
  const insert = db.prepare(`INSERT INTO post
    (slug, title, body, visibility, password, status, tags, publishedAt, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, '2026-01-01', '2026-01-01', '2026-01-01')`);
  for (const [slug, visibility, status, tags] of [
    ['public-post', 'public', 'published', '["code",123]'],
    ['private-post', 'password', 'published', '[]'],
    ['draft-post', 'password', 'draft', '[]'],
    ['bad-tags', 'member', 'published', 'invalid-json'],
  ]) {
    insert.run(
      slug,
      slug,
      `${slug} body`,
      visibility,
      'test-only-password',
      status,
      tags,
    );
  }
  returnedRows = [];
  // Execute the actual production SQL against SQLite. The adapter records
  // rows crossing the D1 boundary, including fields later dropped by mapping.
  vi.mocked(getD1).mockReturnValue({
    prepare(sql: string) {
      let params: SQLInputValue[] = [];
      const statement = {
        bind(...values: SQLInputValue[]) {
          params = values;
          return statement;
        },
        async all() {
          const results = db.prepare(sql).all(...params);
          returnedRows.push(...results);
          return { results };
        },
        async first() {
          const row = db.prepare(sql).get(...params) ?? null;
          if (row) returnedRows.push(row);
          return row;
        },
      };
      return statement;
    },
  } as unknown as D1Database);
});

afterEach(() => {
  db.close();
  vi.restoreAllMocks();
});

describe('published content queries', () => {
  it('lists metadata without transferring bodies, passwords, or drafts from D1', async () => {
    const posts = await getAllPublishedPosts();
    expect(posts.map((p) => p.slug).sort()).toEqual([
      'bad-tags',
      'private-post',
      'public-post',
    ]);
    expect(posts.find((p) => p.slug === 'public-post')?.tags).toEqual([
      'code',
      '123',
    ]);
    expect(posts.find((p) => p.slug === 'bad-tags')?.tags).toEqual([]);
    for (const row of returnedRows) {
      expect(row).not.toHaveProperty('body');
      expect(row).not.toHaveProperty('password');
    }
  });

  it('loads only the requested published article and keeps passwords server-side', async () => {
    expect(await getPostBySlug('private-post')).toMatchObject({
      slug: 'private-post',
      contentMdx: 'private-post body',
      passwordEnabled: true,
      status: 'published',
    });
    expect(returnedRows).toHaveLength(1);
    expect(returnedRows[0]).not.toHaveProperty('password');
  });

  it('does not resolve missing, draft, or SQL-shaped slugs', async () => {
    for (const slug of ['missing', 'draft-post', "public-post' OR 1=1 --"]) {
      expect(await getPostBySlug(slug)).toBeNull();
      expect(await getPostVisibilityBySlug(slug)).toBeNull();
    }
  });

  it('retains full published content for RSS without selecting passwords', async () => {
    const posts = await getAllPublishedPostDetails();
    expect(posts).toHaveLength(3);
    expect(posts.every((p) => p.contentMdx === `${p.slug} body`)).toBe(true);
    expect(returnedRows.every((row) => !('password' in row))).toBe(true);
  });

  it('checks only published password posts without fetching any body', async () => {
    expect(await verifyPostPassword('private-post', 'test-only-password')).toBe(
      true,
    );
    expect(await verifyPostPassword('private-post', 'wrong')).toBe(false);
    for (const slug of ['draft-post', 'public-post', 'missing']) {
      expect(await verifyPostPassword(slug, 'test-only-password')).toBe(false);
    }
    expect(
      returnedRows.every((row) => Object.keys(row).join() === 'password'),
    ).toBe(true);
  });

  it('fails closed when D1 is unavailable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getD1).mockImplementation(() => {
      throw new Error('D1 unavailable');
    });
    expect(await getAllPublishedPosts()).toEqual([]);
    expect(await getAllPublishedPostDetails()).toEqual([]);
    expect(await getPostBySlug('public-post')).toBeNull();
    expect(await verifyPostPassword('private-post', 'test-only-password')).toBe(
      false,
    );
  });
});
