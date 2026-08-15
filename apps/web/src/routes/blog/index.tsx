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

const PERM_CLASS: Record<PostSummary['visibility'], string> = {
  public: 'e-perm pub',
  member: 'e-perm mem',
  vip: 'e-perm vip',
  admin: 'e-perm adm',
  password: 'e-perm pw',
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
    <div className='e-board'>
      <section className='e-sheet'>
        <span className='e-tick tl' aria-hidden='true' />
        <span className='e-tick tr' aria-hidden='true' />
        <span className='e-tick bl' aria-hidden='true' />
        <span className='e-tick br' aria-hidden='true' />
        <div className='e-sheet-head'>
          <span className='dwg'>
            DWG NO. PP-BLOG-{String(data.page).padStart(3, '0')}
          </span>
          <span className='dwg'>
            REV <span className='rev'>C</span>
          </span>
        </div>

        {showDevHint ? <div className='e-devhint'>{devScopeHint}</div> : null}

        <table className='e-bom'>
          <thead>
            <tr>
              <th>ITEM</th>
              <th>TITLE / DESCRIPTION</th>
              <th>ACCESS</th>
              <th>DATE</th>
              <th>MARK</th>
            </tr>
          </thead>
          <tbody>
            {blogGroups.map((group) => (
              <Fragment key={group.year} group={group} data={data} />
            ))}
          </tbody>
        </table>

        {data.totalPages > 1 ? (
          <nav className='e-pager' aria-label='Pagination'>
            {data.page > 1 ? (
              <Link to='/blog' search={{ page: data.page - 1 }}>
                ← PREV
              </Link>
            ) : (
              <span style={{ opacity: 0.5 }}>← PREV</span>
            )}
            <span>
              SHEET {data.page} / {data.totalPages}
            </span>
            {data.page < data.totalPages ? (
              <Link to='/blog' search={{ page: data.page + 1 }}>
                NEXT →
              </Link>
            ) : (
              <span style={{ opacity: 0.5 }}>NEXT →</span>
            )}
          </nav>
        ) : null}

        <div className='e-titleblock'>
          <span className='cell'>
            <b>PP-BLOG</b>
          </span>
          <span className='cell'>
            TITLE<b>材料清单</b>
          </span>
          <span className='cell opt'>
            SHEET
            <b>
              {data.page}/{data.totalPages}
            </b>
          </span>
        </div>
      </section>
    </div>
  );
}

function Fragment({
  group,
  data,
}: {
  group: BlogGroup;
  data: { total: number; page: number; totalPages: number };
}) {
  const startIndex = data.total - (data.page - 1) * 10;
  return (
    <>
      <tr className='yr'>
        <td colSpan={5}>— {group.year} —</td>
      </tr>
      {group.blogs.map((blog: PostSummary, index: number) => (
        <tr key={blog.slug}>
          <td className='e-item-no'>
            {String(Math.max(1, startIndex - index)).padStart(3, '0')}
          </td>
          <td>
            <Link to='/blog/$slug' params={{ slug: blog.slug }}>
              {blog.title}
            </Link>
          </td>
          <td className={PERM_CLASS[blog.visibility]}>
            {blog.visibility.toUpperCase()}
          </td>
          <td className='e-item-no'>
            {new Date(blog.publishedAt).toISOString().slice(5, 10)}
          </td>
          <td className='e-item-no'>
            {blog.tags.slice(0, 2).join('·') || '—'}
          </td>
        </tr>
      ))}
    </>
  );
}
