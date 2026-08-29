import type { PostSummary } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { type BlogListData, groupByYear } from '../../lib/blog-utils.js';
import { Page, Prompt } from './prompt.js';

const PERM_CLASS: Record<PostSummary['visibility'], string> = {
  public: 'text-green',
  member: 'text-cyan',
  vip: 'text-violet',
  admin: 'text-dim',
  password: 'text-red',
};
const PERM_BITS: Record<PostSummary['visibility'], string> = {
  public: '-r--r--r--',
  member: '-r--r-----',
  vip: '-r----r--',
  admin: '-r--------',
  password: '-r--------',
};
// 12ch: the 10-char perm string + 0.08em letter-spacing ≈ 11.33ch; 11ch
// wrapped its last character onto a second line.
const rowBase =
  'grid grid-cols-[12ch_7ch_1fr_auto] items-baseline gap-x-3.5 rounded px-2 py-[5px] max-[720px]:grid-cols-[12ch_7ch_1fr]';
const rowWithVis =
  'grid grid-cols-[12ch_7ch_8ch_1fr_auto] items-baseline gap-x-3.5 rounded px-2 py-[5px] max-[720px]:grid-cols-[12ch_7ch_1fr]';
const permCell = 'whitespace-nowrap tracking-[0.08em]';

export function TerminalBlogList({
  data,
  showDevHint,
  devScopeHint,
  showVisibility,
}: {
  data: BlogListData;
  showDevHint: boolean;
  devScopeHint: string;
  /** Vis column + perms legend only earn their space when visibility
   * actually varies (non-public posts, or a logged-in viewer); for a guest
   * on an all-public list they are three renderings of the same non-fact. */
  showVisibility: boolean;
}) {
  const blogGroups = groupByYear(data.posts);
  const rowCls = showVisibility ? rowWithVis : rowBase;

  return (
    <Page>
      <Prompt path='~/posts %'>ls -la --group-directories-first</Prompt>

      {showDevHint ? (
        <div className='mt-4 rounded border border-dashed border-amber/50 bg-amber/[0.06] px-3 py-2 text-[13px] text-amber'>
          {devScopeHint}
        </div>
      ) : null}

      <div className='mt-3'>
        <div
          className={`${rowCls} max-[720px]:hidden text-[12.5px] text-faint`}
        >
          <span>perms</span>
          <span>date</span>
          {showVisibility ? <span>vis</span> : null}
          <span>title</span>
          <span className='text-right'>tags</span>
        </div>
        {blogGroups.map((group) => (
          <div key={group.year}>
            <div
              className={`${rowCls} col-span-full mt-5 font-bold text-amber`}
            >
              <span>{group.year}</span>
            </div>
            {group.blogs.map((blog: PostSummary) => (
              <Link
                key={blog.slug}
                to='/blog/$slug'
                params={{ slug: blog.slug }}
                className={`${rowCls} text-ink hover:bg-sel hover:no-underline`}
              >
                <span className={`${permCell} ${PERM_CLASS[blog.visibility]}`}>
                  {PERM_BITS[blog.visibility]}
                </span>
                <span className='text-[13px] text-dim'>
                  {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </span>
                {showVisibility ? (
                  <span className='max-[720px]:hidden text-[13px] text-faint'>
                    {blog.visibility}
                  </span>
                ) : null}
                <span className='truncate'>{blog.title}</span>
                <span className='max-[720px]:hidden text-right text-[12.5px] text-faint'>
                  {blog.tags.join(' · ')}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {data.totalPages > 1 ? (
        <nav
          className='mt-[26px] flex justify-center gap-4 text-[13.5px] text-dim'
          aria-label='Pagination'
        >
          {data.page > 1 ? (
            <Link
              to='/blog'
              search={{ page: data.page - 1 }}
              className='text-amber'
            >
              ← prev
            </Link>
          ) : (
            <span className='text-faint opacity-60'>← prev</span>
          )}
          <span>
            page {data.page} / {data.totalPages}
          </span>
          {data.page < data.totalPages ? (
            <Link
              to='/blog'
              search={{ page: data.page + 1 }}
              className='text-amber'
            >
              next →
            </Link>
          ) : (
            <span className='text-faint opacity-60'>next →</span>
          )}
        </nav>
      ) : null}

      {showVisibility ? (
        <p className='mt-[26px] text-[12.5px] leading-[1.9] text-faint'>
          # perms = 可见性：owner / member / guest 读权限
          <br /># <span className={`${permCell} text-green`}>-r--r--r--</span>{' '}
          公开 · <span className={`${permCell} text-cyan`}>-r--r-----</span>{' '}
          登录可见 ·{' '}
          <span className={`${permCell} text-violet`}>-r----r--</span> VIP ·{' '}
          <span className={`${permCell} text-red`}>-r--------</span> 需密码
        </p>
      ) : null}

      <hr className='my-5 border-0 border-t border-dashed border-line' />
      <Prompt path='~/posts %'>
        <Link to='/' className='text-dim hover:text-ink hover:no-underline'>
          {' '}
          cd ..{' '}
        </Link>
      </Prompt>
    </Page>
  );
}
