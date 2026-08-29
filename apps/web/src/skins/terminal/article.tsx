import type { CommentThread, SessionUser } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { Markdown } from '../../components/markdown.js';
import { TerminalComments } from './comments.js';
import { Page, Prompt } from './prompt.js';

type TerminalArticleProps = {
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

export function TerminalArticle({
  post,
  comments,
  hasMoreComments,
  totalComments,
  sessionUser,
}: TerminalArticleProps) {
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Page>
      <Prompt path='~/posts %'>
        cat {new Date(post.publishedAt).getFullYear()}/{post.slug}.md
      </Prompt>

      <div className='mb-[26px] mt-4'>
        <h1 className='text-2xl font-bold leading-[1.4] text-heading'>
          {post.title}
        </h1>
        <div className='mt-1.5 flex flex-wrap gap-4 text-[13px] text-dim'>
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
      <Markdown content={post.contentMdx} skin='terminal' />
      <Prompt path='~/posts %' className='mt-6'>
        <Link to='/blog' className='text-dim hover:text-ink hover:no-underline'>
          {' '}
          cd ..{' '}
        </Link>
      </Prompt>
      <TerminalComments
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
