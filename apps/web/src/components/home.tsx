import type { PostSummary } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { Page, Prompt } from './page.js';

const FIGLET = `                  __           _
 _ __   ___ _ __ / _| ___  ___| |_ _ __   __ _ _ __
| '_ \\ / _ \\ '__| |_ / _ \\/ __| __| '_ \\ / _\` | '_ \\
| |_) |  __/ |  |  _|  __/ (__| |_| |_) | (_| | | | |
| .__/ \\___|_|  |_|  \\___|\\___|\\__| .__/ \\__,_|_| |_|
|_|                               |_|                `;

// Card row: one terminal window per destination. shadcn tokens for the
// structure; the amber accent is the one place the terminal ink survives.
const CARD =
  'block rounded-md border border-border bg-card px-4 py-3.5 text-foreground no-underline hover:border-primary hover:shadow-[0_0_18px_color-mix(in_srgb,var(--primary)_7%,transparent)]';

// One post line in the recent-posts panel. Used for both the link rows and
// the empty state; the divider is a top border on every row but the first.
// Rows live in their own wrapper so first: means "first row", not "the child
// after the panel header" — the header already carries a solid border-b.
const ROW =
  'grid grid-cols-[10ch_1fr] items-baseline gap-3.5 border-t border-dashed border-border px-4 py-2.75 text-foreground first:border-t-0 hover:bg-accent hover:no-underline';

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
      {/* Hero prompt: the home's single command line — the ls echo lives in
          the panel header instead of repeating the whoami prefix a second
          time. Same shared Prompt as every page. */}
      <Prompt cwd='~ %'>whoami --verbose</Prompt>
      <div className='mb-1 mt-3'>
        <pre
          className='mt-4.5 select-none text-[min(11px,calc((100vw-32px)/34.5))] leading-tight whitespace-pre text-muted-foreground/50'
          aria-hidden='true'
        >
          {FIGLET}
          <b className='font-normal text-primary'>.org</b>
        </pre>
      </div>
      <div className='mt-5.5 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3'>
        <Link to='/blog' className={CARD}>
          <span className='text-primary'>open blog/</span>
        </Link>
        <Link to='/projects' className={CARD}>
          <span className='text-primary'>open projects/</span>
        </Link>
      </div>

      <div className='mt-7 overflow-hidden rounded-md border border-border bg-card'>
        <div className='flex items-baseline justify-between gap-3 border-b border-border bg-muted/50 px-4 py-3 text-sm tracking-widest text-muted-foreground'>
          <span>ls -t ~/posts | head -5</span>
          <span>{total} 篇文章</span>
        </div>
        {latest.length === 0 ? (
          <div>
            <div className={ROW}>
              <span className='text-sm text-muted-foreground'>--</span>
              <span>暂无文章</span>
            </div>
          </div>
        ) : (
          <div>
            {latest.map((post: PostSummary) => (
              <Link
                key={post.slug}
                to='/blog/$slug'
                params={{ slug: post.slug }}
                className={ROW}
              >
                <span className='text-sm text-muted-foreground'>
                  {new Date(post.publishedAt)
                    .toISOString()
                    .slice(0, 10)
                    .replaceAll('-', '/')}
                </span>
                <span className='truncate'>{post.title}</span>
              </Link>
            ))}
          </div>
        )}
        <div className='flex items-baseline justify-between gap-3 border-t border-border bg-muted/50 px-4 py-2.25 text-sm text-muted-foreground'>
          <Link to='/blog' className='text-primary hover:underline'>
            cd ~/posts
          </Link>
          <span>
            <Link to='/projects' className='text-primary hover:underline'>
              ~/projects
            </Link>{' '}
            ·{' '}
            <Link to='/about' className='text-primary hover:underline'>
              ~/about
            </Link>
          </span>
        </div>
      </div>
    </Page>
  );
}
