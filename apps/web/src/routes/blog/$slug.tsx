import { canAccessVisibility } from '@blog/shared';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { Markdown } from '../../components/markdown.js';
import { getBlogPostServerFn } from '../../lib/blog-service.js';

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const data = await getBlogPostServerFn({ data: { slug: params.slug } });
    const post = data.post;

    if (!post) {
      throw notFound();
    }

    if (post.visibility === 'password' && !data.unlocked) {
      throw redirect({
        to: '/unlock/$slug',
        params: { slug: params.slug },
      });
    }

    if (post.visibility !== 'public' && post.visibility !== 'password') {
      if (!data.sessionUser) {
        throw new Response('Authentication required', { status: 401 });
      }

      if (!canAccessVisibility(post.visibility, data.sessionUser.role)) {
        throw new Response('Forbidden', { status: 403 });
      }
    }

    return data;
  },
  component: BlogDetailPage,
});

function BlogDetailPage() {
  const data = Route.useLoaderData();
  const post = data.post;
  if (!post) {
    return null;
  }

  return (
    <article>
      <header className='card' style={{ marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>{post.title}</h1>
        <p className='meta'>{post.description}</p>
        <p className='meta'>
          {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
          <span className='status-chip'>{post.visibility}</span>
        </p>
      </header>
      <Markdown content={post.contentMdx} />
    </article>
  );
}
