import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Image as ImageIcon,
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
import { Markdown } from './markdown.js';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

type Mode = 'write' | 'split' | 'preview';

const EDITOR_HEIGHT = 'h-[460px]';

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<Mode>('split');
  // shiki highlighting is expensive; keep the textarea snappy by deferring the
  // rendered preview a tick behind the typed text.
  const previewContent = useDeferredValue(value);
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);

  // Restore the caret/selection after a toolbar action mutates the value.
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

  /** Wrap the current selection with `before`/`after`, inserting a placeholder
   * when nothing is selected. */
  function wrap(before: string, after: string, placeholder = 'text') {
    const el = ref.current;
    if (!el) {
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const next =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    const selStart = start + before.length;
    pendingSelection.current = {
      start: selStart,
      end: selStart + selected.length,
    };
  }

  /** Prefix every line touched by the current selection (toggles the prefix). */
  function prefixLines(prefix: string) {
    const el = ref.current;
    if (!el) {
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const block = value.slice(lineStart, end);
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
    const next = value.slice(0, lineStart) + newBlock + value.slice(end);
    onChange(next);
    pendingSelection.current = {
      start: lineStart,
      end: lineStart + newBlock.length,
    };
  }

  function insertCodeBlock() {
    const el = ref.current;
    if (!el) {
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const inner = value.slice(start, end) || 'code';
    const block = `\`\`\`\n${inner}\n\`\`\``;
    const next = value.slice(0, start) + block + value.slice(end);
    onChange(next);
    pendingSelection.current = {
      start: start + 4,
      end: start + 4 + inner.length,
    };
  }

  return (
    <div className='overflow-hidden rounded-md border border-slate-300 dark:border-slate-700'>
      <div className='flex flex-wrap items-center gap-1 border-b border-slate-200 bg-black/[0.02] px-2 py-1.5 dark:border-slate-700 dark:bg-white/[0.03]'>
        <ToolButton label='加粗' onClick={() => wrap('**', '**')}>
          <Bold size={16} />
        </ToolButton>
        <ToolButton label='斜体' onClick={() => wrap('*', '*')}>
          <Italic size={16} />
        </ToolButton>
        <Divider />
        <ToolButton label='一级标题' onClick={() => prefixLines('# ')}>
          <Heading1 size={16} />
        </ToolButton>
        <ToolButton label='二级标题' onClick={() => prefixLines('## ')}>
          <Heading2 size={16} />
        </ToolButton>
        <Divider />
        <ToolButton label='引用' onClick={() => prefixLines('> ')}>
          <Quote size={16} />
        </ToolButton>
        <ToolButton label='列表' onClick={() => prefixLines('- ')}>
          <List size={16} />
        </ToolButton>
        <ToolButton label='行内代码' onClick={() => wrap('`', '`', 'code')}>
          <Code size={16} />
        </ToolButton>
        <ToolButton label='代码块' onClick={insertCodeBlock}>
          <span className='font-mono text-xs leading-none'>{'{ }'}</span>
        </ToolButton>
        <Divider />
        <ToolButton
          label='链接'
          onClick={() => wrap('[', '](https://)', '链接文字')}
        >
          <LinkIcon size={16} />
        </ToolButton>
        <ToolButton
          label='图片'
          onClick={() => wrap('![', '](https://)', '替代文字')}
        >
          <ImageIcon size={16} />
        </ToolButton>

        <div className='ml-auto flex items-center gap-1'>
          <ModeButton
            active={mode === 'write'}
            onClick={() => setMode('write')}
          >
            编辑
          </ModeButton>
          <ModeButton
            active={mode === 'split'}
            onClick={() => setMode('split')}
          >
            分屏
          </ModeButton>
          <ModeButton
            active={mode === 'preview'}
            onClick={() => setMode('preview')}
          >
            预览
          </ModeButton>
        </div>
      </div>

      <div
        className={`grid ${mode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'} ${EDITOR_HEIGHT}`}
      >
        {mode !== 'preview' ? (
          <textarea
            ref={ref}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            spellCheck={false}
            className={`h-full resize-none bg-white px-3 py-3 font-mono text-sm leading-6 outline-none dark:bg-wash-dark dark:text-slate-100 ${
              mode === 'split'
                ? 'border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700'
                : ''
            }`}
            placeholder='在这里写下 Markdown 正文…'
          />
        ) : null}
        {mode !== 'write' ? (
          <div
            className={`h-full overflow-auto bg-white px-4 py-3 text-sm leading-7 dark:bg-wash-dark ${
              mode === 'split' ? 'hidden lg:block' : ''
            }`}
          >
            {value.trim() ? (
              <Markdown content={previewContent} />
            ) : (
              <p className='opacity-40'>暂无内容可预览。</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
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
      className='flex h-7 w-7 items-center justify-center rounded text-slate-600 transition-colors hover:bg-black/[0.06] dark:text-slate-300 dark:hover:bg-white/10'
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className='mx-1 h-5 w-px bg-slate-200 dark:bg-slate-600' />;
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
      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-black text-white dark:bg-white dark:text-neutral-900'
          : 'text-slate-600 hover:bg-black/[0.06] dark:text-slate-300 dark:hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}
