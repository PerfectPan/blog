import { canAccessVisibility } from '@blog/shared';
import {
  Link,
  createFileRoute,
  notFound,
  redirect,
} from '@tanstack/react-router';
import { Markdown } from '../../components/markdown.js';
import { Utterances } from '../../components/utterances.js';
import { getBlogPostServerFn } from '../../lib/blog-service.js';

export const Route = createFileRoute('/blog/$slug')({
  head: () => ({
    meta: [{ title: "Blog | PerfectPan's Blog" }],
  }),
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

  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
      <div className='m-auto mb-8 flex flex-col gap-2'>
        <div className='text-3xl font-black'>{post.title}</div>
        <div className='opacity-60'>{date}</div>
      </div>
      <Markdown content={post.contentMdx} />
      <Link to='/blog' className='mt-4 inline-block'>
        <span className='opacity-70'>&gt;&nbsp;&nbsp;&nbsp;</span>
        <span className='underline opacity-70 hover:opacity-100'>cd ..</span>
      </Link>
      <Utterances slug={post.slug} />
    </div>
  );
}
