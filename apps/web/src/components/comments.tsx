'use client';

import type { CommentThread, SessionUser } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { createCommentServerFn, deleteCommentServerFn, getCommentsServerFn } from '../lib/comments-service.js';
import { Composer } from './comment-composer.js';
import { CommentItem } from './comment-item.js';
import { useT } from '../lib/i18n/context.js';
import {
  DELETE_FAILED,
  LOAD_MORE_FAILED,
  LOADING,
  LOGIN_HINT_SUFFIX,
  LOGIN_LINK,
  NEW_COMMENT_PLACEHOLDER,
  NO_COMMENTS,
  SUBMIT_COMMENT
} from '../lib/i18n/messages.js';
import { Prompt } from './prompt.js';

type CommentsProps = {
  slug: string;
  initialComments: CommentThread[];
  initialHasMore: boolean;
  initialTotal: number;
  sessionUser: SessionUser | null;
};

const PAGE_SIZE = 20;

export function Comments({ slug, initialComments, initialHasMore, initialTotal, sessionUser }: CommentsProps) {
  const t = useT();
  const [threads, setThreads] = useState<CommentThread[]>(initialComments);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [total, setTotal] = useState(initialTotal);
  const [submitting, setSubmitting] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replySubmitting, setReplySubmitting] = useState<Set<string>>(() => new Set());

  async function handleCreateTopLevel(body: string) {
    setSubmitting(true);
    try {
      const { comment } = await createCommentServerFn({
        data: { slug, body }
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
        data: { slug, body, parentId }
      });
      setThreads((prev) =>
        prev.map((thread) => (thread.id === parentId ? { ...thread, replies: [...thread.replies, comment] } : thread))
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
      setTopError(err instanceof Error ? err.message : t(DELETE_FAILED));
      return;
    }
    const wasTopLevel = threads.some((thread) => thread.id === id);
    setThreads((prev) =>
      prev
        .map((thread) => ({
          ...thread,
          replies: thread.replies.filter((reply) => reply.id !== id)
        }))
        .filter((thread) => thread.id !== id)
    );
    if (wasTopLevel) {
      setTotal((count) => Math.max(0, count - 1));
    }
  }

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const result = await getCommentsServerFn({
        data: { slug, offset: threads.length, limit: PAGE_SIZE }
      });
      setThreads((prev) => [...prev, ...result.comments]);
      setHasMore(result.hasMore);
      setTotal(result.total);
      setTopError(null);
    } catch (err) {
      setTopError(err instanceof Error ? err.message : t(LOAD_MORE_FAILED));
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className='mt-10'>
      <Prompt cwd='~ %' className='mb-4'>
        comments --on {slug}
      </Prompt>{' '}
      <span className='text-muted-foreground/60'>({total})</span>
      {sessionUser ? (
        <div className='mb-6'>
          <Composer
            placeholder={t(NEW_COMMENT_PLACEHOLDER)}
            submitLabel={t(SUBMIT_COMMENT)}
            submitting={submitting}
            onSubmit={handleCreateTopLevel}
          />
        </div>
      ) : (
        <p className='text-muted-foreground/60 mb-6'>
          # <Link to='/login'>{t(LOGIN_LINK)}</Link>
          {t(LOGIN_HINT_SUFFIX)}
        </p>
      )}
      {topError ? <p className='my-2.5 text-sm text-destructive mb-4'>{topError}</p> : null}
      {threads.length === 0 ? (
        <p className='text-muted-foreground/60 py-8 text-center'># {t(NO_COMMENTS)}</p>
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
            className='cursor-pointer rounded-lg border border-border bg-secondary px-3.5 py-1.75 text-sm text-foreground transition-[border-color,color] duration-100 hover:border-primary hover:text-primary'
          >
            {loadingMore ? t(LOADING) : 'tail -f'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
