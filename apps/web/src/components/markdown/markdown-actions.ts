import { useEffect, type RefObject } from 'react';

/**
 * The textarea editor plumbing the comment composer and the markdown editor
 * share: debounced preview rendering, caret restoration after a toolbar
 * mutation, and the selection-aware wrap/prefix edits.
 */

export interface PendingSelection {
  start: number;
  end: number;
}

/** Runs `render` on `content`, debounced by `delayMs` while `enabled`; a stale run never overwrites a newer one. */
export function useDebouncedPreview(
  render: (body: { data: { body: string } }) => Promise<{ html: string }>,
  content: string,
  enabled: boolean,
  delayMs: number,
  setHtml: (html: string) => void
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    let cancelled = false;
    const handle = setTimeout(() => {
      render({ data: { body: content } })
        .then(({ html }) => {
          if (!cancelled) {
            setHtml(html);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setHtml('');
          }
        });
    }, delayMs);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [render, content, enabled, delayMs, setHtml]);
}

/** Focuses the textarea and restores the caret/selection a toolbar action moved. */
export function useCaretRestore(
  ref: RefObject<HTMLTextAreaElement | null>,
  pendingSelection: RefObject<PendingSelection | null>
): void {
  useEffect(() => {
    const el = ref.current;
    const next = pendingSelection.current;
    if (!el || !next) {
      return;
    }
    el.focus();
    el.setSelectionRange(next.start, next.end);
    pendingSelection.current = null;
  });
}

/** Selection bookkeeping the wrap/prefix edits share. */
function applySelectionEdit(
  setValue: (next: string) => void,
  pendingSelection: RefObject<PendingSelection | null>,
  next: string,
  selStart: number,
  selectedLength: number
): void {
  setValue(next);
  pendingSelection.current = {
    start: selStart,
    end: selStart + selectedLength
  };
}

/** Wraps the current selection with `before`/`after`, inserting `placeholder` when nothing is selected. */
export function markdownWrap(
  args: {
    value: string;
    setValue: (next: string) => void;
    ref: RefObject<HTMLTextAreaElement | null>;
    pendingSelection: RefObject<PendingSelection | null>;
  },
  before: string,
  after: string,
  placeholder = 'text'
): void {
  const el = args.ref.current;
  if (!el) {
    return;
  }
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = args.value.slice(start, end) || placeholder;
  const next = args.value.slice(0, start) + before + selected + after + args.value.slice(end);
  applySelectionEdit(args.setValue, args.pendingSelection, next, start + before.length, selected.length);
}

/** Prefixes every line touched by the current selection (toggles the prefix off when all lines carry it). */
export function markdownPrefixLines(
  args: {
    value: string;
    setValue: (next: string) => void;
    ref: RefObject<HTMLTextAreaElement | null>;
    pendingSelection: RefObject<PendingSelection | null>;
  },
  prefix: string
): void {
  const el = args.ref.current;
  if (!el) {
    return;
  }
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const lineStart = args.value.lastIndexOf('\n', start - 1) + 1;
  const block = args.value.slice(lineStart, end);
  const allPrefixed = block.split('\n').every((line) => line.startsWith(prefix) || line === '');
  const newBlock = block
    .split('\n')
    .map((line) => (allPrefixed ? line.slice(prefix.length) : line.startsWith(prefix) ? line : prefix + line))
    .join('\n');
  const next = args.value.slice(0, lineStart) + newBlock + args.value.slice(end);
  applySelectionEdit(args.setValue, args.pendingSelection, next, start, 0);
}
