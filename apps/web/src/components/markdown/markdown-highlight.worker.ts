import type { Theme } from '@pierre/highlights';

let enginePromise: Promise<{
  codeToHtml: typeof import('@pierre/highlights').codeToHtml;
  isSupportedLanguage: typeof import('@pierre/highlights').isSupportedLanguage;
  themes: { light: Theme; dark: Theme };
}> | null = null;

/** Diff +/- lines inherit the plain foreground in the bundled Vitesse themes;
 *  give them the red/green Shiki's Vitesse rendered. */
function withDiffColors(theme: Theme, plus: string, minus: string): Theme {
  return {
    ...theme,
    style: {
      ...theme.style,
      syntax: {
        ...theme.style.syntax,
        'diff.plus': { color: plus },
        'diff.minus': { color: minus }
      }
    }
  };
}

function getEngine() {
  // The engine compiles its WASM at import; reuse that instance across
  // articles and editor updates instead of paying the cost per message.
  enginePromise ??= (async () => {
    const [highlights, light, dark] = await Promise.all([
      import('@pierre/highlights'),
      import('@pierre/highlights/themes/vitesse-light'),
      import('@pierre/highlights/themes/vitesse-dark')
    ]);
    return {
      codeToHtml: highlights.codeToHtml,
      isSupportedLanguage: highlights.isSupportedLanguage,
      themes: {
        light: withDiffColors(light.default, '#22863a', '#b31d28'),
        dark: withDiffColors(dark.default, '#85e89d', '#fdaeb7')
      }
    };
  })();
  return enginePromise;
}

export type HighlightRequest = { id: number; code: string; lang: string };
export type HighlightResponse = { id: number; html: string | null };

const decoder = new TextDecoder();

self.addEventListener('message', async (event: MessageEvent<HighlightRequest>) => {
  const { id, code, lang } = event.data;
  let html: string | null = null;
  try {
    const engine = await getEngine();
    if (engine.isSupportedLanguage(lang)) {
      // The returned bytes view into WASM memory that the next call
      // overwrites — decode before posting the message.
      html = decoder.decode(
        engine.codeToHtml(code, {
          lang,
          themes: engine.themes,
          cssVariablePrefix: '--shiki-'
        })
      );
    }
  } catch {
    // Plain code remains readable if the engine or highlighting fails.
  }
  self.postMessage({ id, html } satisfies HighlightResponse);
});
