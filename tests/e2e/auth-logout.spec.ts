import { expect, test } from '@playwright/test';

function createUniqueEmail(): string {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `e2e-logout-${suffix}@example.com`;
}

test('signup then logout returns to guest header state', async ({ page }) => {
  await page.goto('/signup', { waitUntil: 'domcontentloaded' });

  // Form anchors are theme-stable: field ids on /signup + the submit button.
  // Header anchors use data-testid because each UX theme words them
  // differently (login / 入会 / SIGN IN …).
  await page.locator('#name').fill('E2E Logout');
  await page.locator('#email').fill(createUniqueEmail());
  await page.locator('#password').fill('Playwright!12345');
  await page.locator('form button[type="submit"]').click();

  await page.waitForURL('**/blog');
  await expect(page.getByTestId('nav-logout')).toBeVisible();

  await page.getByTestId('nav-logout').click();

  await page.waitForURL('**/blog');
  await expect(page.getByTestId('nav-login')).toBeVisible();
  await expect(page.getByTestId('nav-logout')).toHaveCount(0);
});
