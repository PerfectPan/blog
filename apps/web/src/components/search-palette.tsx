import type { PostSummary } from '@blog/shared';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { searchPostsServerFn } from '../lib/blog-service.js';
import { searchPalette, useSearchPaletteOpen } from './search-palette-store.js';

/**
 * Global Cmd/Ctrl+K search palette (Bundle C). Uses the shadcn Command + Dialog
 * primitives (Bundle 0), styled by the shared tokens. Search runs server-side
 * (searchPostsServerFn) so visibility filtering stays authoritative — restricted
 * posts never appear as suggestions. `shouldFilter={false}` because we feed our
 * own server results; cmdk's built-in client filter is disabled.
 */
export function SearchPalette() {
  const open = useSearchPaletteOpen();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostSummary[]>([]);
  const navigate = useNavigate();

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

  // Debounced server search while open; reset on close.
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      return;
    }
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      searchPostsServerFn({ data: { q } })
        .then(setResults)
        .catch(() => setResults([]));
    }, 150);
    return () => clearTimeout(handle);
  }, [open, query]);

  function go(slug: string) {
    searchPalette.close();
    navigate({ to: '/blog/$slug', params: { slug } });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) =>
        next ? searchPalette.open() : searchPalette.close()
      }
    >
      <DialogContent className='th-pal overflow-hidden p-0'>
        <Command shouldFilter={false} className='th-pal-cmd'>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="grep -ri '关键词' ~/posts"
          />
          <CommandList>
            <CommandEmpty>
              {query.trim() ? '# no matches found' : '# type to grep ~/posts'}
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
            ↑↓ 选择 · ↵ 打开 · esc 关闭 · 结果按当前身份过滤
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
