import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: "Home | PerfectPan's Blog" }],
  }),
  component: HomePage,
});

const FIGLET = `  ____              _   _        _   ____  __  __ ____
 |  _ \\ _   _  __ _| |_| |__    / \\ |  _ \\|  \\/  |  _ \\
 | |_) | | | |/ _\` | __| '_ \\  / _ \\| |_) | |\\/| | |_) |
 |  __/| |_| | (_| | |_| | | |/ ___ \\  __/| |  | |  __/
 |_|    \\__,_|\\__,_|\\__|_| |_/_/   \\_\\_|  |_|  |_|_|   `;

function HomePage() {
  return (
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>whoami --verbose</span>
      </div>
      <div className='th-out'>
        <div className='th-hero-name'>PerfectPan</div>
        <p className='th-hero-desc'>
          写代码的人。算法竞赛退役选手，现在的兴趣在前端工程、类型体操和把东西跑在
          Cloudflare 免费额度上。
        </p>
        <pre className='th-figlet' aria-hidden='true'>
          {FIGLET}
          <b>.dev</b>
        </pre>
      </div>
      <div className='th-prompt mt-6'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>cat motd.txt</span>
      </div>
      <p className='th-out th-comment'>
        # 是个什么都不会的废物.jpg —— 但还在写。
      </p>
      <div className='th-home-links'>
        <Link to='/blog'>
          <span className='k'>open blog/</span>
          <small>算法 / TypeScript / 随笔</small>
        </Link>
        <Link to='/projects'>
          <span className='k'>open projects/</span>
          <small>Rust / TS / Moonbit 开源项目</small>
        </Link>
      </div>
    </div>
  );
}
