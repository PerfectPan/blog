import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  publicDir: '../../public',
  worker: { format: 'es' },
  // Fresh value per build run. page-cache.ts folds it into the article-page
  // Cache API namespace, so each deployment starts with an empty edge cache —
  // a cached page can never outlive the asset hashes it references.
  define: {
    __ARTICLE_CACHE_BUILD_ID__: JSON.stringify(`b${Date.now().toString(36)}`),
  },
  plugins: [
    tsConfigPaths(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    viteReact(),
    tailwindcss(),
  ],
  server: {
    warmup: {
      // Warm the SSR module graph at dev-server start, before the first
      // request (belt-and-braces on top of the @tanstack/* patch upgrade for
      // the dev-mode server-fn deadlock: cold parallel first hits used to
      // race the `?tss-serverfn-split` provider-module re-transforms and
      // hang loader-side server-fn calls forever). Warming routes + lib —
      // and the provider split variants explicitly, since they are only
      // reachable through the resolver's dynamic import — also cuts the
      // first-hit latency for `pnpm dev` and the Playwright gate.
      ssrFiles: [
        'src/routes/**/*.{ts,tsx}',
        'src/lib/**/*.ts',
        'src/lib/admin-service.ts?tss-serverfn-split',
        'src/lib/blog-service.ts?tss-serverfn-split',
        'src/lib/comments-service.ts?tss-serverfn-split',
        'src/lib/locale-service.ts?tss-serverfn-split',
      ],
    },
  },
});
