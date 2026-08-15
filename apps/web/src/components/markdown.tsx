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
// JS regex engine, NOT oniguruma WASM: WebAssembly.instantiate failed
// intermittently on the Worker under memory/CPU pressure, 500-ing article SSR
// (logs 2026-07-26 ~05:45 UTC). shiki's JS engine needs no WASM and is the
// recommended engine for edge runtimes. Don't switch back to oniguruma.
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

type MarkdownProps = {
  content: string;
};

function scrollToHeading(id: string) {
  // scrollIntoView targets the nearest scroll container (the app-shell main),
  // so heading anchors work without depending on window scroll.
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
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
  engine: createJavaScriptRegexEngine(),
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
    <div className='e-code group relative'>
      <button
        type='button'
        onClick={onCopy}
        aria-label='Copy code'
        className='e-code-copy'
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre ref={preRef} className='shiki e-pre w-full overflow-x-auto'>
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
    <article className='md'>
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
              <h2 id={id} className='scroll-mt-20'>
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
          p: ({ children }) => <p>{children}</p>,
          a: ({ href, children }) => (
            <a href={href} target='_blank' rel='noreferrer'>
              {children}
            </a>
          ),
          strong: ({ children }) => <b className='font-bold'>{children}</b>,
          ul: ({ children }) => <ul>{children}</ul>,
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          code: ({ className, children }) =>
            /language-/.test(className ?? '') ? (
              <code className={className}>{children}</code>
            ) : (
              <code className='e-inline'>{children}</code>
            ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
