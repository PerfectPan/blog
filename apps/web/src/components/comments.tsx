'use client';

import type { Comment, CommentThread, SessionUser } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
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
  initialTotal: number;
  sessionUser: SessionUser | null;
};

const PAGE_SIZE = 20;

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
    <form onSubmit={handleSubmit} className='z-cmt-form'>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        maxLength={2000}
      />
      <div className='z-cmt-foot'>
        <span className='z-hint'>
          {remaining < 200
            ? `${remaining} 字剩余`
            : '静かに一言どうぞ（Markdown 可）'}
          {error ? <span className='err'>{error}</span> : null}
        </span>
        <button
          type='submit'
          disabled={submitting || !body.trim()}
          className='z-btn z-btn-fill'
        >
          {submitting ? '投递中…' : '投　稿'}
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
        <ul className='ml-10 flex flex-col'>
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
    <div className={comment.parentId !== null ? 'z-cmt reply' : 'z-cmt'}>
      <div className='z-cmt-h'>
        <span className='who'>{comment.author.name}</span>
        {comment.author.role === 'admin' ? <span>・ 作者</span> : null}
        {comment.status !== 'visible' ? <span>・ {comment.status}</span> : null}
        <span> ・ {formatRelative(comment.createdAt)}</span>
      </div>
      <CommentMarkdown content={comment.body} />
      {(canReply && onReply) || canAct ? (
        <div className='z-cmt-ops'>
          {canReply && onReply ? (
            <button type='button' onClick={onReply}>
              返信
            </button>
          ) : null}
          {canAct ? (
            <button type='button' onClick={() => onDelete()}>
              削除
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function Comments({
  slug,
  initialComments,
  initialHasMore,
  initialTotal,
  sessionUser,
}: CommentsProps) {
  const [threads, setThreads] = useState<CommentThread[]>(initialComments);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [total, setTotal] = useState(initialTotal);
  const [submitting, setSubmitting] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replySubmitting, setReplySubmitting] = useState<Set<string>>(
    () => new Set(),
  );

  async function handleCreateTopLevel(body: string) {
    setSubmitting(true);
    try {
      const { comment } = await createCommentServerFn({
        data: { slug, body },
      });
      // Newest-first: a fresh top-level comment goes to the front.
      setThreads((prev) => [{ ...comment, replies: [] }, ...prev]);
      setTotal((count) => count + 1);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string, body: string) {
    setReplySubmitting((prev) => new Set(prev).add(parentId));
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
      setReplySubmitting((prev) => {
        const next = new Set(prev);
        next.delete(parentId);
        return next;
      });
    }
  }

  async function handleDelete(id: string) {
    setTopError(null);
    try {
      await deleteCommentServerFn({ data: { id } });
    } catch (err) {
      setTopError(err instanceof Error ? err.message : '删除失败，请重试');
      return;
    }
    const wasTopLevel = threads.some((thread) => thread.id === id);
    setThreads((prev) =>
      prev
        .map((thread) => ({
          ...thread,
          replies: thread.replies.filter((reply) => reply.id !== id),
        }))
        .filter((thread) => thread.id !== id),
    );
    if (wasTopLevel) {
      setTotal((count) => Math.max(0, count - 1));
    }
  }

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const result = await getCommentsServerFn({
        data: { slug, offset: threads.length, limit: PAGE_SIZE },
      });
      setThreads((prev) => [...prev, ...result.comments]);
      setHasMore(result.hasMore);
      setTotal(result.total);
      setTopError(null);
    } catch (err) {
      setTopError(err instanceof Error ? err.message : '加载更多失败');
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className='mt-2'>
      <div className='z-label'>読 者 の 声 {total > 0 ? `(${total})` : ''}</div>

      {sessionUser ? (
        <div className='mb-6'>
          <Composer
            placeholder='写下你的评论…（支持 Markdown）'
            submitting={submitting}
            onSubmit={handleCreateTopLevel}
          />
        </div>
      ) : (
        <p className='z-hint mb-6'>
          <Link to='/login' className='z-link'>
            登録
          </Link>{' '}
          後にコメントできます。
        </p>
      )}

      {topError ? <p className='z-err mb-4'>{topError}</p> : null}

      {threads.length === 0 ? (
        <p className='z-hint py-8 text-center'>まだコメントはありません。</p>
      ) : (
        <ul className='flex flex-col'>
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
            className='z-btn'
          >
            {loadingMore ? '読み込み中…' : 'もっと見る'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
