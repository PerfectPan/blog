import type { CommentThread, SessionUser } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { Markdown } from '../../components/markdown.js';
import { TerminalComments } from './comments.js';
import { Page } from './page.js';

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
      <Markdown content={post.contentMdx} skin='terminal' />
      <div className='th-prompt mt-6'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~/posts %</span>{' '}
        <Link
          to='/blog'
          activeOptions={{ exact: true }}
          className='th-cmd th-cmd-dim'
        >
          cd ..
        </Link>
      </div>
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
