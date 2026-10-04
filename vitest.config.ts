import { defineConfig } from 'vitest/config';

// Use the Node test runner for shared logic and web modules with mocked D1
// bindings, without loading the web app's Cloudflare Vite configuration.
export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'apps/web/tests/**/*.test.ts'],
    environment: 'node',
  },
});
