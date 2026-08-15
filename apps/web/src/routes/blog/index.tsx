import type { PostSummary, SessionUser } from '@blog/shared';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';
import { getBlogListServerFn } from '../../lib/blog-service.js';
import { tagColor } from '../../lib/tag-color.js';

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

const VIS_STICKER: Record<
  PostSummary['visibility'],
  { text: string; bg: string }
> = {
  public: { text: '', bg: '' },
  member: { text: 'MEMBER', bg: '#FF90C2' },
  vip: { text: 'VIP', bg: '#7C5CFF' },
  admin: { text: 'ADMIN', bg: '#141414' },
  password: { text: '🔒 密码', bg: '#FF6B35' },
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
    <div className='f-page'>
      <div className='f-page-head'>
        <span className='f-banner'>ALL POSTS</span>
        <h1>博客</h1>
      </div>

      {showDevHint ? <div className='f-devhint'>{devScopeHint}</div> : null}

      <div className='f-card f-list-card'>
        {blogGroups.map((group) => (
          <div key={group.year}>
            <div className='f-yr'>
              <span className='pill'>{group.year}</span>
            </div>
            {group.blogs.map((blog: PostSummary, index: number) => (
              <Link
                key={blog.slug}
                to='/blog/$slug'
                params={{ slug: blog.slug }}
                className='f-post-row'
              >
                <span className='no'>
                  {String(data.total - ((data.page - 1) * 10 + index)).padStart(
                    3,
                    '0',
                  )}
                </span>
                <span className='t'>{blog.title}</span>
                <span className='tags'>
                  {blog.visibility !== 'public' ? (
                    <span
                      className='f-sticker'
                      style={{ background: VIS_STICKER[blog.visibility].bg }}
                    >
                      {VIS_STICKER[blog.visibility].text}
                    </span>
                  ) : null}
                  {blog.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className='f-sticker'
                      style={{ background: tagColor(tag) }}
                    >
                      {tag}
                    </span>
                  ))}
                </span>
                <span className='d'>
                  {new Date(blog.publishedAt).toISOString().slice(5, 10)}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {data.totalPages > 1 ? (
        <nav className='f-pager' aria-label='Pagination'>
          {data.page > 1 ? (
            <Link className='f-btn' to='/blog' search={{ page: data.page - 1 }}>
              ← PREV
            </Link>
          ) : null}
          <span className='f-btn cur'>
            {data.page} / {data.totalPages}
          </span>
          {data.page < data.totalPages ? (
            <Link className='f-btn' to='/blog' search={{ page: data.page + 1 }}>
              NEXT →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
