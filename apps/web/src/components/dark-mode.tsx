'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

export function DarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // The terminal theme carries its own dark palette via html.dark custom
    // properties; no legacy body utility classes are needed.
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const onTrigger = async () => {
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

    await doc.startViewTransition(() => {
      flushSync(() => {
        setIsDarkMode(newIsDarkMode);
      });
    }).ready;

    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${maxRadius}px at ${x}px ${y}px)`,
    ];

    document.documentElement.animate(
      {
        clipPath: newIsDarkMode ? clipPath : [...clipPath].reverse(),
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: newIsDarkMode
          ? '::view-transition-new(root)'
          : '::view-transition-old(root)',
      },
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
