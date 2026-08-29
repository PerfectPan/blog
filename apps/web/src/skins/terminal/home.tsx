import type { PostSummary } from '@blog/shared';
import { Link } from '@tanstack/react-router';

const FIGLET = `                   __           _
  _ __   ___ _ __ / _| ___  ___| |_ _ __   __ _ _ __
 | '_ \\ / _ \\ '__| |_ / _ \\/ __| __| '_ \\ / _\` | '_ \\
 | |_) |  __/ |  |  _|  __/ (__| |_| |_) | (_| | | | |
 | .__/ \\___|_|  |_|  \\___|\\___|\\__| .__/ \\__,_|_| |_|
 |_|                               |_|`;

type HomeData = {
  posts: PostSummary[];
  total: number;
} | null;

export function TerminalHomePage({ data }: { data: HomeData }) {
  const latest = (data?.posts ?? []).slice(0, 5);

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
        <pre className='th-figlet' aria-hidden='true'>
          {FIGLET}
          <b>.org</b>
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
      {latest.length > 0 ? (
        <>
          <div className='th-prompt mt-8'>
            <span className='th-prompt-u'>perfectpan</span>
            <span className='th-prompt-at'>@</span>
            <span className='th-prompt-h'>blog</span>{' '}
            <span className='th-prompt-p'>~ %</span>{' '}
            <span className='th-cmd'>ls -lt ~/posts | head -5</span>
          </div>
          <div className='th-home-recent'>
            {latest.map((post) => (
              <Link
                key={post.slug}
                to='/blog/$slug'
                params={{ slug: post.slug }}
                className='th-home-recent-row'
              >
                <span className='th-ls-date'>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </span>
                <span className='th-ls-title'>{post.title}</span>
                <span className='th-ls-tags text-right'>
                  {post.tags.join(' · ')}
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
