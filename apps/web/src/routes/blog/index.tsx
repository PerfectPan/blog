import type { PostSummary, SessionUser } from '@blog/shared';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

/** Visibility → permission bits: owner / member / guest read permission. */
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
  // top on each page change so the new page starts at its first post. (Without
  // this, clicking "next" while scrolled to the bottom leaves the reader past a
  // shorter page — the original "bounce".)
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on page change, value unused in body on purpose
  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0 });
  }, [data.page]);

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
              <ChevronLeft size={14} className='inline' aria-hidden='true' />{' '}
              prev
            </Link>
          ) : (
            <span className='th-pager-off'>
              <ChevronLeft size={14} className='inline' aria-hidden='true' />{' '}
              prev
            </span>
          )}
          <span>
            page {data.page} / {data.totalPages}
          </span>
          {data.page < data.totalPages ? (
            <Link to='/blog' search={{ page: data.page + 1 }}>
              next{' '}
              <ChevronRight size={14} className='inline' aria-hidden='true' />
            </Link>
          ) : (
            <span className='th-pager-off'>
              next{' '}
              <ChevronRight size={14} className='inline' aria-hidden='true' />
            </span>
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
