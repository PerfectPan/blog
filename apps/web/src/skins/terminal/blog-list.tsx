import type { PostSummary } from '@blog/shared';
import { Link } from '@tanstack/react-router';

export type BlogListData = {
  posts: PostSummary[];
  total: number;
  page: number;
  totalPages: number;
};

function groupByYear(
  posts: PostSummary[],
): { year: string; blogs: PostSummary[] }[] {
  const groups = new Map<string, PostSummary[]>();
  for (const post of posts) {
    const year = new Date(post.publishedAt).getFullYear().toString();
    const existing = groups.get(year);
    if (existing) {
      existing.push(post);
    } else {
      groups.set(year, [post]);
    }
  }
  return [...groups.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, blogs]) => ({
      year,
      blogs: [...blogs].sort((a, b) =>
        b.publishedAt.localeCompare(a.publishedAt),
      ),
    }));
}

export function TerminalBlogList({
  data,
  showDevHint,
  devScopeHint,
  showVisibility,
}: {
  data: BlogListData;
  showDevHint: boolean;
  devScopeHint: string;
  /** The vis column only earns its space when visibility actually varies
   * (non-public posts exist); for an all-public list it is pure noise. */
  showVisibility: boolean;
}) {
  const blogGroups = groupByYear(data.posts);

  return (
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~/posts %</span>{' '}
        <span className='th-cmd'>ls --group-directories-first</span>
      </div>

      {showDevHint ? (
        <div className='th-devhint mt-4'>{devScopeHint}</div>
      ) : null}

      <div className={showVisibility ? 'th-ls th-ls--vis' : 'th-ls'}>
        <div className='th-ls-row th-ls-head'>
          <span>date</span>
          {showVisibility ? <span>vis</span> : null}
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
                <span className='th-ls-date'>
                  {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </span>
                {showVisibility ? (
                  <span className='th-ls-vis th-comment'>
                    {blog.visibility}
                  </span>
                ) : null}
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
