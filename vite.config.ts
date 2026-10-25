import { defineConfig } from 'vite-plus';

// Repo-wide lint config for `vp lint` (Vite+ / Oxlint). The web app keeps its
// own build config in apps/web/vite.config.ts; this root config only carries
// the lint block so `vp lint` from the workspace root covers apps/ and
// packages/ with one tool. Biome stays as the formatter (`biome check --write`
// in lint-staged), so its linter is disabled — linting is vp's job.
export default defineConfig({
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
