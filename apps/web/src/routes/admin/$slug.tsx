import { createFileRoute, notFound } from '@tanstack/react-router';
import { PostEditor } from '../../components/post-editor.js';
import { getAdminPostServerFn } from '../../lib/admin-service.js';

export const Route = createFileRoute('/admin/$slug')({
  head: () => ({ meta: [{ title: 'Admin | Edit post' }] }),
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
    <div className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
      <h1 className='mb-6 text-3xl font-black'>Edit · {post.slug}</h1>
      <PostEditor mode='edit' initial={post} />
    </div>
  );
}
