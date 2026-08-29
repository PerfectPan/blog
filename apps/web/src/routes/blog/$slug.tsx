import { type CommentThread, canAccessVisibility } from '@blog/shared';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { getBlogPostServerFn } from '../../lib/blog-service.js';
import { getCommentsServerFn } from '../../lib/comments-service.js';
import { useSkin } from '../../skins/context.js';
import { JournalArticle } from '../../skins/journal/article.js';
import { TerminalArticle } from '../../skins/terminal/article.js';

export const Route = createFileRoute('/blog/$slug')({
  head: ({ match }) => {
    // The router's own head-time typing resolves this route's loaderData to
    // `never`; at runtime the match always carries the awaited loader result.
    const post = (match.loaderData as { post?: { title: string } } | undefined)
      ?.post;
    return {
      meta: [
        {
          title: post
            ? `${post.title} | PerfectPan's Blog`
            : "Blog | PerfectPan's Blog",
        },
      ],
    };
  },
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
  const { skin } = useSkin();
  const post = data.post;
  if (!post) {
    return null;
  }

  if (skin === 'journal') {
    return (
      <JournalArticle
        post={post}
        comments={data.comments.comments}
        hasMoreComments={data.comments.hasMore}
        totalComments={data.comments.total}
        sessionUser={data.sessionUser}
      />
    );
  }
  return (
    <TerminalArticle
      post={post}
      comments={data.comments.comments}
      hasMoreComments={data.comments.hasMore}
      totalComments={data.comments.total}
      sessionUser={data.sessionUser}
    />
  );
}
