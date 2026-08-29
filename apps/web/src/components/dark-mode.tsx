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

const DARK_COOKIE = 'blog-dark';

function readDarkCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split(';')
    .some((c) => c.trim().startsWith(`${DARK_COOKIE}=1`));
}

function writeDarkCookie(dark: boolean) {
  // biome-ignore lint/suspicious/noDocumentCookie: UI preference cookie; document.cookie is the only dependency-free writer.
  document.cookie = `${DARK_COOKIE}=${dark ? '1' : '0'}; path=/; max-age=31536000; samesite=lax`;
}

export function DarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(readDarkCookie);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // The terminal theme carries its own dark palette via html.dark custom
    // properties; no legacy body utility classes are needed. Keep the
    // browser-chrome theme-color meta in sync with the surface color.
    document.documentElement.classList.toggle('dark', isDarkMode);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDarkMode ? '#0a0f14' : '#f4f2ec');
    writeDarkCookie(isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    // Journal is light-only: switching skins removes the dark class behind
    // our back. When returning to terminal, re-apply the dark class if the
    // user's preference is still on (the preference itself is untouched by
    // skin switches — only the class is).
    const onSkinChange = (event: Event) => {
      const { skin } = (event as CustomEvent<{ skin: string }>).detail;
      if (skin === 'terminal' && isDarkMode) {
        document.documentElement.classList.add('dark');
        document
          .querySelector('meta[name="theme-color"]')
          ?.setAttribute('content', '#0a0f14');
      }
    };
    window.addEventListener('blog:skinchange', onSkinChange);
    return () => window.removeEventListener('blog:skinchange', onSkinChange);
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

    // Bake the measured origin into the keyframes as VIEWPORT PERCENTAGES.
    // Pixel values are wrong on some setups: Chromium interprets clip-path
    // lengths on view-transition pseudo-elements against the physical
    // (device-pixel) snapshot box, so CSS-pixel coordinates land at half
    // the intended position on DPR-2 screens (circle grew from top-center
    // instead of the icon). Percentages resolve against the pseudo's own
    // box in whatever space the engine uses, so they stay pinned to the
    // icon at any DPR / zoom / window size.
    const xp = (x / window.innerWidth) * 100;
    const yp = (y / window.innerHeight) * 100;
    // circle() percentage radius resolves against sqrt(w²+h²)/sqrt(2) of
    // the reference box — convert the pixel max radius into that space.
    const radiusRef =
      Math.hypot(window.innerWidth, window.innerHeight) / Math.SQRT2;
    const rp = (maxRadius / radiusRef) * 100;

    let styleEl = document.getElementById(
      'vt-dark-reveal-keyframes',
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'vt-dark-reveal-keyframes';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `@keyframes dark-mode-reveal{from{clip-path:circle(0% at ${xp}% ${yp}%)}to{clip-path:circle(${rp}% at ${xp}% ${yp}%)}}`;
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
      className='inline-flex cursor-pointer items-center gap-2 opacity-70 transition-opacity hover:opacity-100'
      onClick={onTrigger}
    >
      {isDarkMode ? <Moon size={15} /> : <Sun size={15} />}
      {/* text label surfaces only inside the terminal ≤480px tools sheet */}
      <span className='hidden'>dark</span>
    </button>
  );
}
