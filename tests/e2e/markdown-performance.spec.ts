import { expect, type Page, test } from '@playwright/test';

async function expectHighlighted(page: Page, selector: string) {
  const code = page.locator(selector);
  await code.scrollIntoViewIfNeeded();
  await expect(code).toHaveAttribute('data-highlighted', 'true');
  await expect(code.locator('span[style*="color"]').first()).toBeAttached();
}

test('code is highlighted in one worker on demand and after search navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/blog/codeforces-round605');
  await page.waitForSelector('html[data-hydrated]');

  const blocks = page.locator('.md pre code');
  await expect(blocks).toHaveCount(3);
  await blocks.first().scrollIntoViewIfNeeded();
  // Cold Vite compilation includes the compiler and worker module graphs.
  await expect(blocks.first()).toHaveAttribute('data-highlighted', 'true', {
    timeout: 15000,
  });
  await expect(
    blocks.first().locator('span[style*="color"]').first(),
  ).toBeAttached();
  // Waiting for the first block proves enhancement is running, while the last
  // block is still outside the intersection margin and remains plain text.
  expect(
    await blocks.last().evaluate((el) => el.getBoundingClientRect().top),
  ).toBeGreaterThan(1200);
  await expect(blocks.last()).not.toHaveAttribute('data-highlighted', 'true');
  await blocks.last().scrollIntoViewIfNeeded();
  await expect(blocks.last()).toHaveAttribute('data-highlighted', 'true');
  await expect(
    blocks.last().locator('span[style*="color"]').first(),
  ).toBeAttached();
  // Cold Vite dependency optimization can reload the initial document. Compare
  // the live worker across client navigation instead of counting past documents.
  const workers = page
    .workers()
    .filter((worker) => worker.url().includes('markdown-highlight.worker'));
  expect(workers).toHaveLength(1);
  const highlightWorker = workers[0];

  await page.getByRole('button', { name: '搜索文章（Cmd+K）' }).click();
  await page.locator('[data-slot="command-input"]').fill('blocks');
  await page.locator('[data-slot="command-item"]').first().click();
  await expect(page).toHaveURL(/\/blog\/blocks$/);
  const jsBlocks = page.locator('.md pre code.language-js');
  await expect(jsBlocks).toHaveCount(2);
  for (const block of await jsBlocks.all()) {
    await block.scrollIntoViewIfNeeded();
    await expect(block.locator('span[style*="color"]').first()).toBeAttached();
  }
  const nextWorkers = page
    .workers()
    .filter((worker) => worker.url().includes('markdown-highlight.worker'));
  expect(nextWorkers).toHaveLength(1);
  expect(nextWorkers[0]).toBe(highlightWorker);
});

async function loginAsAdmin(page: Page) {
  const email = process.env.E2E_ADMIN_EMAIL ?? 'claude-verify@example.com';
  const password = process.env.E2E_ADMIN_PASSWORD ?? 'Test12345!';
  await page.goto('/signup', { waitUntil: 'domcontentloaded' });
  await page.locator('#name').fill('Claude Verify');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('form button[type="submit"]').click();
  try {
    await expect(page.getByTestId('nav-logout')).toBeVisible({ timeout: 8000 });
  } catch {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByTestId('nav-logout')).toBeVisible();
  }
}

test('editor skips hidden preview requests and highlights refreshed aliases', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loginAsAdmin(page);
  await page.goto('/admin/new');
  const editor = page.getByPlaceholder(/Markdown/);
  await editor.fill('```js\nconst initial = 1;\n```');
  await expectHighlighted(page, '.md pre code.language-js');

  await page.getByRole('button', { name: '编辑', exact: true }).click();
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/_serverFn/'))
      requests.push(request.url());
  });
  const aliases = ['js', 'ts', 'sh', 'shell', 'c++'];
  const samples = [
    'const next = 2;',
    'const next: number = 2;',
    'echo "$HOME"',
    'echo "$HOME"',
    'int next = 2;',
  ];
  await editor.fill(
    aliases
      .map((lang, index) => `\`\`\`${lang}\n${samples[index]}\n\`\`\``)
      .join('\n\n'),
  );
  // Observe beyond the 250ms debounce window: write-only mode must not make
  // a renderer RPC even when the value changes.
  await page.waitForTimeout(600);
  expect(requests).toHaveLength(0);
  await page.getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.locator('.md pre code')).toHaveCount(aliases.length);
  for (const lang of aliases)
    await expectHighlighted(page, `.md pre code[class="language-${lang}"]`);
  await expect(page.locator('.md')).not.toContainText('initial');
  expect(requests).toHaveLength(1);
});
