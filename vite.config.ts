import { fmt as sharedFmt, lint as sharedLint } from '@perfectpan/lint-config/vite-plus';
import { defineConfig } from 'vite-plus';

// Workspace-root Vite+ config: one home for the repo-wide vp settings.
// - test: node-mode unit tests for packages/ and apps/web/tests with mocked
//   D1 bindings, run via `vp test` without loading the web app's Cloudflare
//   Vite configuration.
// - fmt / lint: the shared base from @perfectpan/lint-config (same rules as
//   the other PerfectPan JS/TS repos), layered with this repo's specifics:
//   the markdown/html/yaml formatting exclusions and the @shadcn/lint
//   token rules.
// - staged: runs `vp check --fix` on staged files (replaces lint-staged).
// The web app's build config stays in apps/web/vite.config.ts.
export default defineConfig({
  staged: {
    // Typed glob (not the docs' '*'): extension-less paths such as the
    // .claude/skills/* symlinks make lint-staged fail with a git error.
    '*.{mjs,js,jsx,mts,ts,tsx,css,json}': 'vp check --fix'
  },
  test: {
    include: ['packages/**/*.test.ts', 'apps/web/tests/**/*.test.ts'],
    environment: 'node'
  },
  fmt: {
    ...sharedFmt,
    // Keep quotes single in JS and JSX on top of the shared style.
    singleQuote: true,
    jsxSingleQuote: true,
    // Code files only: markdown docs (mostly Chinese prose), report HTML and
    // CI YAML were never auto-formatted, and reflowing them would create
    // unrelated churn.
    ignorePatterns: ['**/routeTree.gen.ts', '**/*.md', '**/*.html', '**/*.yml', '**/*.yaml', 'docs/reports/**']
  },
  lint: {
    ...sharedLint,
    jsPlugins: ['@shadcn/lint'],
    settings: {
      shadcn: {
        mergeFunctions: ['cn']
      }
    },
    rules: {
      ...sharedLint.rules,
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
            'border-[color-mix(in_srgb,var(--destructive)_45%,transparent)]'
          ]
        }
      ],
      'shadcn/no-raw-colors': 'error',
      'shadcn/no-unknown-classes': 'error',
      'shadcn/require-static-classes': 'error'
    },
    // The shared base enables react/no-multi-comp inside an override, which
    // beats top-level rules; edit that override in place to keep it enabled
    // except for the shadcn-generated ui primitives, which export a family
    // of related components from one file by design.
    overrides: sharedLint.overrides.map((o) =>
      'react/no-multi-comp' in o.rules
        ? {
            ...o,
            excludeFiles: [...(o.excludeFiles ?? []), '**/src/components/ui/**'],
            rules: { ...o.rules, 'react/no-multi-comp': 'error' }
          }
        : o
    ),
    ignorePatterns: [
      '**/dist/**',
      '**/.wrangler/**',
      '**/routeTree.gen.ts',
      '**/worker-configuration.d.ts',
      'test-results/**',
      'public/**'
    ]
  }
});
