import type { PostSummary } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { type BlogListData, groupByYear } from '../shared.js';

export type { BlogListData };

const PERM_CLASS: Record<PostSummary['visibility'], string> = {
  public: 'th-perm th-perm-pub',
  member: 'th-perm th-perm-mem',
  vip: 'th-perm th-perm-vip',
  admin: 'th-perm th-perm-adm',
  password: 'th-perm th-perm-pw',
};
const PERM_BITS: Record<PostSummary['visibility'], string> = {
  public: '-r--r--r--',
  member: '-r--r-----',
  vip: '-r----r--',
  admin: '-r--------',
  password: '-r--------',
};

export function TerminalBlogList({
  data,
  showDevHint,
  devScopeHint,
}: {
  data: BlogListData;
  showDevHint: boolean;
  devScopeHint: string;
}) {
  const blogGroups = groupByYear(data.posts);

  return (
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~/posts %</span>{' '}
        <span className='th-cmd'>ls -la --group-directories-first</span>
      </div>

      {showDevHint ? (
        <div className='th-devhint mt-4'>{devScopeHint}</div>
      ) : null}

      <div className='th-ls'>
        <div className='th-ls-row th-ls-head'>
          <span>perms</span>
          <span>date</span>
          <span>vis</span>
          <span>title</span>
          <span className='text-right'>tags</span>
        </div>
        {blogGroups.map((group) => (
          <div key={group.year}>
            <div className='th-ls-row'>
              <span className='th-ls-year'>{group.year}</span>
            </div>
            {group.blogs.map((blog: PostSummary) => (
              <Link
                key={blog.slug}
                to='/blog/$slug'
                params={{ slug: blog.slug }}
                className='th-ls-row'
              >
                <span className={PERM_CLASS[blog.visibility]}>
                  {PERM_BITS[blog.visibility]}
                </span>
                <span className='th-ls-date'>
                  {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </span>
                <span className='th-ls-vis th-comment'>{blog.visibility}</span>
                <span className='th-ls-title'>{blog.title}</span>
                <span className='th-ls-tags text-right'>
                  {blog.tags.join(' · ')}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {data.totalPages > 1 ? (
        <nav className='th-pager' aria-label='Pagination'>
          {data.page > 1 ? (
            <Link to='/blog' search={{ page: data.page - 1 }}>
              ← prev
            </Link>
          ) : (
            <span className='th-pager-off'>← prev</span>
          )}
          <span>
            page {data.page} / {data.totalPages}
          </span>
          {data.page < data.totalPages ? (
            <Link to='/blog' search={{ page: data.page + 1 }}>
              next →
            </Link>
          ) : (
            <span className='th-pager-off'>next →</span>
          )}
        </nav>
      ) : null}

      <p className='th-legend'>
        # perms = 可见性：owner / member / guest 读权限
        <br /># <span className='th-perm-pub'>-r--r--r--</span> 公开 ·{' '}
        <span className='th-perm-mem'>-r--r-----</span> 登录可见 ·{' '}
        <span className='th-perm-vip'>-r----r--</span> VIP ·{' '}
        <span className='th-perm-pw'>-r--------</span> 需密码
      </p>

      <hr className='th-hr' />
      <div className='th-prompt'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~/posts %</span>{' '}
        <Link to='/' className='th-cmd th-cmd-dim'>
          cd ..
        </Link>
      </div>
    </div>
  );
}
