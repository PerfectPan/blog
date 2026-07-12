import { X } from 'lucide-react';
import { type KeyboardEvent, useRef, useState } from 'react';

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

/**
 * Chip-style tag editor: type and press Enter/comma (half- or full-width) to
 * add a tag, click × (or Backspace on an empty field) to remove one. The wire
 * format stays a plain string[] — no comma-splitting on submit.
 */
export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');

  function commit(raw: string) {
    const tag = raw.trim();
    setDraft('');
    if (!tag) {
      return;
    }
    const duplicate = value.some(
      (existing) => existing.toLowerCase() === tag.toLowerCase(),
    );
    if (duplicate) {
      return;
    }
    onChange([...value, tag]);
  }

  function remove(tag: string) {
    onChange(value.filter((existing) => existing !== tag));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',' || event.key === '，') {
      event.preventDefault();
      commit(draft);
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      event.preventDefault();
      onChange(value.slice(0, -1));
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: click-to-focus convenience; the enclosed <input> is the keyboard-accessible control.
    <div
      onMouseDown={(event) => {
        // Focus the input when pressing anywhere on the field (not on a chip).
        if (event.target === event.currentTarget) {
          event.preventDefault();
          inputRef.current?.focus();
        }
      }}
      className='flex cursor-text flex-wrap items-center gap-1.5 rounded-md border border-slate-300 px-2 py-1.5 transition-colors focus-within:border-black/60 dark:border-slate-700 dark:bg-wash-dark dark:focus-within:border-slate-400'
    >
      {value.map((tag) => (
        <span
          key={tag}
          className='inline-flex items-center gap-1 rounded-full bg-black/[0.06] px-2 py-0.5 text-xs font-medium dark:bg-white/10'
        >
          {tag}
          <button
            type='button'
            onClick={(event) => {
              event.stopPropagation();
              remove(tag);
            }}
            className='opacity-50 transition-opacity hover:opacity-100'
            aria-label={`移除标签 ${tag}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => commit(draft)}
        placeholder={
          value.length === 0 ? (placeholder ?? '输入后回车添加') : ''
        }
        className='min-w-[8ch] flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-sm placeholder:opacity-40'
      />
    </div>
  );
}
