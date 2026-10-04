import type { Locale } from '@blog/shared';
import { useEffect, useRef } from 'react';
import {
  COPIED_LABEL,
  COPY_ARIA,
  COPY_LABEL,
  formatMsg,
} from '../lib/i18n/messages.js';
import { highlightCode } from './markdown-highlight.js';

type MarkdownViewProps = {
  /** Pre-rendered by lib/markdown-html.tsx on the worker. */
  html: string;
};

function scrollToHeading(id: string) {
  // scrollIntoView targets the nearest scroll container (the app-shell main),
  // so heading anchors work without depending on window scroll.
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

/** Observe clipping scroll containers too, including the editor preview. Only
 *  visible/nearby blocks enter the queue; a long article does no offscreen work. */
function observeCodeBlocks(article: HTMLElement, signal: AbortSignal) {
  const queue: HTMLPreElement[] = [];
  let running = false;
  async function drain() {
    if (running) return;
    running = true;
    try {
      while (queue.length && !signal.aborted) {
        const pre = queue.shift();
        if (pre) await upgradeCodeBlock(pre, signal);
      }
    } finally {
      running = false;
    }
  }
  const pres = article.querySelectorAll<HTMLPreElement>('pre');
  if (typeof IntersectionObserver === 'undefined') {
    queue.push(...pres);
    void drain();
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        queue.push(entry.target as HTMLPreElement);
      }
      void drain();
    },
    { rootMargin: '400px 0px' },
  );
  for (const pre of pres) observer.observe(pre);
  return () => observer.disconnect();
}

async function upgradeCodeBlock(pre: HTMLPreElement, signal: AbortSignal) {
  const code = pre.querySelector('code');
  if (!code || code.dataset.highlighted || signal.aborted) return;
  const lang = /language-([\w+#-]+)/.exec(code.className)?.[1] ?? 'text';
  const html = await highlightCode(code.textContent ?? '', lang, signal);
  if (!html || signal.aborted || !pre.isConnected || code.dataset.highlighted)
    return;

  // Keep the server's code-block chrome and copy controls. Only the escaped
  // Shiki code markup and dual-theme styles come back from the browser worker.
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const shikiPre = doc.querySelector('pre');
  const shikiCode = shikiPre?.querySelector('code');
  if (!shikiPre || !shikiCode) return;
  pre.classList.add(...shikiPre.classList);
  const style = shikiPre.getAttribute('style');
  if (style) pre.setAttribute('style', style);
  code.innerHTML = shikiCode.innerHTML;
  code.dataset.highlighted = 'true';
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

  // Event delegation + locale relabeling bind to the persistent <article>
  // node, so mount-once is correct here; innerHTML swaps don't detach them.
  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

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

  // Enhancement must track the html prop, not just the mount: client-side
  // navigation reuses this component with fresh HTML, and the admin editor
  // first mounts with empty preview HTML that arrives asynchronously. The
  // cleanup cancels the queue so a superseded html string stops paying for
  // highlighting its (soon-to-be-replaced) blocks.
  // biome-ignore lint/correctness/useExhaustiveDependencies: html is the trigger — fresh markup must be re-enhanced even though the effect reads it from the DOM.
  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const locale: Locale = document.documentElement.lang.startsWith('zh')
      ? 'zh'
      : 'en';
    relabelCopyButtons(locale, article);

    let scrollFrame = 0;
    const hash = window.location.hash;
    if (hash.startsWith('#')) {
      scrollFrame = requestAnimationFrame(() => {
        scrollToHeading(decodeURIComponent(hash.slice(1)));
      });
    }

    const controller = new AbortController();
    const disconnect = observeCodeBlocks(article, controller.signal);
    return () => {
      cancelAnimationFrame(scrollFrame);
      disconnect();
      controller.abort();
    };
  }, [html]);

  return (
    <article
      ref={articleRef}
      className='md'
      // biome-ignore lint/security/noDangerouslySetInnerHtml: rendered on the worker by lib/markdown-html.tsx through react-markdown (no rehype-raw, sanitized urlTransform) — identical XSS posture to the previous client-side render.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
