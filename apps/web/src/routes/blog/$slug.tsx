import { type CommentThread, canAccessVisibility } from '@blog/shared';
import { createFileRoute, getRouteApi, notFound, redirect } from '@tanstack/react-router';
import { ArticlePage } from '../../components/article.js';
import { getBlogPostServerFn } from '../../lib/blog-service.js';
import { getCommentsServerFn } from '../../lib/comments-service.js';
import { KATEX_CSS_HREF } from '../../lib/katex-css.js';

const routeApi = getRouteApi('/blog/$slug');

function BlogDetailPage() {
  const data = routeApi.useLoaderData();
  const post = data.post;
  // Defense-in-depth: loader data is any-typed here, so the type system
  // cannot prove post non-null even though the loader throws notFound().
  // oxlint-disable-next-line no-unnecessary-condition
  if (!post) {
    return null;
  }

  return (
    <ArticlePage
      post={{
        slug: post.slug,
        title: post.title,
        contentHtml: data.contentHtml,
        publishedAt: post.publishedAt,
        visibility: post.visibility,
        tags: post.tags
      }}
      comments={data.comments.comments}
      hasMoreComments={data.comments.hasMore}
      totalComments={data.comments.total}
      sessionUser={data.sessionUser}
    />
  );
}

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
        params: { slug: params.slug }
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
      hasMore: false
    };
    try {
      comments = await getCommentsServerFn({
        data: { slug: params.slug, offset: 0, limit: 20 }
      });
    } catch (error) {
      console.error('[web] comments SSR failed, rendering without comments', error);
    }

    return { ...data, comments };
  },
  // KaTeX CSS is linked only when the rendered body actually contains math,
  // so code-only posts don't pay for it.
  head: ({ loaderData }) => ({
    meta: [{ title: "Blog | PerfectPan's Blog" }],
    links: loaderData?.hasKatex ? [{ rel: 'stylesheet', href: KATEX_CSS_HREF }] : []
  }),
  component: BlogDetailPage
});
