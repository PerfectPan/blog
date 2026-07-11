import type { PostVisibility } from '@blog/shared';
import { Link, createFileRoute } from '@tanstack/react-router';
import {
  type AdminPost,
  listAdminPostsServerFn,
} from '../../lib/admin-service.js';

export const Route = createFileRoute('/admin/')({
  head: () => ({ meta: [{ title: 'Admin · 文章管理' }] }),
  loader: async () => listAdminPostsServerFn(),
  component: AdminListPage,
});

const visibilityStyles: Record<PostVisibility, string> = {
  public:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  member: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  vip: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  password:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

function AdminListPage() {
  const { posts } = Route.useLoaderData();
  const draftCount = posts.filter(
    (post: AdminPost) => post.status === 'draft',
  ).length;

  return (
    <div className='mx-auto w-full max-w-5xl pt-24 lg:pt-28'>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-black'>文章管理</h1>
          <p className='mt-1 text-sm opacity-60'>
            共 {posts.length} 篇
            {draftCount > 0 ? ` · ${draftCount} 篇草稿` : ''}
          </p>
        </div>
        <Link
          to='/admin/new'
          className='rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-neutral-900'
        >
          + 新建文章
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className='rounded-lg border border-dashed border-slate-300 px-6 py-16 text-center text-sm opacity-70 dark:border-slate-700'>
          还没有文章。点 “+ 新建文章” 写第一篇吧。
        </div>
      ) : (
        <div className='overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700'>
          <div className='hidden grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-200 bg-black/[0.02] px-4 py-2 text-xs font-semibold tracking-wide opacity-60 sm:grid dark:border-slate-700 dark:bg-white/[0.03]'>
            <span>标题 / slug</span>
            <span>属性</span>
          </div>
          <ul className='divide-y divide-slate-200 dark:divide-slate-700'>
            {posts.map((post: AdminPost) => (
              <li
                key={post.slug}
                className='grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
              >
                <div className='min-w-0'>
                  <Link
                    to='/admin/$slug'
                    params={{ slug: post.slug }}
                    className='block truncate font-medium hover:underline'
                  >
                    {post.title || post.slug}
                  </Link>
                  <div className='truncate text-xs opacity-50'>
                    /blog/{post.slug}
                  </div>
                </div>
                <div className='flex flex-wrap items-center justify-end gap-1.5'>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${visibilityStyles[post.visibility]}`}
                  >
                    {post.visibility}
                  </span>
                  {post.status === 'draft' ? (
                    <span className='rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'>
                      draft
                    </span>
                  ) : null}
                  <Link
                    to='/blog/$slug'
                    params={{ slug: post.slug }}
                    className='ml-1 text-xs opacity-60 hover:opacity-100'
                    title='在前台查看'
                  >
                    查看 →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to='/'
        className='mt-8 inline-block text-sm opacity-60 hover:opacity-100'
      >
        ← 返回首页
      </Link>
    </div>
  );
}
