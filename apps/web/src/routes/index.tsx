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
        废墨集 · 创刊于二〇一九 · perfectpan.org
      </aside>
      <div className='j-frontispiece'>
        <div className='j-vertical' aria-hidden='true'>
          废墨集
          <small>FEI MO JI · 创刊于二〇一九</small>
        </div>
        <div>
          <p className='j-tagline'>
            是个什么都不会的废物.jpg —— 但笔没停过。算法竞赛的旧题解、TypeScript
            的类型体操、把整站跑在 Cloudflare
            免费额度上的工程笔记，以及一些不成体统的随想，都收在这本集子里。
          </p>
          <div className='j-facts'>
            <span>
              收文 <b>十六</b> 篇
            </span>
            <span>
              历时 <b>二〇一九 — 二〇二三</b>
            </span>
            <span>
              栏目 <b>算法 · 类型 · 随笔 · 工程</b>
            </span>
          </div>
          <div className='mt-9 flex flex-wrap gap-4'>
            <Link to='/blog' className='j-btn j-btn-red'>
              读 目 次
            </Link>
            <Link to='/projects' className='j-btn'>
              观 器 物 谱
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
              PerfectPan 手订
              <br />
              全刊运行于 Cloudflare · 每月费用为零
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
