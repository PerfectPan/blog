import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { Bold, Code, Italic, Link as LinkIcon, List, Quote } from 'lucide-react';
import {
  CHARS_LEFT,
  CODE_PLACEHOLDER,
  COMMENT_FAILED,
  EDITOR_PREVIEW,
  EDITOR_WRITE,
  LINK_TEXT_PLACEHOLDER,
  PREVIEW_EMPTY,
  SENDING,
  TEXT_PLACEHOLDER,
  TOOLBAR_BOLD,
  TOOLBAR_CODE,
  TOOLBAR_ITALIC,
  TOOLBAR_LINK,
  TOOLBAR_LIST,
  TOOLBAR_QUOTE
} from '../../lib/i18n/messages.js';

/** Client mirror of the server-side comment body cap (comments-service). */
const COMMENT_BODY_MAX = 2000;
import { useT } from '../../lib/i18n/context.js';
import { previewCommentServerFn } from '../../lib/markdown-preview.js';
import { useSessionUser } from '../../lib/session-user.js';
import { CommentBody } from './comment-body';
import { ModeButton } from '../toolbar/mode-button';
import { ToolButton } from '../toolbar/tool-button';
import { ToolbarDivider } from '../toolbar/toolbar-divider';

type ComposerProps = {
  placeholder: string;
  /** Idle label of the submit button — `send` for new comments, `reply` for replies. */
  submitLabel: string;
  submitting: boolean;
  onSubmit: (body: string) => Promise<void>;
  compact?: boolean;
};

export function Composer({ placeholder, submitLabel, submitting, onSubmit, compact }: ComposerProps) {
  const t = useT();
  const displayName = useSessionUser()?.name;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Server-rendered preview HTML (rendered on the worker through the same
  // pipeline as stored comments — react-markdown never ships to the browser).
  const [previewHtml, setPreviewHtml] = useState('');
  const remaining = COMMENT_BODY_MAX - body.length;
  // Re-rendering markdown per keystroke is wasteful — keep the preview a tick
  // behind the typed text (same as the admin editor).
  const previewContent = useDeferredValue(body);
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);

  // Debounced server render while the preview tab is open.
  useEffect(() => {
    if (!preview || !previewContent.trim()) {
      setPreviewHtml('');
      return;
    }
    let cancelled = false;
    const handle = setTimeout(() => {
      previewCommentServerFn({ data: { body: previewContent } })
        .then(({ html }) => {
          if (!cancelled) {
            setPreviewHtml(html);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setPreviewHtml('');
          }
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [preview, previewContent]);

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
    const next = body.slice(0, start) + before + selected + after + body.slice(end);
    setBody(next);
    const selStart = start + before.length;
    pendingSelection.current = {
      start: selStart,
      end: selStart + selected.length
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
    const allPrefixed = block.split('\n').every((line) => line.startsWith(prefix) || line === '');
    const newBlock = block
      .split('\n')
      .map((line) => (allPrefixed ? line.slice(prefix.length) : line.startsWith(prefix) ? line : prefix + line))
      .join('\n');
    setBody(body.slice(0, lineStart) + newBlock + body.slice(end));
    pendingSelection.current = {
      start: lineStart,
      end: lineStart + newBlock.length
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
            <ToolButton interactive label={t(TOOLBAR_BOLD)} onClick={() => wrap('**', '**', t(TEXT_PLACEHOLDER))}>
              <Bold size={14} />
            </ToolButton>
            <ToolButton interactive label={t(TOOLBAR_ITALIC)} onClick={() => wrap('*', '*', t(TEXT_PLACEHOLDER))}>
              <Italic size={14} />
            </ToolButton>
            <ToolbarDivider size='sm' />
            <ToolButton interactive label={t(TOOLBAR_QUOTE)} onClick={() => prefixLines('> ')}>
              <Quote size={14} />
            </ToolButton>
            <ToolButton interactive label={t(TOOLBAR_LIST)} onClick={() => prefixLines('- ')}>
              <List size={14} />
            </ToolButton>
            <ToolButton interactive label={t(TOOLBAR_CODE)} onClick={() => wrap('`', '`', t(CODE_PLACEHOLDER))}>
              <Code size={14} />
            </ToolButton>
            <ToolButton
              interactive
              label={t(TOOLBAR_LINK)}
              onClick={() => wrap('[', '](https://)', t(LINK_TEXT_PLACEHOLDER))}
            >
              <LinkIcon size={14} />
            </ToolButton>
          </>
        ) : null}
        <div className='ml-auto flex items-center gap-1'>
          <ModeButton interactive active={!preview} onClick={() => setPreview(false)}>
            {t(EDITOR_WRITE)}
          </ModeButton>
          <ModeButton interactive active={preview} onClick={() => setPreview(true)}>
            {t(EDITOR_PREVIEW)}
          </ModeButton>
        </div>
      </div>
      {preview ? (
        <div className={`overflow-auto px-3.5 py-2.5 ${compact ? 'min-h-16' : 'min-h-21'}`}>
          {body.trim() ? (
            <CommentBody html={previewHtml} />
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
