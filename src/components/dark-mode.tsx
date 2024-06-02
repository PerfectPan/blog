'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

export const DarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark:bg-wash-dark', 'dark:text-white');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark:bg-wash-dark', 'dark:text-white');
    }
  }, [isDarkMode]);

  const onTrigger = async () => {
    /**
     * Return early if View Transition API is not supported
     * or user prefers reduced motion
     */
    const newIsDarkMode = !isDarkMode;
    if (
      !ref.current ||
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsDarkMode(newIsDarkMode);
      return;
    }
    await document.startViewTransition(() => {
      flushSync(() => {
        setIsDarkMode(newIsDarkMode);
      });
    }).ready;

    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    // Calculates the radius of circle that can cover the screen
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
};
