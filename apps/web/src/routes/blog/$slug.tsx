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

  const year = new Date(post.publishedAt).getFullYear();
  const date = new Date(post.publishedAt).toISOString().slice(0, 10);

  return (
    <div className='e-board'>
      <article className='e-sheet'>
        <span className='e-tick tl' aria-hidden='true' />
        <span className='e-tick tr' aria-hidden='true' />
        <span className='e-tick bl' aria-hidden='true' />
        <span className='e-tick br' aria-hidden='true' />
        <div className='e-sheet-head'>
          <span className='dwg'>
            DWG NO. PP-POST-{post.slug.slice(0, 14).toUpperCase()}
          </span>
          <span className='dwg'>
            REV <span className='rev'>B</span>
          </span>
        </div>

        <div className='e-art-head'>
          <h1>{post.title}</h1>
          <div className='meta'>
            <span>DATE: {date}</span>
            <span>ACCESS: {post.visibility.toUpperCase()}</span>
            {post.tags.length > 0 ? (
              <span>MATERIAL: {post.tags.join(' / ')}</span>
            ) : null}
          </div>
        </div>

        <Markdown content={post.contentMdx} />

        <div
          className='dwg'
          style={{
            color: 'var(--e-faint)',
            letterSpacing: '0.3em',
            margin: '44px 0 6px',
          }}
        >
          INSPECTION RECORD — 检验记录
        </div>
        <Comments
          key={post.slug}
          slug={post.slug}
          initialComments={data.comments.comments}
          initialHasMore={data.comments.hasMore}
          initialTotal={data.comments.total}
          sessionUser={data.sessionUser}
        />

        <div className='e-titleblock'>
          <span className='cell'>
            <b>{year}</b>
          </span>
          <span className='cell'>
            TITLE<b>{post.slug.slice(0, 12)}</b>
          </span>
          <span className='cell opt'>
            SCALE<b>1:1</b>
          </span>
          <span className='cell opt'>
            SHEET<b>DETAIL</b>
          </span>
        </div>
      </article>
    </div>
  );
}
