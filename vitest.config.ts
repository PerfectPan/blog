import { defineConfig } from 'vitest/config';

// Root test config. Only `packages/shared` ships pure unit tests today; scoping
// `include` here keeps vitest from picking up apps/web's Cloudflare vite config
// (which would try to run its server entry under node).
export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts'],
    environment: 'node',
  },
});
