import type { CommentThread, SessionUser } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { Markdown } from '../../components/markdown.js';
import { JournalComments } from './comments.js';

const VIS_TEXT: Record<string, string> = {
  public: '',
  member: '会员可见',
  vip: 'VIP 可见',
  admin: '仅后台',
  password: '密码保护',
};

export function JournalArticle({
  post,
  comments,
  hasMoreComments,
  totalComments,
  sessionUser,
}: {
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
}) {
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className='j-sheet'>
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
        <Markdown content={post.contentMdx} skin='journal' />
        <div className='j-backlink'>
          <Link to='/blog'>← Back to blog</Link>
        </div>
      </article>
      <div className='j-letters'>
        <JournalComments
          key={post.slug}
          slug={post.slug}
          initialComments={comments}
          initialHasMore={hasMoreComments}
          initialTotal={totalComments}
          sessionUser={sessionUser}
        />
      </div>
    </div>
  );
}
