import { afterEach, beforeEach, expect, it, vi } from 'vitest';

class TestWorker {
  static instances: TestWorker[] = [];
  onmessage?: (event: { data: { id: number; html: string | null } }) => void;
  onerror?: () => void;
  onmessageerror?: () => void;
  requests: { id: number; code: string; lang: string }[] = [];
  terminate = vi.fn();
  constructor() {
    TestWorker.instances.push(this);
  }
  postMessage(data: { id: number; code: string; lang: string }) {
    this.requests.push(data);
  }
  reply(index: number, html: string) {
    this.onmessage?.({ data: { id: this.requests[index].id, html } });
  }
}

beforeEach(() => {
  vi.resetModules();
  TestWorker.instances = [];
  vi.stubGlobal('Worker', TestWorker);
});
afterEach(() => vi.unstubAllGlobals());

it('reuses a worker and matches responses to their own code blocks', async () => {
  const { highlightCode } = await import(
    '../src/components/markdown-highlight.js'
  );
  const signal = new AbortController().signal;
  const first = highlightCode('first', 'js', signal);
  const second = highlightCode('second', 'sh', signal);
  expect(TestWorker.instances).toHaveLength(1);
  const worker = TestWorker.instances[0];
  worker.reply(1, '<pre>second</pre>');
  worker.reply(0, '<pre>first</pre>');
  expect(await first).toBe('<pre>first</pre>');
  expect(await second).toBe('<pre>second</pre>');
});

it('releases cancelled work immediately and ignores late results after navigation', async () => {
  const { highlightCode } = await import(
    '../src/components/markdown-highlight.js'
  );
  const oldPage = new AbortController();
  const oldResult = highlightCode('old', 'cpp', oldPage.signal);
  oldPage.abort();
  expect(await oldResult).toBeNull();
  const currentResult = highlightCode(
    'new',
    'js',
    new AbortController().signal,
  );
  const worker = TestWorker.instances[0];
  worker.reply(0, '<pre>old</pre>');
  worker.reply(1, '<pre>new</pre>');
  expect(await currentResult).toBe('<pre>new</pre>');
});

it('leaves plain code on worker failure and can recover on the next request', async () => {
  const { highlightCode } = await import(
    '../src/components/markdown-highlight.js'
  );
  const signal = new AbortController().signal;
  const result = highlightCode('first', 'js', signal);
  TestWorker.instances[0].onerror?.();
  expect(await result).toBeNull();
  expect(TestWorker.instances[0].terminate).toHaveBeenCalledOnce();
  const retry = highlightCode('retry', 'js', signal);
  TestWorker.instances[1].reply(0, '<pre>retry</pre>');
  expect(await retry).toBe('<pre>retry</pre>');
});

it('does not start a worker for an already cancelled request', async () => {
  const { highlightCode } = await import(
    '../src/components/markdown-highlight.js'
  );
  const controller = new AbortController();
  controller.abort();
  expect(await highlightCode('old', 'js', controller.signal)).toBeNull();
  expect(TestWorker.instances).toHaveLength(0);
});
