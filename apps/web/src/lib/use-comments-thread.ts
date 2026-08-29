'use client';

import type { CommentThread } from '@blog/shared';
import { PAGE_SIZE } from '@blog/shared';
import { useState } from 'react';
import {
  createCommentServerFn,
  deleteCommentServerFn,
  getCommentsServerFn,
} from './comments-service.js';

type Initial = {
  comments: CommentThread[];
  hasMore: boolean;
  total: number;
};

/**
 * All comment-thread state and mutations, shared by the terminal and journal
 * skins. Only the presentation (Composer / CommentView markup) is
 * skin-specific; behavior lives here so a fix applies to both skins at once.
 */
export function useCommentsThread(slug: string, initial: Initial) {
  const [threads, setThreads] = useState<CommentThread[]>(initial.comments);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [total, setTotal] = useState(initial.total);
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
        data: { slug, body, parentId },
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

  return {
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
  };
}
