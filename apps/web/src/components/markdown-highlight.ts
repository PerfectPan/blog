import type {
  HighlightRequest,
  HighlightResponse,
} from './markdown-highlight.worker.js';

let worker: Worker | undefined;
let nextId = 0;
const pending = new Map<number, (html: string | null) => void>();

function getWorker(): Worker {
  if (!worker) {
    const instance = new Worker(
      new URL('./markdown-highlight.worker.ts', import.meta.url),
      { type: 'module' },
    );
    instance.onmessage = (event: MessageEvent<HighlightResponse>) => {
      pending.get(event.data.id)?.(event.data.html);
    };
    const fail = () => {
      if (worker !== instance) return;
      instance.terminate();
      worker = undefined;
      for (const finish of pending.values()) finish(null);
    };
    instance.onerror = fail;
    instance.onmessageerror = fail;
    worker = instance;
  }
  return worker;
}

/** Reuse one browser worker, but release callbacks as soon as their markup is
 *  replaced. A response from a previous article must never touch the new DOM. */
export function highlightCode(
  code: string,
  lang: string,
  signal: AbortSignal,
): Promise<string | null> {
  if (signal.aborted) return Promise.resolve(null);
  return new Promise((resolve) => {
    const id = nextId++;
    const finish = (html: string | null) => {
      pending.delete(id);
      signal.removeEventListener('abort', abort);
      resolve(html);
    };
    const abort = () => finish(null);
    pending.set(id, finish);
    signal.addEventListener('abort', abort, { once: true });
    try {
      getWorker().postMessage({ id, code, lang } satisfies HighlightRequest);
    } catch {
      finish(null);
    }
  });
}
