import type { CommentThread, SessionUser } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { Comments } from './comments.js';
import { Markdown } from './markdown.js';
import { Page, Prompt } from './page.js';

type ArticlePageProps = {
  post: {
    slug: string;
    title: string;
    contentMdx: string;
    publishedAt: string;
    visibility: string;
    tags: string[];
  };
  comments: CommentThread[];
  hasMoreComments: boolean;
  totalComments: number;
  sessionUser: SessionUser | null;
};

export function ArticlePage({
  post,
  comments,
  hasMoreComments,
  totalComments,
  sessionUser,
}: ArticlePageProps) {
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Page>
      <Prompt user='perfectpan' host='blog' cwd='~/posts %'>
        cat {new Date(post.publishedAt).getFullYear()}/{post.slug}.md
      </Prompt>

      <div className='mt-4 mb-6.5'>
        <h1 className='text-3xl font-bold text-foreground'>{post.title}</h1>
        <div className='mt-1.5 flex flex-wrap gap-4 text-xs text-muted-foreground'>
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
      <Prompt cwd='~/posts %' className='mt-6'>
        <Link
          to='/blog'
          activeOptions={{ exact: true }}
          className='text-muted-foreground hover:text-primary'
        >
          cd ..
        </Link>
      </Prompt>
      <Comments
        key={post.slug}
        slug={post.slug}
        initialComments={comments}
        initialHasMore={hasMoreComments}
        initialTotal={totalComments}
        sessionUser={sessionUser}
      />
    </Page>
  );
}
