import type { Locale } from '@blog/shared';
import { useEffect, useRef } from 'react';
import type { HighlighterCore, LanguageInput } from 'shiki/core';
import {
  COPIED_LABEL,
  COPY_ARIA,
  COPY_LABEL,
  formatMsg,
} from '../lib/i18n/messages.js';

type MarkdownViewProps = {
  /** Pre-rendered by lib/markdown-html.tsx on the worker. */
  html: string;
};

/** JS regex engine, NOT oniguruma WASM: WebAssembly.instantiate failed
 *  intermittently under memory/CPU pressure (logs 2026-07-26). In the
 *  browser that constraint doesn't apply, but the engine choice stays. */
let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter() {
  // Core + themes only. Grammars are NOT registered here: compiling all 17
  // languages in one shot measured as a single ~1.5s main-thread task (4x
  // CPU throttle), so each grammar is loaded just-in-time per code block in
  // upgradeCodeBlock — the cost spreads across the yield points there.
  highlighterPromise ??= (async () => {
    const { createHighlighterCore } = await import('shiki/core');
    const { createJavaScriptRegexEngine } = await import(
      'shiki/engine/javascript'
    );
    return createHighlighterCore({
      themes: [
        import('shiki/themes/vitesse-light.mjs'),
        import('shiki/themes/vitesse-dark.mjs'),
      ],
      engine: createJavaScriptRegexEngine(),
    });
  })();
  return highlighterPromise;
}

/** Lang chunk per grammar — static import map so Vite can code-split them. */
const LANG_IMPORTS: Record<string, () => Promise<unknown>> = {
  javascript: () => import('shiki/langs/javascript.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  jsx: () => import('shiki/langs/jsx.mjs'),
  tsx: () => import('shiki/langs/tsx.mjs'),
  html: () => import('shiki/langs/html.mjs'),
  css: () => import('shiki/langs/css.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  bash: () => import('shiki/langs/bash.mjs'),
  shell: () => import('shiki/langs/bash.mjs'),
  sh: () => import('shiki/langs/bash.mjs'),
  yaml: () => import('shiki/langs/yaml.mjs'),
  markdown: () => import('shiki/langs/markdown.mjs'),
  cpp: () => import('shiki/langs/cpp.mjs'),
  c: () => import('shiki/langs/c.mjs'),
  go: () => import('shiki/langs/go.mjs'),
  java: () => import('shiki/langs/java.mjs'),
  python: () => import('shiki/langs/python.mjs'),
  rust: () => import('shiki/langs/rust.mjs'),
  sql: () => import('shiki/langs/sql.mjs'),
};

function scrollToHeading(id: string) {
  // scrollIntoView targets the nearest scroll container (the app-shell main),
  // so heading anchors work without depending on window scroll.
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

/** True while the element is in (or just below) the current viewport. */
function isNearViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 1.5;
}

function nextTask(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/**
 * Highlights code blocks in paint order: viewport blocks first (they carry
 * the LCP), then the rest, yielding between blocks so the main thread stays
 * interactive on long, code-heavy posts.
 */
async function highlightProgressively(pres: HTMLPreElement[]) {
  const above: HTMLPreElement[] = [];
  const below: HTMLPreElement[] = [];
  for (const pre of pres) {
    (isNearViewport(pre) ? above : below).push(pre);
  }
  // The first block also pays the highlighter init (module fetch + grammar
  // compile); kick it before any awaits so the fetch overlaps everything.
  const first = above.shift() ?? below.shift();
  if (!first) return;
  const firstUpgrade = upgradeCodeBlock(first);
  const queue = [...above, ...below];
  await firstUpgrade;
  for (const pre of queue) {
    await upgradeCodeBlock(pre);
    await nextTask();
  }
}

/** Upgrades one <pre><code> to shiki highlighting in place. */
async function upgradeCodeBlock(pre: HTMLPreElement) {
  const code = pre.querySelector('code');
  if (!code || code.dataset.highlighted) return;
  const lang = /language-([\w-]+)/.exec(code.className)?.[1] ?? 'text';
  const raw = code.textContent ?? '';
  try {
    const highlighter = await getHighlighter();
    // Just-in-time grammar: unknown/unsupported languages stay plain text
    // (same visible outcome as the old eager setup, which also failed soft).
    const loadLang = LANG_IMPORTS[lang] as
      | (() => Promise<{ default: LanguageInput }>)
      | undefined;
    if (loadLang) {
      const loaded = new Set(highlighter.getLoadedLanguages());
      if (!loaded.has(lang)) {
        const mod = (await loadLang()) as { default: LanguageInput };
        await highlighter.loadLanguage(mod.default);
      }
    }
    const html = highlighter.codeToHtml(raw, {
      lang: loadLang ? lang : 'text',
      themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
    });
    if (code.dataset.highlighted) return;
    // codeToHtml returns a full <pre> — keep OUR pre (classes, copy button,
    // refs) and lift shiki's <code> body + theme vars into it.
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const shikiPre = doc.querySelector('pre');
    const shikiCode = shikiPre?.querySelector('code');
    if (!shikiPre || !shikiCode) return;
    pre.classList.add(...shikiPre.classList);
    const style = shikiPre.getAttribute('style');
    if (style) pre.setAttribute('style', style);
    code.innerHTML = shikiCode.innerHTML;
    code.dataset.highlighted = 'true';
  } catch {
    // Highlighting is progressive enhancement — plain code stays.
  }
}

/** Copy buttons carry the server-rendered locale; when the UI language
 *  switches (guest preference), relabel them without a re-render. */
function relabelCopyButtons(locale: Locale, root: HTMLElement) {
  for (const button of root.querySelectorAll<HTMLButtonElement>(
    '[data-md-copy]',
  )) {
    button.setAttribute('aria-label', formatMsg(locale, COPY_ARIA));
    const label = button.querySelector('.md-copy-label');
    const copied = button.querySelector('.md-copied-label');
    if (label) label.textContent = formatMsg(locale, COPY_LABEL);
    if (copied) copied.textContent = formatMsg(locale, COPIED_LABEL);
  }
}

/**
 * Client island over server-rendered markdown HTML. Hydrates as ONE node
 * (no markdown parsing, no react-markdown in the browser) and progressively
 * enhances it: shiki code highlighting, copy buttons, heading anchors and
 * initial hash scrolling.
 */
export function MarkdownView({ html }: MarkdownViewProps) {
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    // Initial #hash scroll, one frame after paint.
    const hash = window.location.hash;
    if (hash.startsWith('#')) {
      requestAnimationFrame(() => {
        const id = decodeURIComponent(hash.slice(1));
        scrollToHeading(id);
      });
    }

    // Heading anchors + copy buttons via event delegation.
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest<HTMLAnchorElement>('h2 > a');
      if (anchor) {
        event.preventDefault();
        const id = anchor.parentElement?.id ?? '';
        window.history.pushState('', '', `#${id}`);
        scrollToHeading(id);
        return;
      }
      const button = target.closest<HTMLButtonElement>('[data-md-copy]');
      if (button) {
        const pre = button.parentElement?.querySelector('pre');
        void (async () => {
          try {
            await navigator.clipboard.writeText(pre?.textContent ?? '');
            button.dataset.copied = 'true';
            setTimeout(() => {
              delete button.dataset.copied;
            }, 1500);
          } catch {
            // Clipboard unavailable (non-secure context / no permission) — no-op.
          }
        })();
      }
    };
    article.addEventListener('click', onClick);

    // Shiki upgrade, scheduled so the page stays responsive: blocks in (or
    // near) the viewport highlight first — they carry the LCP — and each block
    // yields to the event loop before the next, so one long post cannot pin
    // the main thread behind a single multi-second task.
    void highlightProgressively(
      Array.from(article.querySelectorAll<HTMLPreElement>('pre')),
    );

    // Relabel copy buttons when the guest locale switches client-side. The
    // <html lang> attribute carries the BCP-7 tag (zh-CN / en) — collapse it
    // back to the UI locale.
    const langObserver = new MutationObserver(() => {
      const tag = document.documentElement.lang;
      const locale: Locale = tag.startsWith('zh') ? 'zh' : 'en';
      relabelCopyButtons(locale, article);
    });
    langObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });

    return () => {
      article.removeEventListener('click', onClick);
      langObserver.disconnect();
    };
  }, []);

  return (
    <article
      ref={articleRef}
      className='md'
      // biome-ignore lint/security/noDangerouslySetInnerHtml: rendered on the worker by lib/markdown-html.tsx through react-markdown (no rehype-raw, sanitized urlTransform) — identical XSS posture to the previous client-side render.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
