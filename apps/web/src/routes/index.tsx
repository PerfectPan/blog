import type { PostSummary } from '@blog/shared';
import { createFileRoute, Link } from '@tanstack/react-router';
import { getBlogListServerFn } from '../lib/blog-service.js';
import { PROJECTS } from '../lib/projects.js';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: "Home | PerfectPan's Blog" }],
  }),
  loader: async () => {
    // Guest-scoped first page powers the LATEST panel.
    return getBlogListServerFn({ data: { page: 1 } });
  },
  component: HomePage,
});

function HomePage() {
  const data = Route.useLoaderData();
  const latest = data.posts.slice(0, 5);

  return (
    <div className='j-sheet'>
      <div className='j-home'>
        <div>
          <h1>是个什么都不会的废物.jpg</h1>
          <p className='j-tagline'>
            算法竞赛退役选手，现在的兴趣在前端工程、类型体操和把东西跑在
            Cloudflare 免费额度上。这里收着题解、笔记和一些随想。
          </p>
          <div className='j-facts'>
            <span>{data.total} 篇文章</span>
            <span>2019 — 2023</span>
            <span>{PROJECTS.length} 个开源项目</span>
          </div>
          <div className='j-home-cta'>
            <Link to='/blog' className='j-btn j-btn-red'>
              Blog
            </Link>
            <Link to='/projects' className='j-btn'>
              Projects
            </Link>
          </div>
          <div className='j-home-seal'>
            <span className='j-seal' aria-hidden='true'>
              潘
            </span>
            <div className='sign'>
              PerfectPan
              <br />
              perfectpan.org
            </div>
          </div>
        </div>
        <div className='j-home-panel'>
          <div className='j-blockhead'>最 近 文 章</div>
          {latest.map((post: PostSummary) => (
            <div className='j-latest-item' key={post.slug}>
              <Link className='t' to='/blog/$slug' params={{ slug: post.slug }}>
                {post.title}
              </Link>
              <span className='d'>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
