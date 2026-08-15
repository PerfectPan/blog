import type { PostSummary, SessionUser } from '@blog/shared';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';
import { getBlogListServerFn } from '../../lib/blog-service.js';

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
  let runningIndex = 0;

  // Conventional blog pagination: the page scrolls naturally; jump back to the
  // top on each page change so the new page starts at its first post.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on page change, value unused in body on purpose
  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0 });
  }, [data.page]);

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
          {group.blogs.map((blog: PostSummary) => {
            runningIndex += 1;
            return (
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
                  {String(runningIndex).padStart(3, '0')}
                </span>
              </div>
            );
          })}
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
