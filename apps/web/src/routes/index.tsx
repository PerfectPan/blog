import type { PostSummary } from '@blog/shared';
import { createFileRoute, Link } from '@tanstack/react-router';
import { getBlogListServerFn } from '../lib/blog-service.js';
import { postIndex } from '../lib/post-index.js';
import { PROJECTS } from '../lib/projects.js';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: "Home | PerfectPan's Blog" }],
  }),
  loader: async () => {
    // Guest-scoped first page powers the LATEST / DATA columns.
    return getBlogListServerFn({ data: { page: 1 } });
  },
  component: HomePage,
});

function HomePage() {
  const data = Route.useLoaderData();
  const latest = data.posts.slice(0, 4);
  const featured = PROJECTS.filter((p) => p.featured).slice(0, 3);
  const otherProjects = PROJECTS.filter((p) => !p.featured).slice(0, 2);
  const year = new Date().getFullYear();

  return (
    <div className='c-page'>
      <div className='c-hero'>
        <div className='kicker'>
          <span className='c-sec-label'>Personal Index — Since 2019</span>
          <span className='c-no'>/ perfectpan.org</span>
        </div>
        <h1>
          <span className='hollow'>PERFECT</span>PAN
          <span className='dot'>.</span>
        </h1>
        <p className='sub'>
          算法竞赛退役选手、前端工程师。写类型体操、Cloudflare 上的 $0
          工程实践，以及一些随想。是个什么都不会的废物.jpg —— 但文档还在更新。
        </p>
      </div>
      <div className='c-home-cols'>
        <div className='c-home-col'>
          <h3>LATEST / 最新</h3>
          {latest.map((post: PostSummary) => (
            <div className='c-latest' key={post.slug}>
              <span className='c-no'>
                {String(postIndex(post.publishedAt)).padStart(4, '0')}
              </span>
              <Link className='t' to='/blog/$slug' params={{ slug: post.slug }}>
                {post.title}
              </Link>
              <span className='d'>
                {new Date(post.publishedAt).toISOString().slice(0, 7)}
              </span>
            </div>
          ))}
        </div>
        <div className='c-home-col'>
          <h3>WORK / 项目</h3>
          {[...featured, ...otherProjects].map((project) => (
            <div className='c-latest' key={project.name}>
              <a
                className='t'
                href={project.repo}
                target='_blank'
                rel='noreferrer'
              >
                {project.name}
              </a>
              <span className='d'>{project.featured ? '★' : ''}</span>
            </div>
          ))}
        </div>
        <div className='c-home-col'>
          <h3>DATA / 数据</h3>
          <div className='c-stat'>
            <b className='red'>{data.total}</b>
            <span>篇文章</span>
          </div>
          <div className='c-stat'>
            <b>{PROJECTS.length}</b>
            <span>个开源项目</span>
          </div>
          <div className='c-stat'>
            <b>{year - 2019 + 1}</b>
            <span>个年份卷宗</span>
          </div>
        </div>
      </div>
    </div>
  );
}
