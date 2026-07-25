import { defineConfig } from '@playwright/test';

// Vite dev serves on :5173; allow overriding via E2E_BASE_URL (e.g. a preview
// deploy). The webServer auto-starts `pnpm dev` so CI doesn't need a manually
// managed server; locally it reuses one already running.
const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  timeout: 60_000,
  use: {
    baseURL,
    channel: 'chrome',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
