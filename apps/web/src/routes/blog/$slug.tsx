import { type CommentThread, canAccessVisibility } from '@blog/shared';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { Comments } from '../../components/comments.js';
import { Markdown } from '../../components/markdown.js';
import { getBlogPostServerFn } from '../../lib/blog-service.js';
import { getCommentsServerFn } from '../../lib/comments-service.js';
import { postIndex, tagColor } from '../../lib/post-index.js';

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
    <div className='c-page'>
      <div className='c-art'>
        <aside className='c-rail'>
          <div className='bigno'>
            №<b>{String(postIndex(post.publishedAt)).padStart(4, '0')}</b>
          </div>
          <dl>
            <dt>DATE</dt>
            <dd>{date}</dd>
            <dt>VISIBILITY</dt>
            <dd>{post.visibility.toUpperCase()}</dd>
            {post.tags.length > 0 ? (
              <>
                <dt>TAGS</dt>
                <dd className='flex flex-wrap gap-1.5 pt-1'>
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className='c-chip'
                      style={{ '--c-c': tagColor(tag) } as CSSProperties}
                    >
                      {tag}
                    </span>
                  ))}
                </dd>
              </>
            ) : null}
          </dl>
        </aside>
        <article>
          <div className='c-art-title'>
            <h1>{post.title}</h1>
            <div className='bar' />
          </div>
          <Markdown content={post.contentMdx} />
          <div className='c-cmt-head'>
            <h2>COMMENTS</h2>
            <span className='n'>{data.comments.total}</span>
          </div>
          <Comments
            key={post.slug}
            slug={post.slug}
            initialComments={data.comments.comments}
            initialHasMore={data.comments.hasMore}
            initialTotal={data.comments.total}
            sessionUser={data.sessionUser}
          />
        </article>
      </div>
    </div>
  );
}
