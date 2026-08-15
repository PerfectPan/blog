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
    <div className='g-page'>
      <div className='g-hero'>
        <div className='g-sun' aria-hidden='true' />
        <div className='g-kicker'>NIGHT DRIVE · SINCE 2019</div>
        <h1>PERFECTPAN</h1>
        <p>
          是个什么都不会的废物.jpg ——
          但夜里还在写代码。算法竞赛旧题解、TypeScript 类型体操、Cloudflare
          $0/月 工程实践，一路霓虹。
        </p>
        <div className='cta'>
          <Link to='/blog' className='g-btn g-btn-grad'>
            进入博客 →
          </Link>
          <Link to='/projects' className='g-btn'>
            看看项目
          </Link>
        </div>
      </div>
      <div className='g-home-grid'>
        <div className='g-panel g-hpanel'>
          <h3>LATEST / 最新</h3>
          {latest.map((post: PostSummary, index: number) => (
            <div className='g-hitem' key={post.slug}>
              <span className='no'>
                {String(data.total - index).padStart(3, '0')}
              </span>
              <Link className='t' to='/blog/$slug' params={{ slug: post.slug }}>
                {post.title}
              </Link>
            </div>
          ))}
        </div>
        <div className='g-panel g-hpanel'>
          <h3 className='c'>DATA / 数据</h3>
          <div className='g-hstat'>
            <b>{data.total}</b>
            <span>篇文章</span>
          </div>
          <div className='g-hstat'>
            <b>{PROJECTS.length}</b>
            <span>个开源项目</span>
          </div>
          <div className='g-hstat'>
            <b>$0</b>
            <span>每月托管费</span>
          </div>
        </div>
      </div>
    </div>
  );
}
