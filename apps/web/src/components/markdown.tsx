import { Check, Copy } from 'lucide-react';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { useT } from '../lib/i18n/context.js';
import { COPIED_LABEL, COPY_ARIA, COPY_LABEL } from '../lib/i18n/messages.js';

type MarkdownProps = {
  content: string;
};

/** Class names for the code block chrome + inline code. */
const CODE_CLASSES = {
  wrap: 'group relative my-4.5 group relative',
  copy: 'absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 [@media(not(hover:hover))]:opacity-75',
  pre: 'shiki th-pre w-full overflow-x-auto',
  inline: 'md-inline',
};

/** Flatten react-markdown children (string | array | element) to plain text
 *  for heading ids — headings with inline code/bold still get a usable id. */
function flattenText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join('');
  if (typeof node === 'object' && 'props' in node) {
    return flattenText(
      (node as { props?: { children?: ReactNode } }).props?.children,
    );
  }
  return '';
}

/**
 * SERVER-SIDE post body renderer.
 *
 * This component is rendered to an HTML string on the worker
 * (lib/markdown-html.tsx) and injected with dangerouslySetInnerHTML by
 * components/markdown-view.tsx — react-markdown + remark + rehype-katex
 * never enter the client bundle, and the browser hydrates the article body
 * as a single node instead of re-parsing the whole markdown tree.
 *
 * Rendering history: shiki used to run inside the SSR worker and blew through
 * the free-tier CPU limit on longer posts (intermittent 1102/503s), so code
 * highlighting stays a browser-side progressive enhancement performed by
 * markdown-view's enhancer; this component renders plain code blocks with the
 * copy-button chrome and the enhancer upgrades them in place.
 */
export function Markdown({ content }: MarkdownProps) {
  const t = useT();

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h2: ({ children }) => {
          const id = flattenText(children);

          return (
            <h2 id={id} className='scroll-mt-20'>
              <a href={`#${id}`}>{children}</a>
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
        pre: ({ children }) => (
          <div className={CODE_CLASSES.wrap}>
            <button
              type='button'
              data-md-copy=''
              aria-label={t(COPY_ARIA)}
              className={CODE_CLASSES.copy}
            >
              <Copy size={12} className='md-copy-icon' aria-hidden='true' />
              <Check size={12} className='md-check-icon' aria-hidden='true' />
              <span className='md-copy-label'>{t(COPY_LABEL)}</span>
              <span className='md-copied-label'>{t(COPIED_LABEL)}</span>
            </button>
            <pre className={CODE_CLASSES.pre}>{children}</pre>
          </div>
        ),
        code: ({ className, children }) => {
          // Block code from shiki carries `language-*` — but some shiki
          // versions drop it, so also treat multi-line content as block.
          // Without this, a whole code block falls into the inline-code
          // style whose border renders under EVERY line box.
          const isBlock =
            /language-/.test(className ?? '') ||
            String(children).includes('\n');
          return isBlock ? (
            <code className={className}>{children}</code>
          ) : (
            <code className={CODE_CLASSES.inline}>{children}</code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
