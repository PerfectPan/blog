import type { PostSummary } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { type BlogListData, groupByYear } from '../../lib/blog-utils.js';

const NOTE_CLASS: Record<PostSummary['visibility'], string> = {
  public: '',
  member: 'j-note mem',
  vip: 'j-note vip',
  admin: 'j-note adm',
  password: 'j-note pw',
};
const NOTE_TEXT: Record<PostSummary['visibility'], string> = {
  public: '',
  member: '会员',
  vip: 'VIP',
  admin: '仅后台',
  password: '密码',
};

export function JournalBlogList({
  data,
  showDevHint,
  devScopeHint,
}: {
  data: BlogListData;
  showDevHint: boolean;
  devScopeHint: string;
}) {
  const blogGroups = groupByYear(data.posts);
  // Page-wide entry number (001, 002, …), precomputed — mutating a counter
  // during render breaks under concurrent/replayed renders.
  const indexBySlug = new Map(
    blogGroups
      .flatMap((group) => group.blogs)
      .map((post, i) => [post.slug, i + 1]),
  );

  return (
    <div className='j-sheet'>
      <h1 className='j-entry-title text-center'>Blog</h1>
      <p className='j-entry-meta text-center'>按年份归档 · 自新迄旧</p>

      {showDevHint ? <div className='j-devhint'>{devScopeHint}</div> : null}

      {blogGroups.map((group) => (
        <div key={group.year}>
          <div className='j-juan'>
            <h2 style={{ letterSpacing: '0.18em' }}>{group.year}</h2>
            <span className='sub'>{group.blogs.length} 篇</span>
          </div>
          {group.blogs.map((blog: PostSummary) => (
            <div className='j-toc-line' key={blog.slug}>
              <Link to='/blog/$slug' params={{ slug: blog.slug }}>
                <span className='t'>
                  {blog.title}
                  {blog.visibility !== 'public' ? (
                    <span className={NOTE_CLASS[blog.visibility]}>
                      {NOTE_TEXT[blog.visibility]}
                    </span>
                  ) : null}
                </span>
                <span className='dots' />
              </Link>
              <span className='n'>
                {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className='n' style={{ color: 'var(--j-faint)' }}>
                {String(indexBySlug.get(blog.slug) ?? 0).padStart(3, '0')}
              </span>
            </div>
          ))}
        </div>
      ))}

      {data.totalPages > 1 ? (
        <nav className='j-pager' aria-label='Pagination'>
          {data.page > 1 ? (
            <Link to='/blog' search={{ page: data.page - 1 }}>
              ← prev
            </Link>
          ) : (
            <span>← prev</span>
          )}
          <span>
            page {data.page} / {data.totalPages}
          </span>
          {data.page < data.totalPages ? (
            <Link to='/blog' search={{ page: data.page + 1 }}>
              next →
            </Link>
          ) : (
            <span>next →</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
