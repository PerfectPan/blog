import type { Comment, CommentStatus } from '@blog/shared';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { CommentMarkdown } from '../../components/comment-markdown.js';
import {
  deleteCommentServerFn,
  listCommentsServerFn,
  setCommentStatusServerFn,
} from '../../lib/comments-service.js';

export const Route = createFileRoute('/admin/comments')({
  head: () => ({ meta: [{ title: 'Admin · 评论审核' }] }),
  // listCommentsServerFn calls requireAdmin() internally, so non-admins are
  // bounced away (to /login or /) before this page renders.
  loader: async () => listCommentsServerFn({ data: {} }),
  component: AdminCommentsPage,
});

type StatusFilter = CommentStatus | 'all';

const STATUS_FILTERS: StatusFilter[] = ['all', 'visible', 'hidden', 'spam'];
const STATUS_LABEL: Record<StatusFilter, string> = {
  all: '全部',
  visible: '可见',
  hidden: '隐藏',
  spam: '垃圾',
};

const STATUS_BADGE: Record<CommentStatus, string> = {
  visible:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  hidden: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300',
  spam: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

function AdminCommentsPage() {
  const { comments: initial } = Route.useLoaderData();
  const [comments, setComments] = useState<Comment[]>(initial);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [slugQuery, setSlugQuery] = useState('');
  const [busy, setBusy] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = slugQuery.trim().toLowerCase();
    return comments.filter((comment) => {
      if (statusFilter !== 'all' && comment.status !== statusFilter) {
        return false;
      }
      if (needle && !comment.slug.toLowerCase().includes(needle)) {
        return false;
      }
      return true;
    });
  }, [comments, statusFilter, slugQuery]);

  async function setStatus(id: string, status: CommentStatus) {
    setError(null);
    setBusy((prev) => new Set(prev).add(id));
    try {
      await setCommentStatusServerFn({ data: { id, status } });
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === id ? { ...comment, status } : comment,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请重试');
    } finally {
      setBusy((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function remove(id: string) {
    if (!window.confirm('永久删除这条评论？此操作不可恢复。')) {
      return;
    }
    setError(null);
    setBusy((prev) => new Set(prev).add(id));
    try {
      await deleteCommentServerFn({ data: { id } });
      setComments((prev) => prev.filter((comment) => comment.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败，请重试');
    } finally {
      setBusy((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className='mx-auto w-full max-w-5xl pt-24 lg:pt-28'>
      <Link
        to='/admin'
        className='mb-4 inline-block text-sm opacity-60 hover:opacity-100'
      >
        ← 返回管理
      </Link>
      <h1 className='mb-4 text-2xl font-black'>评论审核</h1>

      <div className='mb-4 flex flex-wrap items-center gap-2'>
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            type='button'
            onClick={() => setStatusFilter(filter)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              statusFilter === filter
                ? 'bg-black text-white dark:bg-neutral-900'
                : 'bg-black/[0.04] opacity-70 hover:opacity-100 dark:bg-white/[0.06]'
            }`}
          >
            {STATUS_LABEL[filter]}
          </button>
        ))}
        <input
          type='search'
          value={slugQuery}
          onChange={(event) => setSlugQuery(event.target.value)}
          placeholder='按 slug 筛选…'
          className='ml-auto w-48 rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-xs outline-none focus:border-zinc-400 dark:border-zinc-600'
        />
      </div>

      {error ? <p className='mb-3 text-sm text-red-500'>{error}</p> : null}

      {filtered.length === 0 ? (
        <div className='rounded-lg border border-dashed border-slate-300 px-6 py-16 text-center text-sm opacity-70 dark:border-slate-700'>
          没有符合条件的评论。
        </div>
      ) : (
        <ul className='flex flex-col gap-3'>
          {filtered.map((comment) => (
            <li
              key={comment.id}
              className='rounded-lg border border-slate-200 p-4 dark:border-slate-700'
            >
              <div className='mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs'>
                <span className='font-semibold'>{comment.author.name}</span>
                {comment.author.role === 'admin' ? (
                  <span className='rounded bg-zinc-900 px-1 py-0.5 text-[10px] font-semibold text-white dark:bg-white dark:text-zinc-900'>
                    Author
                  </span>
                ) : null}
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[comment.status]}`}
                >
                  {STATUS_LABEL[comment.status]}
                </span>
                <Link
                  to='/blog/$slug'
                  params={{ slug: comment.slug }}
                  className='opacity-60 hover:opacity-100'
                >
                  /blog/{comment.slug}
                </Link>
                <span className='opacity-50'>
                  {new Date(comment.createdAt).toLocaleString('en-US')}
                </span>
              </div>
              <CommentMarkdown content={comment.body} />
              <div className='mt-3 flex flex-wrap gap-3 text-xs'>
                {comment.status !== 'hidden' ? (
                  <button
                    type='button'
                    disabled={busy.has(comment.id)}
                    onClick={() => setStatus(comment.id, 'hidden')}
                    className='opacity-70 hover:opacity-100 disabled:opacity-40'
                  >
                    隐藏
                  </button>
                ) : null}
                {comment.status !== 'spam' ? (
                  <button
                    type='button'
                    disabled={busy.has(comment.id)}
                    onClick={() => setStatus(comment.id, 'spam')}
                    className='text-amber-600/80 hover:text-amber-600 disabled:opacity-40'
                  >
                    标垃圾
                  </button>
                ) : null}
                {comment.status !== 'visible' ? (
                  <button
                    type='button'
                    disabled={busy.has(comment.id)}
                    onClick={() => setStatus(comment.id, 'visible')}
                    className='text-emerald-600/80 hover:text-emerald-600 disabled:opacity-40'
                  >
                    恢复
                  </button>
                ) : null}
                <button
                  type='button'
                  disabled={busy.has(comment.id)}
                  onClick={() => remove(comment.id)}
                  className='ml-auto text-red-500/70 hover:text-red-500 disabled:opacity-40'
                >
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
