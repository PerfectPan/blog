import type { PostSummary } from '@blog/shared';
import { useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { searchPostsServerFn } from '../lib/blog-service.js';
import { searchPalette, useSearchPaletteOpen } from './search-palette-store.js';

/**
 * Global Cmd/Ctrl+K search bar. Non-modal on purpose: grep output belongs
 * under the prompt, not in a dialog — the panel is a fixed bar under the
 * titlebar, no overlay, no scroll lock. Search runs server-side
 * (searchPostsServerFn) so visibility filtering stays authoritative —
 * restricted posts never appear as suggestions. `shouldFilter={false}`
 * because we feed our own server results; cmdk's built-in client filter is
 * disabled.
 */
export function SearchPalette() {
  const open = useSearchPaletteOpen();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostSummary[]>([]);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Global Cmd/Ctrl+K toggle.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchPalette.toggle();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Debounced server search while open; reset on close. `stale` guards
  // against a slow earlier response overwriting a newer query's results.
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setPending(false);
      return;
    }
    // Focus the input on open (the old Dialog used to do this for us).
    wrapRef.current?.querySelector('input')?.focus();
    const q = query.trim();
    if (!q) {
      setResults([]);
      setPending(false);
      return;
    }
    let stale = false;
    const handle = setTimeout(() => {
      setPending(true);
      searchPostsServerFn({ data: { q } })
        .then((posts) => {
          if (!stale) {
            setResults(posts);
            setPending(false);
          }
        })
        .catch(() => {
          if (!stale) {
            setResults([]);
            setPending(false);
          }
        });
    }, 150);
    return () => {
      stale = true;
      clearTimeout(handle);
    };
  }, [open, query]);

  // Non-modal: close on Esc or any pointer outside the bar. Triggers marked
  // with [data-palette-trigger] are skipped so the header grep button can
  // still toggle (pointerdown-close would otherwise race its own click).
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') searchPalette.close();
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest?.('[data-palette-trigger]')) return;
      if (wrapRef.current && !wrapRef.current.contains(target)) {
        searchPalette.close();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  // Full-screen mobile sheet: lock the page behind it while open.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia('(max-width: 640px)');
    const sync = () => {
      document.body.style.overflow = mq.matches ? 'hidden' : '';
    };
    sync();
    mq.addEventListener('change', sync);
    return () => {
      document.body.style.overflow = '';
      mq.removeEventListener('change', sync);
    };
  }, [open]);

  function go(slug: string) {
    searchPalette.close();
    navigate({ to: '/blog/$slug', params: { slug } });
  }

  if (!open) {
    return null;
  }

  return (
    <div
      ref={wrapRef}
      role='dialog'
      aria-modal='false'
      aria-label='搜索文章'
      className='th-pal overflow-hidden p-0'
    >
      <button
        type='button'
        aria-label='Close search'
        onClick={() => searchPalette.close()}
      >
        <X size={15} aria-hidden='true' />
      </button>
      <Command shouldFilter={false} className='th-pal-cmd'>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="grep -ri '关键词' ~/posts"
        />
        <CommandList>
          <CommandEmpty>
            {!query.trim()
              ? '# type to grep ~/posts'
              : pending
                ? '# grepping ...'
                : '# no matches found'}
          </CommandEmpty>
          <CommandGroup>
            {results.map((post) => (
              <CommandItem
                key={post.slug}
                value={post.slug}
                onSelect={() => go(post.slug)}
              >
                <span className='th-pal-date'>
                  {new Date(post.publishedAt).toISOString().slice(0, 7)}
                </span>
                <span className='th-pal-title'>{post.title}</span>
                {post.visibility !== 'public' ? (
                  <span className='th-pal-vis'>{post.visibility}</span>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <div className='th-pal-foot'>
          <span className='hidden sm:inline'>
            ↑↓ 选择 · ↵ 打开 · esc 关闭 · 结果按当前身份过滤
          </span>
          <span className='sm:hidden'>输入关键词 · 点按结果打开</span>
        </div>
      </Command>
    </div>
  );
}
