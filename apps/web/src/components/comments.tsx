'use client';

import type { Comment, CommentThread, SessionUser } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import {
  createCommentServerFn,
  deleteCommentServerFn,
  getCommentsServerFn,
} from '../lib/comments-service.js';
import { CommentMarkdown } from './comment-markdown.js';

type CommentsProps = {
  slug: string;
  initialComments: CommentThread[];
  initialHasMore: boolean;
  sessionUser: SessionUser | null;
};

const PAGE_SIZE = 20;

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '?';
  }
  return trimmed.slice(0, 1).toUpperCase();
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return iso;
  }
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) {
    return '刚刚';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} 分钟前`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} 小时前`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} 天前`;
  }
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        loading='lazy'
        className='h-8 w-8 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800'
      />
    );
  }
  return (
    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'>
      {getInitials(name)}
    </div>
  );
}

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
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        maxLength={2000}
        className='w-full resize-y rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-400 dark:border-zinc-600 dark:focus:border-zinc-400'
      />
      <div className='flex items-center justify-between gap-2'>
        <span className='text-xs opacity-50'>
          {remaining < 200 ? `${remaining} 字剩余` : '支持 Markdown'}
          {error ? <span className='ml-2 text-red-500'>{error}</span> : null}
        </span>
        <button
          type='submit'
          disabled={submitting || !body.trim()}
          className='rounded-md bg-black px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-900'
        >
          {submitting ? '发送中…' : '发送'}
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
  replySubmitting: string | null;
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
    try {
      await onDelete(thread.id);
    } catch {
      // deletion errors are surfaced by the parent; swallow the re-throw here
    }
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
            submitting={replySubmitting === thread.id}
            onSubmit={(body) => onReply(thread.id, body)}
            compact
          />
        </div>
      ) : null}

      {thread.replies.length > 0 ? (
        <ul className='ml-10 flex flex-col gap-2 border-l border-zinc-200 pl-4 dark:border-zinc-700'>
          {thread.replies.map((reply) => {
            const replyCanAct =
              sessionUser != null &&
              (reply.isOwn || sessionUser.role === 'admin');
            return (
              <CommentView
                key={reply.id}
                comment={reply}
                canAct={replyCanAct}
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
    <div className='flex gap-3'>
      <Avatar name={comment.author.name} image={comment.author.image} />
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
          <span className='text-sm font-semibold'>{comment.author.name}</span>
          {comment.author.role === 'admin' ? (
            <span className='rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold text-white dark:bg-white dark:text-zinc-900'>
              Author
            </span>
          ) : null}
          {comment.status !== 'visible' ? (
            <span className='rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'>
              {comment.status}
            </span>
          ) : null}
          <span className='text-xs opacity-50'>
            {formatRelative(comment.createdAt)}
          </span>
        </div>
        <div className='mt-1'>
          <CommentMarkdown content={comment.body} />
        </div>
        <div className='mt-1 flex gap-3 text-xs'>
          {canReply && onReply ? (
            <button
              type='button'
              onClick={onReply}
              className='opacity-50 transition-opacity hover:opacity-100'
            >
              回复
            </button>
          ) : null}
          {canAct ? (
            <button
              type='button'
              onClick={() => onDelete()}
              className='text-red-500/70 transition-colors hover:text-red-500'
            >
              删除
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function Comments({
  slug,
  initialComments,
  initialHasMore,
  sessionUser,
}: CommentsProps) {
  const [threads, setThreads] = useState<CommentThread[]>(initialComments);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [submitting, setSubmitting] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replySubmitting, setReplySubmitting] = useState<string | null>(null);

  const totalCount = useMemo(
    () => threads.reduce((sum, t) => sum + 1 + t.replies.length, 0),
    [threads],
  );

  async function handleCreateTopLevel(body: string) {
    setSubmitting(true);
    try {
      const { comment } = await createCommentServerFn({
        data: { slug, body },
      });
      // Newest-first: a fresh top-level comment goes to the front.
      setThreads((prev) => [{ ...comment, replies: [] }, ...prev]);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string, body: string) {
    setReplySubmitting(parentId);
    try {
      const { comment } = await createCommentServerFn({
        data: { slug, parentId, body },
      });
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === parentId
            ? { ...thread, replies: [...thread.replies, comment] }
            : thread,
        ),
      );
      setReplyingTo(null);
    } finally {
      setReplySubmitting(null);
    }
  }

  async function handleDelete(id: string) {
    await deleteCommentServerFn({ data: { id } });
    setThreads((prev) =>
      prev
        .map((thread) => ({
          ...thread,
          replies: thread.replies.filter((reply) => reply.id !== id),
        }))
        .filter((thread) => thread.id !== id),
    );
  }

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const result = await getCommentsServerFn({
        data: { slug, offset: threads.length, limit: PAGE_SIZE },
      });
      setThreads((prev) => [...prev, ...result.comments]);
      setHasMore(result.hasMore);
    } catch (err) {
      setTopError(err instanceof Error ? err.message : '加载更多失败');
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className='mt-12'>
      <h2 className='mb-4 text-lg font-black'>
        评论{' '}
        {totalCount > 0 ? (
          <span className='opacity-50'>({totalCount})</span>
        ) : null}
      </h2>

      {sessionUser ? (
        <div className='mb-6'>
          <Composer
            placeholder='写下你的评论…（支持 Markdown）'
            submitting={submitting}
            onSubmit={async (body) => {
              setTopError(null);
              try {
                await handleCreateTopLevel(body);
              } catch (err) {
                setTopError(err instanceof Error ? err.message : '评论失败');
                throw err;
              }
            }}
          />
        </div>
      ) : (
        <p className='mb-6 text-sm opacity-60'>
          <Link to='/login' className='underline hover:opacity-100'>
            登录
          </Link>{' '}
          后即可评论。
        </p>
      )}

      {topError ? (
        <p className='mb-4 text-sm text-red-500'>{topError}</p>
      ) : null}

      {threads.length === 0 ? (
        <p className='py-8 text-center text-sm opacity-50'>
          还没有评论，来抢沙发。
        </p>
      ) : (
        <ul className='flex flex-col gap-5'>
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
            className='text-sm opacity-60 transition-opacity hover:opacity-100 disabled:opacity-40'
          >
            {loadingMore ? '加载中…' : '加载更多'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
