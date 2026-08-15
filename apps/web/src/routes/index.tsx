import type { PostSummary } from '@blog/shared';
import { createFileRoute, Link } from '@tanstack/react-router';
import { getBlogListServerFn } from '../lib/blog-service.js';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: "Home | PerfectPan's Blog" }],
  }),
  loader: async () => {
    // Guest-scoped first page powers the 近稿 list.
    return getBlogListServerFn({ data: { page: 1 } });
  },
  component: HomePage,
});

function HomePage() {
  const data = Route.useLoaderData();
  const latest = data.posts.slice(0, 3);

  return (
    <div className='z-page'>
      <div className='z-hero'>
        <div className='since'>二〇一九年以来</div>
        <h1>
          是个什么都不会的
          <br />
          废物.jpg
        </h1>
        <p>
          算法竞赛退役，如今写 TypeScript 与类型体操，把整站跑在 Cloudflare
          的免费额度上。这里收着题解、笔记和一些不成体统的随想。
        </p>
      </div>
      <div className='z-ma' aria-hidden='true'>
        <span>間</span>
      </div>
      <div className='z-links'>
        <Link to='/blog'>读文章</Link>
        <Link to='/projects'>看器物</Link>
      </div>
      <div className='z-ma' aria-hidden='true'>
        <span>間</span>
      </div>
      <div>
        <div className='z-label'>近 稿 三 篇</div>
        {latest.map((post: PostSummary) => (
          <Link
            key={post.slug}
            to='/blog/$slug'
            params={{ slug: post.slug }}
            className='z-item flex'
          >
            <span className='t'>{post.title}</span>
            <span className='d'>
              {new Date(post.publishedAt).toISOString().slice(0, 7)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
