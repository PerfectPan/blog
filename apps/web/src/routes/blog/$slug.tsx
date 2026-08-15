import { type CommentThread, canAccessVisibility } from '@blog/shared';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { Comments } from '../../components/comments.js';
import { Markdown } from '../../components/markdown.js';
import { getBlogPostServerFn } from '../../lib/blog-service.js';
import { getCommentsServerFn } from '../../lib/comments-service.js';

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

    // SSR the first page of comments. Fail soft: a comment-system hiccup (or a
    // not-yet-applied migration on a preview deploy) must never break reading
    // the article itself — comments are an enhancement, not core content.
    let comments = {
      comments: [] as CommentThread[],
      total: 0,
      hasMore: false,
    };
    try {
      comments = await getCommentsServerFn({
        data: { slug: params.slug, offset: 0, limit: 20 },
      });
    } catch (error) {
      console.error(
        '[web] comments SSR failed, rendering without comments',
        error,
      );
    }

    return { ...data, comments };
  },
  component: BlogDetailPage,
});

function BlogDetailPage() {
  const data = Route.useLoaderData();
  const post = data.post;
  if (!post) {
    return null;
  }

  const date = new Date(post.publishedAt).toISOString().slice(0, 10);

  return (
    <div className='g-page'>
      <article className='g-panel g-art'>
        <h1>{post.title}</h1>
        <div className='meta'>
          <span className='g-chip'>{date}</span>
          <span className='g-chip'>{post.visibility.toUpperCase()}</span>
          {post.tags.map((tag: string) => (
            <span
              key={tag}
              className='g-chip'
              style={{
                color: 'var(--g-violet)',
                borderColor: 'var(--g-violet)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <Markdown content={post.contentMdx} />
      </article>

      <div className='g-list-head' style={{ paddingBottom: 8 }}>
        <h1 style={{ fontSize: 16 }}>COMMENTS · {data.comments.total}</h1>
      </div>
      <Comments
        key={post.slug}
        slug={post.slug}
        initialComments={data.comments.comments}
        initialHasMore={data.comments.hasMore}
        initialTotal={data.comments.total}
        sessionUser={data.sessionUser}
      />
    </div>
  );
}
