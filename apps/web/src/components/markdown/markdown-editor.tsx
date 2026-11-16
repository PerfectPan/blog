import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  Loader2,
  Quote
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  markdownPrefixLines,
  markdownWrap,
  useCaretRestore,
  useDebouncedPreview,
  type PendingSelection
} from './markdown-actions';
import { previewPostServerFn } from '../../lib/markdown-preview.js';
import { MarkdownView } from './markdown-view';
import { ModeButton } from '../toolbar/mode-button';
import { ToolButton } from '../toolbar/tool-button';
import { ToolbarDivider } from '../toolbar/toolbar-divider';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

type Mode = 'write' | 'split' | 'preview';

const EDITOR_HEIGHT = 'h-115';

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<Mode>('split');
  const [uploading, setUploading] = useState(false);
  const previewVisible = mode !== 'write';
  // Preview HTML is rendered on the worker (same pipeline as the published
  // page); debounced so typing stays snappy and the RPC stays quiet.
  const [previewHtml, setPreviewHtml] = useState('');
  const pendingSelection = useRef<PendingSelection | null>(null);

  // Preview HTML is rendered on the worker; debounced so typing stays snappy.
  useEffect(() => {
    if (!previewVisible || !value.trim()) {
      setPreviewHtml('');
    }
  }, [previewVisible, value]);
  useDebouncedPreview(previewPostServerFn, value, previewVisible && value.trim() !== '', 250, setPreviewHtml);

  useCaretRestore(ref, pendingSelection);

  const editor = { value, setValue: onChange, ref, pendingSelection };

  function wrap(before: string, after: string, placeholder = 'text') {
    markdownWrap(editor, before, after, placeholder);
  }

  function prefixLines(prefix: string) {
    markdownPrefixLines(editor, prefix);
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
      end: start + 4 + inner.length
    };
  }

  /** Upload pasted/dropped image files to R2 and insert markdown at the caret.
   *  Requires an admin session (the /api/upload route enforces it). */
  async function insertImageFiles(files: File[]) {
    const images = files.filter((file) => file.type.startsWith('image/'));
    if (!images.length || !ref.current) {
      return;
    }
    const el = ref.current;
    let pos = el.selectionStart;
    let next = value;
    setUploading(true);
    try {
      for (const file of images) {
        const form = new FormData();
        form.append('file', file);
        let url: string | undefined;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: form
          });
          if (res.ok) {
            const data = (await res.json()) as { url?: string };
            url = data.url;
          }
        } catch {
          // Network error / abort — skip this file, keep going.
        }
        if (!url) {
          continue;
        }
        const alt = file.name.replace(/\.[^.]+$/, '') || 'image';
        const md = `![${alt}](${url})`;
        next = next.slice(0, pos) + md + next.slice(pos);
        pos += md.length;
      }
      if (next !== value) {
        onChange(next);
        pendingSelection.current = { start: pos, end: pos };
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className='overflow-hidden rounded-md border border-border bg-secondary'>
      <div className='flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5'>
        <ToolButton label='加粗' onClick={() => wrap('**', '**')}>
          <Bold size={16} />
        </ToolButton>
        <ToolButton label='斜体' onClick={() => wrap('*', '*')}>
          <Italic size={16} />
        </ToolButton>
        <ToolbarDivider />
        <ToolButton label='一级标题' onClick={() => prefixLines('# ')}>
          <Heading1 size={16} />
        </ToolButton>
        <ToolButton label='二级标题' onClick={() => prefixLines('## ')}>
          <Heading2 size={16} />
        </ToolButton>
        <ToolbarDivider />
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
        <ToolbarDivider />
        <ToolButton label='链接' onClick={() => wrap('[', '](https://)', '链接文字')}>
          <LinkIcon size={16} />
        </ToolButton>
        <ToolButton label='图片' onClick={() => wrap('![', '](https://)', '替代文字')}>
          <ImageIcon size={16} />
        </ToolButton>
        {uploading ? (
          <span className='ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground'>
            <Loader2 size={12} className='animate-spin' />
            上传中…
          </span>
        ) : null}

        <div className='ml-auto flex items-center gap-1'>
          <ModeButton active={mode === 'write'} onClick={() => setMode('write')}>
            编辑
          </ModeButton>
          <ModeButton active={mode === 'split'} onClick={() => setMode('split')}>
            分屏
          </ModeButton>
          <ModeButton active={mode === 'preview'} onClick={() => setMode('preview')}>
            预览
          </ModeButton>
        </div>
      </div>

      <div className={`grid ${mode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'} ${EDITOR_HEIGHT}`}>
        {mode !== 'preview' ? (
          <textarea
            ref={ref}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onPaste={(event) => {
              const files = Array.from(event.clipboardData.items)
                .map((item) => (item.kind === 'file' ? item.getAsFile() : null))
                .filter((file): file is File => file !== null);
              if (files.length > 0) {
                event.preventDefault();
                void insertImageFiles(files);
              }
            }}
            onDrop={(event) => {
              const files = Array.from(event.dataTransfer.files);
              if (files.some((file) => file.type.startsWith('image/'))) {
                event.preventDefault();
                void insertImageFiles(files);
              }
            }}
            onDragOver={(event) => {
              if (event.dataTransfer.types.includes('Files')) {
                event.preventDefault();
              }
            }}
            spellCheck={false}
            className={`h-full resize-none bg-background px-3 py-3 font-mono text-sm leading-6 text-foreground outline-none ${
              mode === 'split' ? 'border-b border-border lg:border-b-0 lg:border-r' : ''
            }`}
            placeholder='在这里写下 Markdown 正文…'
          />
        ) : null}
        {mode !== 'write' ? (
          <div
            className={`h-full overflow-auto bg-background px-4 py-3 text-sm leading-7 ${
              mode === 'split' ? 'hidden lg:block' : ''
            }`}
          >
            {value.trim() ? <MarkdownView html={previewHtml} /> : <p className='opacity-40'>暂无内容可预览。</p>}
          </div>
        ) : null}
      </div>
    </div>
  );
}
