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

const VIS_CLASS: Record<PostSummary['visibility'], string> = {
  public: 'z-vis',
  member: 'z-vis mem',
  vip: 'z-vis vip',
  admin: 'z-vis adm',
  password: 'z-vis pw',
};
const VIS_TEXT: Record<PostSummary['visibility'], string> = {
  public: '',
  member: '会 员',
  vip: 'VIP',
  admin: '编',
  password: '密',
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
    <div className='z-page'>
      <div className='z-ma' style={{ paddingTop: 56 }} aria-hidden='true'>
        <span>間</span>
      </div>

      {showDevHint ? <div className='z-devhint'>{devScopeHint}</div> : null}

      {blogGroups.map((group) => (
        <div key={group.year}>
          <div className='z-year'>{group.year}</div>
          {group.blogs.map((blog: PostSummary) => (
            <Link
              key={blog.slug}
              to='/blog/$slug'
              params={{ slug: blog.slug }}
              className='z-item flex'
            >
              <span className='t'>
                {blog.title}
                {blog.visibility !== 'public' ? (
                  <span className={VIS_CLASS[blog.visibility]}>
                    {VIS_TEXT[blog.visibility]}
                  </span>
                ) : null}
              </span>
              <span className='d'>
                {new Date(blog.publishedAt)
                  .toISOString()
                  .slice(5, 10)
                  .replace('-', ' / ')}
              </span>
            </Link>
          ))}
        </div>
      ))}

      {data.totalPages > 1 ? (
        <nav className='z-pager' aria-label='翻页'>
          {data.page > 1 ? (
            <Link to='/blog' search={{ page: data.page - 1 }}>
              ← 前
            </Link>
          ) : null}
          <span>
            {data.page} / {data.totalPages}
          </span>
          {data.page < data.totalPages ? (
            <Link to='/blog' search={{ page: data.page + 1 }}>
              次 →
            </Link>
          ) : null}
        </nav>
      ) : null}

      <div className='z-ma' aria-hidden='true'>
        <span>次 の 頁 へ</span>
      </div>
    </div>
  );
}
