import { defineConfig } from '@playwright/test';

// Vite dev serves on :5173; allow overriding via E2E_BASE_URL (e.g. a preview
// deploy). The webServer auto-starts `pnpm dev` so CI doesn't need a manually
// managed server; locally it reuses one already running.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  timeout: 120_000,
  use: {
    baseURL,
    channel: 'chrome',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: baseURL,
    // CI starts its own dev server in a visible background step (so the logs are
    // debuggable); reuse it instead of spawning a second one.
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
