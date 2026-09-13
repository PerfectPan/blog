import type { PostSummary } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { Page } from './page.js';

const FIGLET = `                  __           _                     
 _ __   ___ _ __ / _| ___  ___| |_ _ __   __ _ _ __  
| '_ \\ / _ \\ '__| |_ / _ \\/ __| __| '_ \\ / _\` | '_ \\ 
| |_) |  __/ |  |  _|  __/ (__| |_| |_) | (_| | | | |
| .__/ \\___|_|  |_|  \\___|\\___|\\__| .__/ \\__,_|_| |_|
|_|                               |_|                `;

export function HomePage({
  posts,
  total,
}: {
  posts: PostSummary[];
  total: number;
}) {
  const latest = posts.slice(0, 5);

  return (
    <Page>
      <div className='th-prompt th-home-prompt'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>whoami --verbose</span>
      </div>
      <div className='th-out mt-3'>
        <pre className='th-figlet' aria-hidden='true'>
          {FIGLET}
          <b>.org</b>
        </pre>
      </div>
      <div className='th-home-links'>
        <Link to='/blog'>
          <span className='k'>open blog/</span>
        </Link>
        <Link to='/projects'>
          <span className='k'>open projects/</span>
        </Link>
        <Link to='/about'>
          <span className='k'>open about/</span>
        </Link>
      </div>

      <div className='th-home-panel'>
        <div className='th-home-panel-head'>
          <span className='th-home-panel-cmd'>ls -t ~/posts | head -5</span>
          <span>{total} 篇文章</span>
        </div>
        {latest.length === 0 ? (
          <div className='th-home-row'>
            <span className='th-home-date'>--</span>
            <span className='th-home-title'>暂无文章</span>
          </div>
        ) : (
          latest.map((post: PostSummary) => (
            <Link
              key={post.slug}
              to='/blog/$slug'
              params={{ slug: post.slug }}
              className='th-home-row'
            >
              <span className='th-home-date'>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                })}
              </span>
              <span className='th-home-title'>{post.title}</span>
            </Link>
          ))
        )}
        <div className='th-home-panel-foot'>
          <Link to='/blog'>cd ~/posts</Link>
          <span>
            <Link to='/projects'>~/projects</Link> ·{' '}
            <Link to='/about'>~/about</Link>
          </span>
        </div>
      </div>
    </Page>
  );
}
