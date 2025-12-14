import fs from 'node:fs/promises';
import path from 'node:path';
import { groupedByDate } from './_.js';
import { getMetaData } from './markdown.server.js';
import type { BlogMetaData } from './markdown.server.js';

const BLOG_DIRECTORY = path.join(process.cwd(), 'content', 'blog');

export const getBlogList = async () => {
  const entries = await fs.readdir(BLOG_DIRECTORY, { encoding: 'utf-8' });
  const blogMetaData = await Promise.all(entries.map(getMetaData));

  return groupedByDate(
    blogMetaData.map((metaData) => ({
      ...metaData,
      name: path.basename(metaData.name, '.md'),
    })),
  );
};

export const findBlogFileName = async (slug: string) => {
  const entries = await fs.readdir(BLOG_DIRECTORY, { encoding: 'utf-8' });
  for (const fileName of entries) {
    if (path.basename(fileName, path.extname(fileName)) === slug) {
      return fileName;
    }
  }

  return '';
};

export const readBlog = async (fileName: string) => {
  const absolutePath = path.join(BLOG_DIRECTORY, fileName);
  const source = await fs.readFile(absolutePath, 'utf8');
  const metadata = await getMetaData(fileName);

  return { source, metadata } satisfies {
    source: string;
    metadata: BlogMetaData;
  };
};
