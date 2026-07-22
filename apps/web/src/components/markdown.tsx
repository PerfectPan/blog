import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { Check, Copy } from 'lucide-react';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

type MarkdownProps = {
  content: string;
};

const HEADER_HEIGHT = 64;
const SAFE_HEIGHT = 16;

function scrollToHeading(id: string) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  const elementTop = element.getBoundingClientRect().top + window.scrollY;
  const targetPosition = elementTop - (HEADER_HEIGHT + SAFE_HEIGHT);

  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  });
}

const highlighter = await createHighlighterCore({
  themes: [
    import('shiki/themes/vitesse-light.mjs'),
    import('shiki/themes/vitesse-dark.mjs'),
  ],
  langs: [
    import('shiki/langs/javascript.mjs'),
    import('shiki/langs/typescript.mjs'),
    import('shiki/langs/jsx.mjs'),
    import('shiki/langs/tsx.mjs'),
    import('shiki/langs/html.mjs'),
    import('shiki/langs/css.mjs'),
    import('shiki/langs/json.mjs'),
    import('shiki/langs/bash.mjs'),
    import('shiki/langs/yaml.mjs'),
    import('shiki/langs/markdown.mjs'),
    import('shiki/langs/cpp.mjs'),
    import('shiki/langs/c.mjs'),
    import('shiki/langs/go.mjs'),
    import('shiki/langs/java.mjs'),
    import('shiki/langs/python.mjs'),
    import('shiki/langs/rust.mjs'),
    import('shiki/langs/sql.mjs'),
  ],
  engine: createOnigurumaEngine(() => import('shiki/wasm')),
});

/**
 * Wraps a highlighted <pre> with a Copy button. Reads the rendered textContent
 * (post-shiki) so it works regardless of how the code was tokenized.
 */
function CodeBlock({ children }: { children?: ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    const text = preRef.current?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (non-secure context / no permission) — no-op.
    }
  }, []);

  return (
    <div className='relative mb-2'>
      <button
        type='button'
        onClick={onCopy}
        aria-label='Copy code'
        className='absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded border border-slate-300 bg-white/70 px-1.5 py-0.5 text-xs opacity-70 backdrop-blur transition-opacity hover:opacity-100 dark:border-slate-700 dark:bg-slate-900/70'
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre
        ref={preRef}
        className='shiki w-full overflow-x-auto whitespace-pre-wrap rounded-md bg-zinc-50 p-4 dark:bg-shiki-dark'
      >
        {children}
      </pre>
    </div>
  );
}

export function Markdown({ content }: MarkdownProps) {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#')) {
      return;
    }

    requestAnimationFrame(() => {
      const id = decodeURIComponent(hash.slice(1));
      scrollToHeading(id);
    });
  }, []);

  return (
    <article>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          [
            rehypeShikiFromHighlighter,
            highlighter,
            {
              themes: {
                light: 'vitesse-light',
                dark: 'vitesse-dark',
              },
            },
          ],
        ]}
        components={{
          h2: ({ children }) => {
            const id = typeof children === 'string' ? children : '';

            return (
              <h2
                id={id}
                className='mb-6 mt-14 scroll-mt-20 text-balance text-2xl leading-none font-black first:mt-0'
              >
                <a
                  href={`#${id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    window.history.pushState('', '', `#${id}`);
                    scrollToHeading(id);
                  }}
                >
                  {id}
                </a>
              </h2>
            );
          },
          p: ({ children }) => <p className='mb-6 leading-7'>{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              className='text-blue-700/80 transition-colors duration-300 ease-in-out hover:text-blue-700'
              target='_blank'
              rel='noreferrer'
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <b className='font-extrabold'>{children}</b>
          ),
          ul: ({ children }) => (
            <ul className='mb-4 ml-4 list-disc'>{children}</ul>
          ),
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
