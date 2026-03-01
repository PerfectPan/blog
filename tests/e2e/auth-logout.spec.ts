import { expect, test } from '@playwright/test';

function createUniqueEmail(): string {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `e2e-logout-${suffix}@example.com`;
}

test('signup then logout returns to guest header state', async ({ page }) => {
  await page.goto('/signup');

  await page.getByLabel('Name').fill('E2E Logout');
  await page.getByLabel('Email').fill(createUniqueEmail());
  await page.getByLabel('Password').fill('Playwright!12345');
  await page.getByRole('button', { name: 'Sign Up' }).click();

  await page.waitForURL('**/blog');
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();

  await page.getByRole('link', { name: 'Logout' }).click();

  await page.waitForURL('**/blog');
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Logout' })).toHaveCount(0);
});
