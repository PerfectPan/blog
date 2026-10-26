import { expect, test } from '@playwright/test';

// Read-only smoke against a DEPLOYED preview (E2E_BASE_URL pointing at
// https://<branch>.preview.perfectpan.org). It complements the local-D1
// e2e suite by exercising the real Workers Builds artifact on the edge.
// Everything here must stay read-only: the preview D1 (blog-preview) is
// shared by all PRs, so signup / post-creation flows must never run here.
const base = process.env.E2E_BASE_URL ?? '';
const isRemote = /^https?:\/\//.test(base) && !/(localhost|127\.0\.0\.1)/.test(base);
test.skip(!isRemote, 'only runs against a deployed E2E_BASE_URL');

// A long-lived public math post. If it ever 404s (content drift), the test
// skips instead of failing the pipeline on an unrelated content change.
const MATH_POST = '/blog/2019ICPC-NanchangG';

function collectErrors(page: import('@playwright/test').Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') {
      errors.push(`console: ${m.text()}`);
    }
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

test('key pages render and hydrate without console errors', async ({ page }) => {
  const errors = collectErrors(page);
  const pages: Array<[string, RegExp]> = [
    ['/', /Home \| PerfectPan/],
    ['/blog', /Blog \| PerfectPan/],
    ['/projects', /Projects \| PerfectPan/],
    ['/about', /About \| PerfectPan/]
  ];
  for (const [path, title] of pages) {
    await page.goto(base + path, { waitUntil: 'load' });
    await expect(page).toHaveTitle(title);
    // SSR-visible HTML proves nothing; this marker proves React attached.
    await page.waitForSelector('html[data-hydrated]', { timeout: 20_000 });
  }
  // One client-side navigation proves interactivity, not just hydration.
  // 'open blog/' only exists on the home page.
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForSelector('html[data-hydrated]', { timeout: 20_000 });
  await page.getByRole('link', { name: 'open blog/' }).click();
  await page.waitForURL('**/blog');
  await expect(page).toHaveTitle(/Blog \| PerfectPan/);
  expect(errors).toEqual([]);
});

test('math article renders KaTeX without errors', async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto(base + MATH_POST, { waitUntil: 'load' });
  test.skip(response?.status() === 404, 'math post no longer present');
  await page.waitForSelector('html[data-hydrated]', { timeout: 20_000 });
  await page.waitForSelector('.katex', { timeout: 10_000 });
  // KaTeX is forced to 0.19.x via a pnpm override (rehype-katex declares
  // ^0.16); a broken render shows up as .katex-error nodes.
  expect(await page.locator('.katex-error').count()).toBe(0);
  expect(errors).toEqual([]);
});

test('search palette streams server-side results', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForSelector('html[data-hydrated]', { timeout: 20_000 });
  await page.getByRole('button', { name: '搜索文章（Cmd+K）' }).click();
  await expect(page.locator('[data-slot="dialog-content"]')).toBeVisible();
  await page.locator('[data-slot="command-input"]').fill('Codeforces');
  await expect(page.locator('[data-slot="command-item"]').first()).toBeVisible({
    timeout: 10_000
  });
  expect(errors).toEqual([]);
});
