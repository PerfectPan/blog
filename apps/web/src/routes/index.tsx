import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: "Home | PerfectPan's Blog" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className='j-sheet'>
      <aside className='j-spine' aria-hidden='true'>
        PerfectPan's Blog · perfectpan.org
      </aside>
      <div className='j-frontispiece'>
        <div className='j-vertical' aria-hidden='true'>
          PerfectPan
          <small>BLOG · SINCE 2019</small>
        </div>
        <div>
          <h1 className='j-entry-title'>是个什么都不会的废物.jpg</h1>
          <p className='j-tagline'>
            算法竞赛退役选手，现在的兴趣在前端工程、类型体操和把东西跑在
            Cloudflare 免费额度上。这里收着题解、笔记和一些随想。
          </p>
          <div className='j-facts'>
            <span>16 篇文章</span>
            <span>2019 — 2023</span>
            <span>Cloudflare · $0/月</span>
          </div>
          <div className='mt-9 flex flex-wrap gap-4'>
            <Link to='/blog' className='j-btn j-btn-red'>
              Blog
            </Link>
            <Link to='/projects' className='j-btn'>
              Projects
            </Link>
          </div>
          <div className='mt-11 flex items-center gap-4'>
            <span className='j-seal' aria-hidden='true'>
              潘
            </span>
            <div
              className='text-xs'
              style={{
                fontFamily: 'var(--j-sans)',
                color: 'var(--j-faint)',
                letterSpacing: '0.2em',
                lineHeight: 1.9,
              }}
            >
              PerfectPan
              <br />
              perfectpan.org
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
