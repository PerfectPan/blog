import type { PostSummary } from '@blog/shared';
import { createFileRoute, Link } from '@tanstack/react-router';
import { getBlogListServerFn } from '../lib/blog-service.js';
import { PROJECTS } from '../lib/projects.js';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: "Home | PerfectPan's Blog" }],
  }),
  loader: async () => {
    // Guest-scoped first page powers the LATEST INDEX column.
    return getBlogListServerFn({ data: { page: 1 } });
  },
  component: HomePage,
});

function Ticks() {
  return (
    <>
      <span className='e-tick tl' aria-hidden='true' />
      <span className='e-tick tr' aria-hidden='true' />
      <span className='e-tick bl' aria-hidden='true' />
      <span className='e-tick br' aria-hidden='true' />
    </>
  );
}

function HomePage() {
  const data = Route.useLoaderData();
  const latest = data.posts.slice(0, 5);

  return (
    <div className='e-board'>
      <section className='e-sheet'>
        <Ticks />
        <div className='e-sheet-head'>
          <span className='dwg'>DWG NO. PP-HOME-001</span>
          <span className='dwg'>
            REV <span className='rev'>C</span>
          </span>
        </div>

        <div className='e-cover'>
          <div>
            <div
              className='dwg'
              style={{ color: 'var(--e-faint)', letterSpacing: '0.3em' }}
            >
              GENERAL ARRANGEMENT — SINCE 2019
            </div>
            <div className='big' style={{ marginTop: 14 }}>
              PERFECTPAN<span>.</span>
            </div>
            <p className='sub'>
              个人博客施工图集：算法竞赛旧题解、TypeScript 类型体操、Cloudflare
              $0/月 工程实践，以及随想。
            </p>
            <div className='mt-6'>
              <div className='e-spec-line'>
                <span className='k'>DOCUMENTS</span>
                <span className='v'>{data.total} 篇（2019 — 2023）</span>
              </div>
              <div className='e-spec-line'>
                <span className='k'>ASSEMBLIES</span>
                <span className='v'>{PROJECTS.length} 个开源项目</span>
              </div>
              <div className='e-spec-line'>
                <span className='k'>SUBSTRATE</span>
                <span className='v'>Cloudflare Workers + D1</span>
              </div>
              <div className='e-spec-line'>
                <span className='k'>TOLERANCE</span>
                <span className='v'>$0.00 / 月</span>
              </div>
            </div>
            <div className='e-cta'>
              <Link to='/blog' className='e-btn e-btn-fill'>
                OPEN BLOG/
              </Link>
              <Link to='/projects' className='e-btn'>
                OPEN PROJECTS/
              </Link>
            </div>
          </div>
          <div className='e-cover-right'>
            <h3>LATEST INDEX</h3>
            {latest.map((post: PostSummary, index: number) => (
              <div className='e-idx-row' key={post.slug}>
                <span className='no'>
                  {String(data.total - index).padStart(3, '0')}
                </span>
                <Link
                  className='t'
                  to='/blog/$slug'
                  params={{ slug: post.slug }}
                >
                  {post.title}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className='e-titleblock'>
          <span className='cell'>
            <b>PERFECTPAN.ORG</b>
          </span>
          <span className='cell'>
            TITLE<b>总布置图</b>
          </span>
          <span className='cell opt'>
            SCALE<b>1:1</b>
          </span>
          <span className='cell opt'>
            SHEET<b>1/1</b>
          </span>
        </div>
      </section>
    </div>
  );
}
