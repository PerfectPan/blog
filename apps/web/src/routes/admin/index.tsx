import { Link, createFileRoute } from '@tanstack/react-router';
import {
  type AdminPost,
  listAdminPostsServerFn,
} from '../../lib/admin-service.js';

export const Route = createFileRoute('/admin/')({
  head: () => ({ meta: [{ title: 'Admin | Posts' }] }),
  loader: async () => listAdminPostsServerFn(),
  component: AdminListPage,
});

function AdminListPage() {
  const { posts } = Route.useLoaderData();

  return (
    <div className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-black'>Admin · Posts</h1>
        <Link
          to='/admin/new'
          className='rounded-md bg-black px-3 py-2 text-sm font-semibold text-white hover:opacity-90 dark:bg-neutral-900'
        >
          + New
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className='opacity-70'>
          还没有在后台创建的文章。点 “+ New” 写第一篇（已有的 markdown
          文章不在这里列出，但可以用相同 slug 新建来覆盖）。
        </p>
      ) : (
        <ul className='divide-y divide-[#e6e6ea] dark:divide-slate-700'>
          {posts.map((post: AdminPost) => (
            <li
              key={post.slug}
              className='flex items-center justify-between gap-3 py-3'
            >
              <div className='min-w-0'>
                <Link
                  to='/admin/$slug'
                  params={{ slug: post.slug }}
                  className='truncate font-medium hover:underline'
                >
                  {post.title}
                </Link>
                <div className='text-xs opacity-60'>
                  {post.slug} · {post.visibility} · {post.status}
                </div>
              </div>
              <Link
                to='/blog/$slug'
                params={{ slug: post.slug }}
                className='shrink-0 text-sm opacity-70 hover:opacity-100'
              >
                view →
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        to='/blog'
        className='mt-8 inline-block opacity-70 hover:opacity-100'
      >
        &gt; cd ..
      </Link>
    </div>
  );
}
