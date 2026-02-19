import { createFileRoute } from '@tanstack/react-router';
import { fetchVisiblePostsFromCms } from '../lib/cms-client.js';
import { getWebEnv } from '../lib/env.js';
import { listFallbackPosts } from '../lib/local-fallback.js';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const Route = createFileRoute('/rss.xml')({
  server: {
    handlers: {
      GET: async () => {
        const env = getWebEnv();
        const cmsPosts = await fetchVisiblePostsFromCms().catch(() => []);
        const fallbackPosts = await listFallbackPosts().catch(() => []);
        const map = new Map(
          [...fallbackPosts, ...cmsPosts].map((post) => [post.slug, post]),
        );
        const posts = [...map.values()]
          .filter((post) => post.visibility === 'public')
          .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

        const items = posts
          .map((post) => {
            const link = `${env.appsWebUrl.replace(/\/$/, '')}/blog/${post.slug}`;
            return `
              <item>
                <title>${escapeXml(post.title)}</title>
                <description>${escapeXml(post.description)}</description>
                <link>${escapeXml(link)}</link>
                <guid>${escapeXml(link)}</guid>
                <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
              </item>
            `;
          })
          .join('\n');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
          <rss version="2.0">
            <channel>
              <title>PerfectPan's Blog</title>
              <link>${escapeXml(env.appsWebUrl)}</link>
              <description>Public articles only</description>
              ${items}
            </channel>
          </rss>`;

        return new Response(xml, {
          headers: {
            'content-type': 'application/rss+xml; charset=utf-8',
          },
        });
      },
    },
  },
  component: () => null,
});
