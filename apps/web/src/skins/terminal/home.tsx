import type { PostSummary } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { Page, Prompt } from './prompt.js';

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
    <Page>
      <Prompt>whoami --verbose</Prompt>
      <div className='my-1'>
        <div className='mt-3 text-[21px] font-bold text-heading'>
          PerfectPan
        </div>
        <pre
          className='mt-[18px] select-none whitespace-pre text-[11px] leading-[1.25] text-faint max-[640px]:overflow-x-auto'
          aria-hidden='true'
        >
          {FIGLET}
          <b className='font-normal text-amber'>.org</b>
        </pre>
      </div>
      <Prompt className='mt-6'>cat motd.txt</Prompt>
      <p className='my-1 text-faint'>
        # 是个什么都不会的废物.jpg —— 但还在写。
      </p>
      <div className='mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3'>
        <Link
          to='/blog'
          className='block rounded-md border border-line bg-panel px-4 py-3.5 text-ink hover:border-amber hover:no-underline hover:shadow-[0_0_18px_rgba(233,180,76,0.07)]'
        >
          <span className='text-amber'>open blog/</span>
          <small className='mt-0.5 block text-dim'>
            算法 / TypeScript / 随笔
          </small>
        </Link>
        <Link
          to='/projects'
          className='block rounded-md border border-line bg-panel px-4 py-3.5 text-ink hover:border-amber hover:no-underline hover:shadow-[0_0_18px_rgba(233,180,76,0.07)]'
        >
          <span className='text-amber'>open projects/</span>
          <small className='mt-0.5 block text-dim'>
            Rust / TS / Moonbit 开源项目
          </small>
        </Link>
      </div>
      {latest.length > 0 ? (
        <>
          <Prompt className='mt-8'>ls -lt ~/posts | head -5</Prompt>
          <div className='mt-3'>
            {latest.map((post) => (
              <Link
                key={post.slug}
                to='/blog/$slug'
                params={{ slug: post.slug }}
                className='group grid grid-cols-[7ch_1fr_auto] items-baseline gap-x-3.5 rounded px-2 py-[5px] hover:bg-sel hover:no-underline'
              >
                <span className='text-[13px] text-dim'>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </span>
                <span className='truncate group-hover:text-amber'>
                  {post.title}
                </span>
                <span className='text-right text-[12.5px] text-faint'>
                  {post.tags.join(' · ')}
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </Page>
  );
}
