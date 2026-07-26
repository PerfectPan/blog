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
      <DialogContent className='overflow-hidden p-0'>
        <Command
          shouldFilter={false}
          className='[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-input]]:h-11 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2'
        >
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder='Search posts…'
          />
          <CommandList>
            <CommandEmpty>
              {query.trim() ? 'No posts found.' : 'Type to search posts…'}
            </CommandEmpty>
            <CommandGroup>
              {results.map((post) => (
                <CommandItem
                  key={post.slug}
                  value={post.slug}
                  onSelect={() => go(post.slug)}
                >
                  <div className='flex min-w-0 flex-col gap-0.5'>
                    <span className='font-medium'>{post.title}</span>
                    {post.description ? (
                      <span className='line-clamp-1 text-xs text-muted-foreground'>
                        {post.description}
                      </span>
                    ) : null}
                  </div>
                  <span className='ml-auto shrink-0 pl-2 text-xs text-muted-foreground'>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
