import type { PostSummary, SessionUser } from '@blog/shared';
import { createFileRoute, Link } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { useEffect } from 'react';
import { z } from 'zod';
import { getBlogListServerFn } from '../../lib/blog-service.js';
import { postIndex, tagColor } from '../../lib/post-index.js';

type BlogGroup = {
  year: string;
  blogs: PostSummary[];
};

function groupByYear(posts: PostSummary[]): BlogGroup[] {
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

function getDevScopeHint(sessionUser: SessionUser | null | undefined): string {
  if (!sessionUser) {
    return '当前身份：游客；可见范围：public';
  }

  if (sessionUser.role === 'admin') {
    return '当前身份：admin；可见范围：全部已发布（含 password）';
  }

  if (sessionUser.role === 'vip') {
    return '当前身份：vip；可见范围：public/member/vip';
  }

  return '当前身份：member；可见范围：public/member';
}

const VIS_CLASS: Record<PostSummary['visibility'], string> = {
  public: 'c-vis',
  member: 'c-vis mem',
  vip: 'c-vis vip',
  admin: 'c-vis adm',
  password: 'c-vis pw',
};
const VIS_TEXT: Record<PostSummary['visibility'], string> = {
  public: 'PUBLIC',
  member: 'MEMBER',
  vip: 'VIP',
  admin: 'ADMIN',
  password: 'PASSWORD',
};

export const Route = createFileRoute('/blog/')({
  head: () => ({
    meta: [
      { title: "Blog | PerfectPan's Blog" },
      { name: 'description', content: "Blog | PerfectPan's Blog" },
    ],
  }),
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).optional(),
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps }) => {
    const data = await getBlogListServerFn({ data: { page: deps.page ?? 1 } });
    return {
      ...data,
      isDev: process.env.NODE_ENV === 'development',
    };
  },
  component: BlogListPage,
});

function BlogListPage() {
  const data = Route.useLoaderData();
  const blogGroups = groupByYear(data.posts);
  const showDevHint = data.isDev;
  const devScopeHint = getDevScopeHint(data.sessionUser);

  // Conventional blog pagination: the page scrolls naturally; jump back to the
  // top on each page change so the new page starts at its first post.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on page change, value unused in body on purpose
  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0 });
  }, [data.page]);

  return (
    <div className='c-page'>
      <div className='c-list-head'>
        <h1>Blog</h1>
        <span className='count c-no'>
          — {data.total} entries / {data.totalPages} pages
        </span>
      </div>

      {showDevHint ? <div className='c-devhint'>{devScopeHint}</div> : null}

      <div className='c-rowlist'>
        {blogGroups.map((group) => (
          <div key={group.year}>
            <div className='c-year'>{group.year}</div>
            {group.blogs.map((blog: PostSummary) => (
              <Link
                key={blog.slug}
                to='/blog/$slug'
                params={{ slug: blog.slug }}
                className='c-row'
              >
                <span className='c-no'>
                  №{String(postIndex(blog.publishedAt)).padStart(4, '0')}
                </span>
                <span className='t'>
                  {blog.title}
                  {blog.visibility !== 'public' ? (
                    <span className={VIS_CLASS[blog.visibility]}>
                      {VIS_TEXT[blog.visibility]}
                    </span>
                  ) : null}
                </span>
                <span className='tags'>
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className='c-chip'
                      style={{ '--c-c': tagColor(tag) } as CSSProperties}
                    >
                      {tag}
                    </span>
                  ))}
                </span>
                <span className='d'>
                  {new Date(blog.publishedAt)
                    .toISOString()
                    .slice(5, 10)
                    .replace('-', '/')}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {data.totalPages > 1 ? (
        <nav className='c-pager' aria-label='Pagination'>
          {data.page > 1 ? (
            <Link to='/blog' search={{ page: data.page - 1 }}>
              ← prev
            </Link>
          ) : (
            <span style={{ opacity: 0.4 }}>← prev</span>
          )}
          <span className='cur'>
            {data.page} / {data.totalPages}
          </span>
          {data.page < data.totalPages ? (
            <Link to='/blog' search={{ page: data.page + 1 }}>
              next →
            </Link>
          ) : (
            <span style={{ opacity: 0.4 }}>next →</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
