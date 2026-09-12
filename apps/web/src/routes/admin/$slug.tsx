import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { PostEditor } from '../../components/post-editor.js';
import {
  getAdminPostServerFn,
  listPostTagsServerFn,
} from '../../lib/admin-service.js';

export const Route = createFileRoute('/admin/$slug')({
  head: () => ({ meta: [{ title: 'Admin · 编辑文章' }] }),
  loader: async ({ params }) => {
    const { post } = await getAdminPostServerFn({
      data: { slug: params.slug },
    });
    if (!post) {
      throw notFound();
    }
    const { tags } = await listPostTagsServerFn();
    return { post, allTags: tags };
  },
  component: EditPostPage,
});

function EditPostPage() {
  const { post, allTags } = Route.useLoaderData();
  return (
    <div className='mx-auto w-full self-start max-w-5xl px-4 pt-8 pb-12 sm:px-6'>
      <div className='th-prompt mb-2'>
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>vi /posts/{post.slug}.md</span>
      </div>
      <Link to='/admin' className='th-cd mb-4 inline-block text-sm'>
        ← 返回列表
      </Link>
      <h1 className='th-admin-title mb-6 truncate'>
        编辑 · {post.title || post.slug}
      </h1>
      <PostEditor mode='edit' initial={post} allTags={allTags} />
    </div>
  );
}
