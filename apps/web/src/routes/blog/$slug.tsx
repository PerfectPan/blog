import { type CommentThread, canAccessVisibility } from '@blog/shared';
import {
  createFileRoute,
  Link,
  notFound,
  redirect,
} from '@tanstack/react-router';
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

  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~/posts %</span>{' '}
        <span className='th-cmd'>
          cat {new Date(post.publishedAt).getFullYear()}/{post.slug}.md
        </span>
      </div>

      <div className='th-art-head'>
        <h1 className='th-art-title'>{post.title}</h1>
        <div className='th-art-meta'>
          <span>{date}</span>
          <span>·</span>
          <span>{post.visibility}</span>
          {post.tags.length > 0 ? (
            <>
              <span>·</span>
              <span>#{post.tags.join(' #')}</span>
            </>
          ) : null}
        </div>
      </div>
      <Markdown content={post.contentMdx} />
      <div className='th-prompt mt-6'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~/posts %</span>{' '}
        <Link to='/blog' className='th-cmd th-cmd-dim'>
          cd ..
        </Link>
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
