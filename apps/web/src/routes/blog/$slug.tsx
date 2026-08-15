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

const VIS_TEXT: Record<string, string> = {
  public: '',
  member: '会员可见',
  vip: 'VIP 可见',
  admin: '仅后台',
  password: '密码保护',
};

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
    <div className='j-sheet'>
      <aside className='j-spine' aria-hidden='true'>
        PerfectPan's Blog · {post.slug}
      </aside>
      <article className='j-article'>
        <h1 className='j-entry-title'>{post.title}</h1>
        <p className='j-entry-meta'>
          <span>{date}</span>
          {post.visibility !== 'public' ? (
            <span> · {VIS_TEXT[post.visibility]}</span>
          ) : null}
          {post.tags.length > 0 ? (
            <span> · {post.tags.join(' / ')}</span>
          ) : null}
        </p>
        <Markdown content={post.contentMdx} />
        <div className='j-backlink'>
          <Link to='/blog'>← Back to blog</Link>
        </div>
      </article>
      <div className='j-letters'>
        <Comments
          key={post.slug}
          slug={post.slug}
          initialComments={data.comments.comments}
          initialHasMore={data.comments.hasMore}
          initialTotal={data.comments.total}
          sessionUser={data.sessionUser}
        />
      </div>
    </div>
  );
}
