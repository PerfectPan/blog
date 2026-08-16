'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

type ViewTransitionLike = {
  finished: Promise<void>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => ViewTransitionLike;
};

export function DarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark:bg-wash-dark', 'dark:text-white');
      return;
    }

    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark:bg-wash-dark', 'dark:text-white');
  }, [isDarkMode]);

  const onTrigger = () => {
    const newIsDarkMode = !isDarkMode;
    const doc = document as ViewTransitionDocument;

    if (
      !ref.current ||
      !doc.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsDarkMode(newIsDarkMode);
      return;
    }

    // Capture the anchor rect BEFORE starting the transition: once the
    // dark-mode class swap runs, scrollbar / reflow may shift layout and
    // move the measured origin off the icon.
    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    // Hand the origin to CSS custom properties and mark the transition with
    // .vt-dark-reveal. The clip keyframes (see styles.css) then apply to the
    // transition pseudo-elements from their very first frame — no gap between
    // `.ready` resolving and a script animation attaching, so the reveal can
    // never flash the fully-swapped page before the circle starts growing.
    const root = document.documentElement;
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);
    root.style.setProperty('--vt-r', `${maxRadius}px`);
    root.classList.add('vt-dark-reveal');

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        setIsDarkMode(newIsDarkMode);
      });
    });
    transition.finished
      .catch(() => {})
      .finally(() => root.classList.remove('vt-dark-reveal'));
  };

  return (
    <button
      type='button'
      ref={ref}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className='inline-flex cursor-pointer items-center opacity-70 transition-opacity hover:opacity-100'
      onClick={onTrigger}
    >
      {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
    </button>
  );
}
