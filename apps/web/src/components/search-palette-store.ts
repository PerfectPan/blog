import { useSyncExternalStore } from 'react';

/**
 * Tiny module-level store for the search palette's open state, so the global
 * Cmd/Ctrl+K listener and the header affordance can both open it without
 * threading context through the tree. No dep, no provider.
 */
let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export const searchPalette = {
  open() {
    if (!isOpen) {
      isOpen = true;
      emit();
    }
  },
  close() {
    if (isOpen) {
      isOpen = false;
      emit();
    }
  },
  toggle() {
    isOpen = !isOpen;
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot() {
    return isOpen;
  },
};

/** Hook form for components that just want to read open state. */
export function useSearchPaletteOpen() {
  return useSyncExternalStore(
    searchPalette.subscribe,
    searchPalette.getSnapshot,
    searchPalette.getSnapshot,
  );
}
