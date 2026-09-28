'use client';

import type { Comment, CommentThread, SessionUser } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import {
  Bold,
  Code,
  Italic,
  Link as LinkIcon,
  List,
  Quote,
} from 'lucide-react';
import {
  type ReactNode,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';
import { authClient } from '../lib/auth-client.js';
import {
  createCommentServerFn,
  deleteCommentServerFn,
  getCommentsServerFn,
} from '../lib/comments-service.js';
import { type TFn, useT } from '../lib/i18n/context.js';
import {
  CHARS_LEFT,
  CODE_PLACEHOLDER,
  COMMENT_FAILED,
  DAYS_AGO,
  DELETE_ACTION,
  DELETE_COMMENT_CONFIRM,
  DELETE_FAILED,
  DELETE_REPLY_CONFIRM,
  EDITOR_PREVIEW,
  EDITOR_WRITE,
  HOURS_AGO,
  JUST_NOW,
  LINK_TEXT_PLACEHOLDER,
  LOAD_MORE_FAILED,
  LOADING,
  LOGIN_HINT_SUFFIX,
  LOGIN_LINK,
  MINUTES_AGO,
  NEW_COMMENT_PLACEHOLDER,
  NO_COMMENTS,
  PREVIEW_EMPTY,
  REPLY_ACTION,
  REPLY_PLACEHOLDER,
  SENDING,
  SUBMIT_COMMENT,
  TEXT_PLACEHOLDER,
  TOOLBAR_BOLD,
  TOOLBAR_CODE,
  TOOLBAR_ITALIC,
  TOOLBAR_LINK,
  TOOLBAR_LIST,
  TOOLBAR_QUOTE,
} from '../lib/i18n/messages.js';
import { CommentMarkdown } from './comment-markdown.js';
import { Prompt } from './page.js';

type CommentsProps = {
  slug: string;
  initialComments: CommentThread[];
  initialHasMore: boolean;
  initialTotal: number;
  sessionUser: SessionUser | null;
};

const PAGE_SIZE = 20;

/** Client mirror of the server-side comment body cap (comments-service). */
const COMMENT_BODY_MAX = 2000;

/** Shared class of the per-comment action row (reply / delete). */
const ACTION_ROW =
  'flex gap-3.5 px-3.5 pb-2.5 text-xs [&_button]:cursor-pointer [&_button]:bg-none [&_button]:text-muted-foreground [&_button:hover]:text-primary';

function formatRelative(iso: string, t: TFn): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return iso;
  }
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) {
    return t(JUST_NOW);
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return t(MINUTES_AGO, { n: minutes });
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t(HOURS_AGO, { n: hours });
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return t(DAYS_AGO, { n: days });
  }
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type ComposerProps = {
  placeholder: string;
  /** Idle label of the submit button — `send` for new comments, `reply` for replies. */
  submitLabel: string;
  submitting: boolean;
  onSubmit: (body: string) => Promise<void>;
  compact?: boolean;
};

function Composer({
  placeholder,
  submitLabel,
  submitting,
  onSubmit,
  compact,
}: ComposerProps) {
  const t = useT();
  // Same shared better-auth session store the header chip reads; name shows
  // once it resolves (the `sessionUser` prop that gates this component has no
  // display name on it).
  const { data: sessionData } = authClient.useSession();
  const displayName = sessionData?.user.name;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remaining = COMMENT_BODY_MAX - body.length;
  // No shiki here, but re-rendering markdown per keystroke is still wasteful —
  // keep the preview a tick behind the typed text (same as the admin editor).
  const previewContent = useDeferredValue(body);
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);

  // Restore the caret/selection after a toolbar action mutates the value.
  useEffect(() => {
    const el = textareaRef.current;
    const next = pendingSelection.current;
    if (!el || !next) {
      return;
    }
    el.focus();
    el.setSelectionRange(next.start, next.end);
    pendingSelection.current = null;
  });

  /** Wrap the current selection with `before`/`after`, inserting `emptyText`
   *  when nothing is selected. */
  function wrap(before: string, after: string, emptyText: string) {
    const el = textareaRef.current;
    if (!el) {
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.slice(start, end) || emptyText;
    const next =
      body.slice(0, start) + before + selected + after + body.slice(end);
    setBody(next);
    const selStart = start + before.length;
    pendingSelection.current = {
      start: selStart,
      end: selStart + selected.length,
    };
  }

  /** Prefix every line touched by the current selection (toggles the prefix). */
  function prefixLines(prefix: string) {
    const el = textareaRef.current;
    if (!el) {
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const lineStart = body.lastIndexOf('\n', start - 1) + 1;
    const block = body.slice(lineStart, end);
    const allPrefixed = block
      .split('\n')
      .every((line) => line.startsWith(prefix) || line === '');
    const newBlock = block
      .split('\n')
      .map((line) =>
        allPrefixed
          ? line.slice(prefix.length)
          : line.startsWith(prefix)
            ? line
            : prefix + line,
      )
      .join('\n');
    setBody(body.slice(0, lineStart) + newBlock + body.slice(end));
    pendingSelection.current = {
      start: lineStart,
      end: lineStart + newBlock.length,
    };
  }

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
      setError(err instanceof Error ? err.message : t(COMMENT_FAILED));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='my-3 overflow-hidden rounded-lg border border-border flex flex-col transition-[border-color] duration-100 focus-within:border-primary'
    >
      <div className='flex items-center gap-0.5 border-b border-border bg-secondary px-2 py-1.5'>
        {displayName ? (
          <span className='mr-1.5 min-w-0 max-w-[16ch] truncate text-xs text-foreground max-sm:hidden'>
            {displayName}
          </span>
        ) : null}
        {/* Toolbar edits the textarea via ref — meaningless in preview mode
            (unmounted), so it only renders while writing. */}
        {!preview ? (
          <>
            <ToolButton
              label={t(TOOLBAR_BOLD)}
              onClick={() => wrap('**', '**', t(TEXT_PLACEHOLDER))}
            >
              <Bold size={14} />
            </ToolButton>
            <ToolButton
              label={t(TOOLBAR_ITALIC)}
              onClick={() => wrap('*', '*', t(TEXT_PLACEHOLDER))}
            >
              <Italic size={14} />
            </ToolButton>
            <Divider />
            <ToolButton
              label={t(TOOLBAR_QUOTE)}
              onClick={() => prefixLines('> ')}
            >
              <Quote size={14} />
            </ToolButton>
            <ToolButton
              label={t(TOOLBAR_LIST)}
              onClick={() => prefixLines('- ')}
            >
              <List size={14} />
            </ToolButton>
            <ToolButton
              label={t(TOOLBAR_CODE)}
              onClick={() => wrap('`', '`', t(CODE_PLACEHOLDER))}
            >
              <Code size={14} />
            </ToolButton>
            <ToolButton
              label={t(TOOLBAR_LINK)}
              onClick={() => wrap('[', '](https://)', t(LINK_TEXT_PLACEHOLDER))}
            >
              <LinkIcon size={14} />
            </ToolButton>
          </>
        ) : null}
        <div className='ml-auto flex items-center gap-1'>
          <ModeButton active={!preview} onClick={() => setPreview(false)}>
            {t(EDITOR_WRITE)}
          </ModeButton>
          <ModeButton active={preview} onClick={() => setPreview(true)}>
            {t(EDITOR_PREVIEW)}
          </ModeButton>
        </div>
      </div>
      {preview ? (
        <div
          className={`overflow-auto px-3.5 py-2.5 ${compact ? 'min-h-16' : 'min-h-21'}`}
        >
          {body.trim() ? (
            <CommentMarkdown content={previewContent} />
          ) : (
            <p className='text-muted-foreground/60'># {t(PREVIEW_EMPTY)}</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={placeholder}
          rows={compact ? 2 : 3}
          maxLength={COMMENT_BODY_MAX}
          className='w-full resize-none bg-transparent px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60'
        />
      )}
      <div className='flex items-center justify-between gap-2 px-3.5 pb-2.5'>
        <span className='flex flex-col gap-1 text-xs text-muted-foreground/60'>
          {remaining < 200 ? t(CHARS_LEFT, { n: remaining }) : null}
          {error ? (
            <span className='text-sm text-destructive'>
              {'✗ '}
              {error}
            </span>
          ) : null}
        </span>
        <button
          type='submit'
          disabled={submitting || !body.trim()}
          className='cursor-pointer rounded-lg border border-primary bg-primary px-3.5 py-1.75 text-sm text-primary-foreground transition duration-100 hover:brightness-95'
        >
          {submitting ? t(SENDING) : submitLabel}
        </button>
      </div>
    </form>
  );
}

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      title={label}
      aria-label={label}
      onClick={onClick}
      className='flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:text-primary'
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className='mx-1 h-4 w-px bg-border' />;
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-primary'
      }`}
    >
      {children}
    </button>
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
  const t = useT();
  const canAct =
    sessionUser != null && (thread.isOwn || sessionUser.role === 'admin');
  const showReplyBox = sessionUser != null && replyingTo === thread.id;

  async function handleDelete() {
    if (!canAct) {
      return;
    }
    if (!window.confirm(t(DELETE_COMMENT_CONFIRM))) {
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

      {/* Replies and the open reply box hang off one continuous thread line
          (no background slab — the cards themselves carry the chrome). */}
      {showReplyBox || thread.replies.length > 0 ? (
        <div className='ml-10 flex flex-col gap-3 border-l border-border pl-3.5'>
          {showReplyBox ? (
            <Composer
              placeholder={t(REPLY_PLACEHOLDER, { name: thread.author.name })}
              submitLabel={t(REPLY_ACTION)}
              submitting={replySubmitting.has(thread.id)}
              onSubmit={(body) => onReply(thread.id, body)}
              compact
            />
          ) : null}
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
                  if (!window.confirm(t(DELETE_REPLY_CONFIRM))) {
                    return;
                  }
                  await onDelete(reply.id);
                }}
              />
            );
          })}
        </div>
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
  const t = useT();
  return (
    <div className='my-3 overflow-hidden rounded-lg border border-border'>
      <div className='flex items-center gap-2.5 border-b border-border bg-secondary px-3.5 py-2 text-xs text-muted-foreground'>
        <span className='text-foreground'>{comment.author.name}</span>
        {comment.author.role === 'admin' ? (
          <span className='rounded-full bg-primary px-1.75 py-px text-xs font-bold leading-normal text-primary-foreground'>
            AUTHOR
          </span>
        ) : null}
        {comment.status !== 'visible' ? (
          <span className='rounded-sm border border-current px-1.5 text-xs font-bold leading-relaxed tracking-wide text-muted-foreground'>
            {comment.status}
          </span>
        ) : null}
        <span>{formatRelative(comment.createdAt, t)}</span>
      </div>
      <div className='px-3.5 py-2.5'>
        <CommentMarkdown content={comment.body} />
      </div>
      {canReply && onReply ? (
        <div className={ACTION_ROW}>
          <button type='button' onClick={onReply}>
            {t(REPLY_ACTION)}
          </button>
          {canAct ? (
            <button
              type='button'
              className='hover:text-destructive!'
              onClick={() => onDelete()}
            >
              {t(DELETE_ACTION)}
            </button>
          ) : null}
        </div>
      ) : canAct ? (
        <div className={ACTION_ROW}>
          <button
            type='button'
            className='hover:text-destructive!'
            onClick={() => onDelete()}
          >
            {t(DELETE_ACTION)}
          </button>
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
  const t = useT();
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
      setTopError(err instanceof Error ? err.message : t(DELETE_FAILED));
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
      {topError ? (
        <p className='my-2.5 text-sm text-destructive mb-4'>{topError}</p>
      ) : null}
      {threads.length === 0 ? (
        <p className='text-muted-foreground/60 py-8 text-center'>
          # {t(NO_COMMENTS)}
        </p>
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
