import { createFileRoute, Link } from '@tanstack/react-router';
import { PostEditor } from '../../components/post-editor.js';
import { ensureAdminServerFn } from '../../lib/admin-service.js';

export const Route = createFileRoute('/admin/new')({
  head: () => ({ meta: [{ title: 'Admin · 新建文章' }] }),
  loader: async () => ensureAdminServerFn(),
  component: NewPostPage,
});

function NewPostPage() {
  return (
    <div className='mx-auto w-full self-start max-w-5xl pt-24 lg:pt-28'>
      <Link
        to='/admin'
        className='mb-4 inline-block text-sm opacity-60 hover:opacity-100'
      >
        ← 返回列表
      </Link>
      <h1 className='mb-6 text-2xl font-black'>新建文章</h1>
      <PostEditor mode='new' />
    </div>
  );
}
