import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { getPayload } from 'payload';
import config from '../src/payload.config.js';

type Frontmatter = {
  title?: string;
  description?: string;
  date?: string;
  tag?: string[] | string;
};

function toTagItems(rawTag: Frontmatter['tag']) {
  if (!rawTag) {
    return [];
  }

  const values = Array.isArray(rawTag) ? rawTag : [rawTag];
  return values
    .map((value) => String(value).trim())
    .filter(Boolean)
    .map((value) => ({ value }));
}

async function run() {
  const payload = await getPayload({ config });
  const contentDir = path.resolve(process.cwd(), '../../content/blog');
  const files = await fs.readdir(contentDir);
  const markdownFiles = files.filter((name) => name.endsWith('.md'));

  let created = 0;
  let updated = 0;

  for (const fileName of markdownFiles) {
    const slug = path.basename(fileName, '.md');
    const fullPath = path.join(contentDir, fileName);
    const raw = await fs.readFile(fullPath, 'utf8');
    const parsed = matter(raw);
    const data = parsed.data as Frontmatter;

    const docData = {
      slug,
      title: data.title ?? slug,
      description: data.description ?? '',
      contentMdx: parsed.content.trim(),
      visibility: 'public' as const,
      tags: toTagItems(data.tag),
      publishedAt: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      _status: 'published' as const,
    };

    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug } },
      depth: 0,
      limit: 1,
    });

    if (existing.totalDocs > 0) {
      await payload.update({
        collection: 'posts',
        id: existing.docs[0].id,
        data: docData,
      });
      updated += 1;
      continue;
    }

    await payload.create({
      collection: 'posts',
      data: docData,
    });
    created += 1;
  }

  console.log(
    `[migrate-content] total=${markdownFiles.length} created=${created} updated=${updated}`,
  );
}

run().catch((error) => {
  console.error('[migrate-content] failed', error);
  process.exit(1);
});
