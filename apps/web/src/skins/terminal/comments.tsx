'use client';

import type { Comment, CommentThread, SessionUser } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { CommentMarkdown } from '../../components/comment-markdown.js';
import { formatRelative } from '../../lib/format.js';
import { useCommentsThread } from '../../lib/use-comments-thread.js';
import { btn, btnPrimary, roleBadge } from './prompt.js';

type CommentsProps = {
  slug: string;
  initialComments: CommentThread[];
  initialHasMore: boolean;
  initialTotal: number;
  sessionUser: SessionUser | null;
};

type ComposerProps = {
  placeholder: string;
  submitting: boolean;
  onSubmit: (body: string) => Promise<void>;
  compact?: boolean;
};

function Composer({
  placeholder,
  submitting,
  onSubmit,
  compact,
}: ComposerProps) {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const remaining = 2000 - body.length;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || submitting) {
      return;
    }
    setError(null);
    try {
      await onSubmit(trimmed);
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '评论失败，请重试');
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
      <textarea
        className='w-full resize-y rounded-md border border-line bg-panel px-3 py-2.5 font-mono text-[13.5px] text-ink focus:border-amber focus:outline-none max-[640px]:text-base'
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        maxLength={2000}
      />
      <div className='flex items-center justify-between gap-2'>
        <span className='text-xs text-faint'>
          {remaining < 200 ? `${remaining} 字剩余` : '支持 Markdown'}
          {error ? (
            <span className='text-[13.5px] text-red ml-2 inline before:content-["✗_"]'>
              {error}
            </span>
          ) : null}
        </span>
        <button
          type='submit'
          disabled={submitting || !body.trim()}
          className={btnPrimary}
        >
          {submitting ? '发送中…' : 'reply'}
        </button>
      </div>
    </form>
  );
}

type CommentItemProps = {
  thread: CommentThread;
  sessionUser: SessionUser | null;
  onReply: (parentId: string, body: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replySubmitting: Set<string>;
};

function CommentItem({
  thread,
  sessionUser,
  onReply,
  onDelete,
  replyingTo,
  setReplyingTo,
  replySubmitting,
}: CommentItemProps) {
  const canAct =
    sessionUser != null && (thread.isOwn || sessionUser.role === 'admin');

  async function handleDelete() {
    if (!canAct) {
      return;
    }
    if (!window.confirm('删除这条评论？')) {
      return;
    }
    // onDelete (the parent handleDelete) catches its own errors and surfaces
    // them via topError, so it does not throw — no swallow, no unhandled reject.
    await onDelete(thread.id);
  }

  return (
    <li className='flex flex-col gap-2'>
      <CommentView
        comment={thread}
        canAct={canAct}
        canReply={sessionUser != null}
        onReply={() =>
          setReplyingTo(replyingTo === thread.id ? null : thread.id)
        }
        onDelete={handleDelete}
      />

      {replyingTo === thread.id && sessionUser ? (
        <div className='ml-10'>
          <Composer
            placeholder={`回复 @${thread.author.name}…`}
            submitting={replySubmitting.has(thread.id)}
            onSubmit={(body) => onReply(thread.id, body)}
            compact
          />
        </div>
      ) : null}

      {thread.replies.length > 0 ? (
        <ul className='flex flex-col gap-3 border-t border-dashed border-line bg-sel px-3.5 py-2.5'>
          {thread.replies.map((reply) => {
            const replyCanAct =
              sessionUser != null &&
              (reply.isOwn || sessionUser.role === 'admin');
            return (
              <CommentView
                key={reply.id}
                comment={reply}
                canAct={replyCanAct}
                canReply={false}
                onReply={undefined}
                onDelete={async () => {
                  if (!window.confirm('删除这条回复？')) {
                    return;
                  }
                  await onDelete(reply.id);
                }}
              />
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}

type CommentViewProps = {
  comment: Comment;
  canAct: boolean;
  canReply?: boolean;
  onReply?: () => void;
  onDelete: () => void | Promise<void>;
};

function CommentView({
  comment,
  canAct,
  canReply,
  onReply,
  onDelete,
}: CommentViewProps) {
  return (
    <div className='my-3 overflow-hidden rounded-lg border border-line'>
      <div className='flex items-center gap-2.5 border-b border-line bg-panel px-3.5 py-2 text-[13px] text-dim'>
        <span className='text-ink'>{comment.author.name}</span>
        {comment.author.role === 'admin' ? (
          <span className={roleBadge}>AUTHOR</span>
        ) : null}
        {comment.status !== 'visible' ? (
          <span className='text-red'>{comment.status}</span>
        ) : null}
        <span>{formatRelative(comment.createdAt)}</span>
      </div>
      <div className='th-cmt-body px-3.5 py-2.5 [&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-3 [&_blockquote]:text-dim [&_p]:my-2 [&_p:last-child]:mb-0'>
        <CommentMarkdown content={comment.body} />
      </div>
      {canReply && onReply ? (
        <div className='flex gap-3.5 px-3.5 pb-2.5 text-xs'>
          <button
            type='button'
            onClick={onReply}
            className='cursor-pointer bg-none font-[inherit] text-dim hover:text-amber'
          >
            reply
          </button>
          {canAct ? (
            <button
              type='button'
              className='cursor-pointer bg-none font-[inherit] text-dim hover:text-red'
              onClick={() => onDelete()}
            >
              rm
            </button>
          ) : null}
        </div>
      ) : null}
      {!(canReply && onReply) && canAct ? (
        <div className='flex gap-3.5 px-3.5 pb-2.5 text-xs'>
          <button
            type='button'
            className='cursor-pointer bg-none font-[inherit] text-dim hover:text-red'
            onClick={() => onDelete()}
          >
            rm
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function TerminalComments({
  slug,
  initialComments,
  initialHasMore,
  initialTotal,
  sessionUser,
}: CommentsProps) {
  const {
    threads,
    hasMore,
    total,
    submitting,
    topError,
    loadingMore,
    replyingTo,
    setReplyingTo,
    replySubmitting,
    handleCreateTopLevel,
    handleReply,
    handleDelete,
    handleLoadMore,
  } = useCommentsThread(slug, {
    comments: initialComments,
    hasMore: initialHasMore,
    total: initialTotal,
  });

  return (
    <section className='mt-10'>
      <div className='mb-4 flex flex-wrap items-baseline gap-2.5'>
        <span className='text-amber'>~ %</span>{' '}
        <span className='text-ink'>comments --on {slug}</span>{' '}
        <span className='text-faint'>({total})</span>
      </div>

      {sessionUser ? (
        <div className='mb-6'>
          <Composer
            placeholder='写下你的评论…（支持 Markdown）'
            submitting={submitting}
            onSubmit={handleCreateTopLevel}
          />
        </div>
      ) : (
        <p className='mb-6 text-faint'>
          # <Link to='/login'>login</Link> 后即可评论。
        </p>
      )}

      {topError ? (
        <p className='mb-4 text-[13.5px] text-red before:content-["✗_"]'>
          {topError}
        </p>
      ) : null}

      {threads.length === 0 ? (
        <p className='py-8 text-center text-faint'># 还没有评论，来抢沙发。</p>
      ) : (
        <ul className='flex flex-col gap-3'>
          {threads.map((thread) => (
            <CommentItem
              key={thread.id}
              thread={thread}
              sessionUser={sessionUser}
              onReply={handleReply}
              onDelete={handleDelete}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replySubmitting={replySubmitting}
            />
          ))}
        </ul>
      )}

      {hasMore ? (
        <div className='mt-6 text-center'>
          <button
            type='button'
            onClick={handleLoadMore}
            disabled={loadingMore}
            className={btn}
          >
            {loadingMore ? '加载中…' : 'tail -f'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
