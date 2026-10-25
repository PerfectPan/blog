import { defineConfig } from 'vite-plus';

// Workspace-root Vite+ config: one home for the repo-wide vp settings.
// - test: node-mode unit tests for packages/ and apps/web/tests with mocked
//   D1 bindings, run via `vp test` without loading the web app's Cloudflare
//   Vite configuration.
// - fmt: Oxfmt, tuned to keep the previous Biome style.
// - lint: Oxlint with the @shadcn/lint token rules.
// - staged: runs `vp check --fix` on staged files (replaces lint-staged).
// The web app's build config stays in apps/web/vite.config.ts.
export default defineConfig({
  staged: {
    // Typed glob (not the docs' '*'): extension-less paths such as the
    // .claude/skills/* symlinks make lint-staged fail with a git error.
    '*.{mjs,js,jsx,mts,ts,tsx,css,json}': 'vp check --fix',
  },
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
    include: ['packages/**/*.test.ts', 'apps/web/tests/**/*.test.ts'],
    environment: 'node',
  },
  fmt: {
    // Match the previous Biome style: single quotes in JS and JSX, 2-space
    // indent, 80-col width (Oxfmt defaults already cover the rest).
    singleQuote: true,
    jsxSingleQuote: true,
    printWidth: 80,
    // Keep parity with the old Biome scope: code files only. Markdown docs
    // (mostly Chinese prose), report HTML and CI YAML were never
    // auto-formatted, and reflowing them would create unrelated churn.
    ignorePatterns: [
      '**/routeTree.gen.ts',
      '**/*.md',
      '**/*.html',
      '**/*.yml',
      '**/*.yaml',
      'docs/reports/**',
    ],
  },
  lint: {
    jsPlugins: ['@shadcn/lint'],
    settings: {
      shadcn: {
        mergeFunctions: ['cn'],
      },
    },
    rules: {
      'shadcn/no-arbitrary-values': [
        'error',
        {
          allow: [
            'layout',
            'transition',
            'shadow',
            'text-[min(',
            'text-[0.85em]',
            'text-[min(11px,calc((100vw-32px)/34.5))]',
            'bg-[#e5544b]',
            'bg-[#d8a03c]',
            'bg-[#47a258]',
            'bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]',
            'hover:bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)]',
            'border-[color-mix(in_srgb,var(--primary)_50%,transparent)]',
            'border-[color-mix(in_srgb,var(--destructive)_45%,transparent)]',
          ],
        },
      ],
      'shadcn/no-raw-colors': 'error',
      'shadcn/no-unknown-classes': 'error',
      'shadcn/require-static-classes': 'error',
    },
    ignorePatterns: [
      '**/dist/**',
      '**/.wrangler/**',
      '**/routeTree.gen.ts',
      '**/worker-configuration.d.ts',
      'test-results/**',
      'public/**',
    ],
  },
});
