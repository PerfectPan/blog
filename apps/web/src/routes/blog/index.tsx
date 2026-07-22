import type { PostSummary, SessionUser } from '@blog/shared';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
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
  const listRef = useRef<HTMLDivElement>(null);
  const paginated = data.totalPages > 1;

  // When paginated, the list scrolls internally (not the window); jump back to
  // the top on each page change so the new page starts at the first post.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on page change, value unused in body on purpose
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [data.page]);

  const list = (
    <>
      {showDevHint ? (
        <div className='mb-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
          {devScopeHint}
        </div>
      ) : null}
      {blogGroups.map((group) => (
        <div key={group.year}>
          <div className='mb-4 text-3xl'>{group.year}</div>
          {group.blogs.map((blog: PostSummary) => (
            <div
              key={blog.slug}
              className='mt-2 mb-6 opacity-70 hover:opacity-100'
            >
              <Link
                to='/blog/$slug'
                params={{ slug: blog.slug }}
                className='flex items-center gap-2'
              >
                <span className='text-lg leading-[1.2em]'>{blog.title}</span>
                <span className='text-sm opacity-50'>
                  {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </Link>
            </div>
          ))}
        </div>
      ))}
    </>
  );

  const pagination = (
    <nav
      className='mx-auto flex w-full shrink-0 max-w-[80ch] items-center justify-center gap-4 py-4 text-sm sm:gap-6'
      aria-label='Pagination'
    >
      {data.page > 1 ? (
        <Link
          to='/blog'
          search={{ page: data.page - 1 }}
          className='inline-flex items-center gap-1 opacity-60 hover:opacity-100'
        >
          <ChevronLeft size={14} /> prev
        </Link>
      ) : (
        <span className='inline-flex items-center gap-1 opacity-30'>
          <ChevronLeft size={14} /> prev
        </span>
      )}
      <span className='opacity-60'>
        page {data.page} / {data.totalPages}
      </span>
      {data.page < data.totalPages ? (
        <Link
          to='/blog'
          search={{ page: data.page + 1 }}
          className='inline-flex items-center gap-1 opacity-60 hover:opacity-100'
        >
          next <ChevronRight size={14} />
        </Link>
      ) : (
        <span className='inline-flex items-center gap-1 opacity-30'>
          next <ChevronRight size={14} />
        </span>
      )}
    </nav>
  );

  const cdUp = (
    <Link to='/' className='mx-auto block w-full max-w-[80ch] shrink-0 py-2'>
      <span className='opacity-70'>&gt;&nbsp;&nbsp;&nbsp;</span>
      <span className='underline opacity-70 hover:opacity-100'>cd ..</span>
    </Link>
  );

  // Paginated: fill the viewport as a column — header / list(scrolls) /
  // pagination / cd / footer — so the layout never bounces between pages.
  if (paginated) {
    return (
      <div className='flex w-full flex-col self-stretch'>
        <div
          ref={listRef}
          className='mx-auto flex min-h-0 w-full max-w-[80ch] flex-1 flex-col overflow-y-auto pt-24 lg:pt-32'
        >
          {list}
        </div>
        {pagination}
        {cdUp}
      </div>
    );
  }

  // Single page: let the content flow naturally.
  return (
    <div className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
      {list}
      <div className='mt-4'>{cdUp}</div>
    </div>
  );
}
