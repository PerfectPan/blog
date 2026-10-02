import { lazy, Suspense, useEffect, useState } from 'react';
import { searchPalette, useSearchPaletteOpen } from './search-palette-store.js';

// cmdk + radix-dialog (the panel, search-palette-panel.tsx) load in their own
// chunk: it is fetched on first open (and warmed during browser idle below),
// so the palette's weight never sits in every page's critical path.
const SearchPalettePanel = lazy(() =>
  import('./search-palette-panel.js').then((m) => ({
    default: m.SearchPalettePanel,
  })),
);

/**
 * Global Cmd/Ctrl+K search palette mount. Renders nothing until the palette
 * has been opened once (or its chunk finished the idle-time warmup), then
 * stays mounted so radix can animate open/close normally.
 */
export function SearchPalette() {
  const open = useSearchPaletteOpen();
  const [armed, setArmed] = useState(false);

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

  useEffect(() => {
    if (open) {
      setArmed(true);
    }
  }, [open]);

  // Warm the panel chunk once the page is idle, so the first Cmd+K after a
  // quiet moment still opens instantly.
  useEffect(() => {
    if (typeof window.requestIdleCallback !== 'function') {
      const timeout = window.setTimeout(() => setArmed(true), 1500);
      return () => window.clearTimeout(timeout);
    }
    const id = window.requestIdleCallback(() => setArmed(true), {
      timeout: 3000,
    });
    return () => window.cancelIdleCallback(id);
  }, []);

  return armed ? (
    <Suspense fallback={null}>
      <SearchPalettePanel />
    </Suspense>
  ) : null;
}
