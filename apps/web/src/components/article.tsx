import type { CommentThread, SessionUser } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { Comments } from './comments.js';
import { Markdown } from './markdown.js';
import { Page, Prompt } from './page.js';
import { BODY_ENTER_DELAY_MS, ENTER, enterDelay } from './term.js';

// The title block rises in just ahead of the body.
const TITLE_DELAY_MS = 100;

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
      <Prompt user='perfectpan' host='blog' cwd='~/posts %' typed>
        cat {new Date(post.publishedAt).getFullYear()}/{post.slug}.md
      </Prompt>

      <div
        className={`mt-4 mb-6.5 ${ENTER}`}
        style={enterDelay(TITLE_DELAY_MS)}
      >
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
      <div className={ENTER} style={enterDelay(BODY_ENTER_DELAY_MS)}>
        <Markdown content={post.contentMdx} />
      </div>
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
