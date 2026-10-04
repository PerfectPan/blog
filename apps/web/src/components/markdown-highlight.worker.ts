import type { HighlighterCore, LanguageInput } from 'shiki/core';

let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter() {
  // Reuse the engine and loaded grammars across articles and editor updates.
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

/** Common fence aliases → canonical grammar key. Without this, `js`/`ts`/…
 *  fall through to plain text even though their grammar highlights them. */
const LANG_ALIASES: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  mts: 'typescript',
  yml: 'yaml',
  md: 'markdown',
  'c++': 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  hh: 'cpp',
  hxx: 'cpp',
  h: 'c',
  golang: 'go',
  py: 'python',
  rs: 'rust',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  shellsession: 'bash',
};

/** Canonical grammar key for a fence info string, or null for plain text. */
function resolveLangKey(lang: string): string | null {
  return LANG_IMPORTS[lang] ? lang : (LANG_ALIASES[lang] ?? null);
}

export type HighlightRequest = { id: number; code: string; lang: string };
export type HighlightResponse = { id: number; html: string | null };

self.addEventListener(
  'message',
  async (event: MessageEvent<HighlightRequest>) => {
    const { id, code, lang } = event.data;
    let html: string | null = null;
    try {
      const langKey = resolveLangKey(lang);
      if (langKey) {
        const highlighter = await getHighlighter();
        if (!highlighter.getLoadedLanguages().includes(langKey)) {
          const mod = (await LANG_IMPORTS[langKey]()) as {
            default: LanguageInput;
          };
          await highlighter.loadLanguage(mod.default);
        }
        html = highlighter.codeToHtml(code, {
          lang: langKey,
          themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
        });
      }
    } catch {
      // Plain code remains readable if a grammar chunk or highlighting fails.
    }
    self.postMessage({ id, html } satisfies HighlightResponse);
  },
);
