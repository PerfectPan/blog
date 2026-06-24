import { expect, test } from '@playwright/test';

// Full-chain smoke: log in as admin -> create a post via the custom admin form
// -> verify it renders on the public blog. Run against a live server with
// E2E_BASE_URL (e.g. the local wrangler dev worker on :8787).

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'claude-verify@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Test12345!';

test('admin can create a post that appears on the blog', async ({ page }) => {
  const slug = 'e2e-admin-post';
  const title = 'E2E admin post';

  // 1. Sign up (autoSignIn logs us straight in). If the account already exists
  //    from a previous run, fall back to logging in.
  await page.goto('/signup', { waitUntil: 'domcontentloaded' });
  await page.locator('#name').fill('Claude Verify');
  await page.locator('#email').fill(ADMIN_EMAIL);
  await page.locator('#password').fill(ADMIN_PASSWORD);
  await page.locator('form button[type="submit"]').click();

  const loggedIn = page.getByRole('link', { name: /logout/i });
  try {
    await expect(loggedIn).toBeVisible({ timeout: 8000 });
  } catch {
    // Account exists already — log in instead.
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.locator('#email').fill(ADMIN_EMAIL);
    await page.locator('#password').fill(ADMIN_PASSWORD);
    await page.locator('form button[type="submit"]').click();
    await expect(loggedIn).toBeVisible({ timeout: 15000 });
  }

  // 2. Visit /blog once to trigger first-admin promotion, then open the editor.
  // The server-side admin guard reads the (now promoted) role from D1.
  await page.goto('/blog', { waitUntil: 'domcontentloaded' });
  await page.goto('/admin/new', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/admin\/new/);

  // 3. Fill the editor and save.
  await page.getByLabel('Title').fill(title);
  await page.getByLabel('Slug').fill(slug);
  await page
    .getByLabel(/Body/)
    .fill('# E2E body\n\nWritten by the Playwright admin smoke test.');
  await page.getByRole('button', { name: '保存' }).click();

  // 4. Back on the admin list, the post is there.
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText(title)).toBeVisible();

  // 5. It renders on the public blog.
  await page.goto(`/blog/${slug}`);
  await expect(page.getByText('E2E body')).toBeVisible();
});
