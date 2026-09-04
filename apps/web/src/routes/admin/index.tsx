import type { PostVisibility } from '@blog/shared';
import { createFileRoute, Link } from '@tanstack/react-router';
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
  public: 'th-badge th-badge-green',
  member: 'th-badge th-badge-cyan',
  vip: 'th-badge th-badge-amber',
  admin: 'th-badge th-badge-red',
  password: 'th-badge th-badge-faint',
};

function AdminListPage() {
  const { posts } = Route.useLoaderData();
  const draftCount = posts.filter(
    (post: AdminPost) => post.status === 'draft',
  ).length;

  return (
    <div className='mx-auto w-full self-start max-w-5xl px-4 pt-8 pb-12 sm:px-6'>
      <div className='th-prompt mb-2'>
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>admin --manage</span>
      </div>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='th-admin-title'>文章管理</h1>
          <p className='th-comment mt-1'>
            # 共 {posts.length} 篇
            {draftCount > 0 ? ` · ${draftCount} 篇草稿` : ''}
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <Link to='/admin/comments' className='th-cd text-sm'>
            评论审核
          </Link>
          <Link to='/admin/new' className='th-btn th-btn-primary'>
            + 新建文章
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className='th-comment px-6 py-16 text-center'>
          # 还没有文章。点 “+ 新建文章” 写第一篇吧。
        </div>
      ) : (
        <div>
          <ul>
            {posts.map((post: AdminPost) => (
              <li key={post.slug} className='th-admin-row'>
                <div className='min-w-0'>
                  <Link
                    to='/admin/$slug'
                    params={{ slug: post.slug }}
                    className='th-admin-title-link block truncate'
                  >
                    {post.title || post.slug}
                  </Link>
                  <div className='th-comment truncate text-xs'>
                    /blog/{post.slug}
                  </div>
                </div>
                <div className='flex flex-wrap items-center gap-1.5 sm:justify-end'>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${visibilityStyles[post.visibility]}`}
                  >
                    {post.visibility}
                  </span>
                  {post.status === 'draft' ? (
                    <span className='th-badge th-badge-amber'>draft</span>
                  ) : null}
                  <Link
                    to='/blog/$slug'
                    params={{ slug: post.slug }}
                    className='th-cd text-xs'
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

      <Link to='/' className='th-cd mt-8 inline-block text-sm'>
        ← 返回首页
      </Link>
    </div>
  );
}
