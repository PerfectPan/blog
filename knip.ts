import { knip } from '@perfectpan/lint-config/knip';
import type { KnipConfig } from 'knip';

// apps/web is a Cloudflare Workers app built through its own Vite config, and
// packages/shared exports its API from src/index.ts. Playwright covers the e2e
// specs, and content/ holds markdown that no TypeScript import reaches.
const config: KnipConfig = {
  ...knip,
  workspaces: {
    '.': {
      project: ['tests/e2e/**/*.ts']
    },
    'apps/web': {
      // CSS is in project so knip follows @import for tailwindcss and tw-animate-css.
      project: ['src/**/*.{ts,tsx,css}!', 'scripts/**/*', 'tests/**/*.ts']
    }
  }
};

export default config;
