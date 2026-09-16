import { expect, type Page, test } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'claude-verify@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Test12345!';

async function loginAsAdmin(page: Page) {
  await page.goto('/signup', { waitUntil: 'domcontentloaded' });
  await page.locator('#name').fill('Claude Verify');
  await page.locator('#email').fill(ADMIN_EMAIL);
  await page.locator('#password').fill(ADMIN_PASSWORD);
  await page.locator('form button[type="submit"]').click();
  const loggedIn = page.getByTestId('nav-logout');
  try {
    await expect(loggedIn).toBeVisible({ timeout: 8000 });
  } catch {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.locator('#email').fill(ADMIN_EMAIL);
    await page.locator('#password').fill(ADMIN_PASSWORD);
    await page.locator('form button[type="submit"]').click();
    await expect(loggedIn).toBeVisible({ timeout: 15000 });
  }
}

test('editor controls are inert while scripts are held back', async ({
  page,
}) => {
  await loginAsAdmin(page);

  await page.route('**/*', (route) => {
    if (route.request().resourceType() === 'script') {
      return route.abort();
    }
    return route.continue();
  });

  await page.goto('/admin/new', { waitUntil: 'commit' });
  const title = page.getByPlaceholder('文章标题');
  await expect(title).toBeVisible();

  await expect(title).toBeDisabled();
  await expect(page.getByPlaceholder('my-post')).toBeDisabled();
  await expect(page.getByPlaceholder(/Markdown/)).toBeDisabled();
  await expect(page.getByRole('combobox', { name: '可见性' })).toBeDisabled();
  await expect(page.getByRole('combobox', { name: '状态' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '保存' })).toBeDisabled();
});

test('editor saves a post once the script gate releases hydration', async ({
  page,
}) => {
  await loginAsAdmin(page);

  // Hold scripts so the disabled-state assertions cannot race hydration.
  let releaseScripts = () => {};
  const released = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  try {
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() === 'script') {
        await released;
      }
      return route.continue();
    });

    await page.goto('/admin/new', { waitUntil: 'commit' });
    const title = page.getByPlaceholder('文章标题');
    await expect(title).toBeVisible();
    await expect(title).toBeDisabled();
    await expect(page.getByRole('button', { name: '保存' })).toBeDisabled();

    releaseScripts();
    await expect(title).toBeEnabled({ timeout: 30000 });

    // Keep this slug separate from admin-flow, which runs concurrently.
    const slug = 'e2e-hydration-gate-post';
    const titleText = 'E2E hydration gate post';
    await title.fill(titleText);
    await page.getByPlaceholder('my-post').fill(slug);
    await page.getByPlaceholder(/Markdown/).fill('# E2E gate body');

    await page.getByRole('button', { name: '保存' }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText(titleText)).toBeVisible();

    await page.goto(`/blog/${slug}`);
    await expect(page.getByText('E2E gate body')).toBeVisible();
  } finally {
    releaseScripts();
  }
});
