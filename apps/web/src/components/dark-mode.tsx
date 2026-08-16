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

    // Bake the measured origin into the keyframes as literal pixels. Some
    // engines do not cascade custom properties set on <html> into the
    // view-transition pseudo-elements, which silently fell back to the
    // 50%/50% var() defaults and made the circle grow from the screen
    // center. Literal values sidestep that entirely, and rewriting a
    // dedicated <style> before startViewTransition keeps the clip active
    // from the pseudo-element's first frame (no post-`.ready` attach gap).
    let styleEl = document.getElementById(
      'vt-dark-reveal-keyframes',
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'vt-dark-reveal-keyframes';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `@keyframes dark-mode-reveal{from{clip-path:circle(0px at ${x}px ${y}px)}30%{clip-path:circle(140px at ${x}px ${y}px)}to{clip-path:circle(${maxRadius}px at ${x}px ${y}px)}}`;
    document.documentElement.classList.add('vt-dark-reveal');

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        setIsDarkMode(newIsDarkMode);
      });
    });
    transition.finished
      .catch(() => {})
      .finally(() =>
        document.documentElement.classList.remove('vt-dark-reveal'),
      );
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
