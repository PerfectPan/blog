import fs from 'node:fs/promises';
import path from 'node:path';
import type { PostDetail, PostSummary } from '@blog/shared';
import matter from 'gray-matter';
import { getWebEnv } from './env.js';

type Frontmatter = {
  title?: string;
  description?: string;
  date?: string;
  tag?: string[] | string;
};

const env = getWebEnv();
const contentDir = path.resolve(process.cwd(), '../../content/blog');

function toTags(tag: Frontmatter['tag']): string[] {
  if (!tag) {
    return [];
  }

  return (Array.isArray(tag) ? tag : [tag])
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function toDateString(value?: string): string {
  if (!value) {
    return new Date(0).toISOString();
  }

  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return new Date(0).toISOString();
  }

  return date.toISOString();
}

async function readMarkdownFile(slug: string) {
  const fullPath = path.join(contentDir, `${slug}.md`);
  const raw = await fs.readFile(fullPath, 'utf8');
  const parsed = matter(raw);
  const data = parsed.data as Frontmatter;

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? '',
    publishedAt: toDateString(data.date),
    tags: toTags(data.tag),
    contentMdx: parsed.content.trim(),
  };
}

export async function listFallbackPosts(): Promise<PostSummary[]> {
  if (!env.enableMarkdownFallback) {
    return [];
  }

  const entries = await fs.readdir(contentDir);
  const markdownFiles = entries.filter((name) => name.endsWith('.md'));
  const summaries = await Promise.all(
    markdownFiles.map(async (name) => {
      const slug = path.basename(name, '.md');
      const post = await readMarkdownFile(slug);
      return {
        slug: post.slug,
        title: post.title,
        description: post.description,
        publishedAt: post.publishedAt,
        visibility: 'public',
        tags: post.tags,
      } satisfies PostSummary;
    }),
  );

  return summaries.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getFallbackPostBySlug(
  slug: string,
): Promise<PostDetail | null> {
  if (!env.enableMarkdownFallback) {
    return null;
  }

  try {
    const post = await readMarkdownFile(slug);
    return {
      ...post,
      visibility: 'public',
      status: 'published',
      passwordEnabled: false,
    } satisfies PostDetail;
  } catch {
    return null;
  }
}
