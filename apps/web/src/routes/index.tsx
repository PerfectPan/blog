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
  const latest = data.posts.slice(0, 4);

  return (
    <div className='f-page'>
      <div className='f-hero'>
        <span className='f-sticker float'>EST. 2019 ★</span>
        <h1>
          <span className='stroke'>PERFECT</span>PAN
          <span className='dot'>!</span>
        </h1>
        <p>
          是个什么都不会的废物.jpg —— 但博客还在更新。算法题解、TypeScript
          类型体操、Cloudflare $0/月 工程实践，全在这。
        </p>
        <div className='cta'>
          <Link to='/blog' className='f-btn f-btn-fill'>
            读博客 →
          </Link>
          <Link to='/projects' className='f-btn'>
            看项目 →
          </Link>
        </div>
      </div>
      <div className='f-home-grid'>
        <div className='f-card f-lift f-panel'>
          <h3>LATEST 最新</h3>
          {latest.map((post: PostSummary, index: number) => (
            <div className='f-row' key={post.slug}>
              <span className='no'>
                {String(data.total - index).padStart(3, '0')}
              </span>
              <Link className='t' to='/blog/$slug' params={{ slug: post.slug }}>
                {post.title}
              </Link>
            </div>
          ))}
        </div>
        <div className='f-card f-lift f-panel'>
          <h3 className='o'>DATA 数据</h3>
          <div className='f-stat'>
            <b className='vio'>{data.total}</b>
            <span>篇文章</span>
          </div>
          <div className='f-stat'>
            <b className='org'>{PROJECTS.length}</b>
            <span>个开源项目</span>
          </div>
          <div className='f-stat'>
            <b>$0</b>
            <span>每月托管费</span>
          </div>
        </div>
      </div>
    </div>
  );
}
