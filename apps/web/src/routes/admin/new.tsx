import { createFileRoute } from '@tanstack/react-router';
import { PostEditor } from '../../components/post-editor.js';
import { ensureAdminServerFn } from '../../lib/admin-service.js';

export const Route = createFileRoute('/admin/new')({
  head: () => ({ meta: [{ title: 'Admin | New post' }] }),
  loader: async () => ensureAdminServerFn(),
  component: NewPostPage,
});

function NewPostPage() {
  return (
    <div className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
      <h1 className='mb-6 text-3xl font-black'>New post</h1>
      <PostEditor mode='new' />
    </div>
  );
}
