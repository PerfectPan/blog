'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

export function DarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark:bg-wash-dark', 'dark:text-white');
      return;
    }

    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark:bg-wash-dark', 'dark:text-white');
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
    <div
      ref={ref}
      className='cursor-pointer'
      onClick={onTrigger}
      onKeyDown={onTrigger}
    >
      {isDarkMode ? (
        <Moon size={24} className='opacity-70 hover:opacity-100' />
      ) : (
        <Sun size={24} className='opacity-70 hover:opacity-100' />
      )}
    </div>
  );
}
