import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { PostEditor } from '../../components/post-editor.js';
import { getAdminPostServerFn } from '../../lib/admin-service.js';

export const Route = createFileRoute('/admin/$slug')({
  head: () => ({ meta: [{ title: 'Admin · 编辑文章' }] }),
  loader: async ({ params }) => {
    const { post } = await getAdminPostServerFn({
      data: { slug: params.slug },
    });
    if (!post) {
      throw notFound();
    }
    return { post };
  },
  component: EditPostPage,
});

function EditPostPage() {
  const { post } = Route.useLoaderData();
  return (
    <div className='mx-auto w-full self-start max-w-5xl pt-24 lg:pt-28'>
      <Link
        to='/admin'
        className='mb-4 inline-block text-sm opacity-60 hover:opacity-100'
      >
        ← 返回列表
      </Link>
      <h1 className='mb-6 truncate text-2xl font-black'>
        编辑 · {post.title || post.slug}
      </h1>
      <PostEditor mode='edit' initial={post} />
    </div>
  );
}
