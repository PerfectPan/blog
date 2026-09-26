import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  assertPreviewIsolation,
  cleanupTargets,
  findPullRequestNumber,
  previewTarget,
} from './preview-build.mjs';

test('PR previews use the PR number and cleanup also covers the branch fallback', () => {
  const target = {
    name: 'pr-141',
    url: 'https://pr-141.preview.perfectpan.org',
  };
  assert.deepEqual(previewTarget('feature/login', 141), target);
  assert.deepEqual(cleanupTargets('feature/login', '141'), [
    target,
    previewTarget('feature/login'),
  ]);
  assert.throws(() => cleanupTargets('feature/login', undefined));
  for (const number of [
    0,
    -1,
    '1/2',
    '1e2',
    '01',
    'x',
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    assert.throws(() => previewTarget('feature/login', number));
  }
});

test('PR lookup matches an open same-repository branch targeting master', async () => {
  const matching = {
    number: 141,
    state: 'open',
    head: { ref: 'feature/login', repo: { full_name: 'PerfectPan/blog' } },
    base: { ref: 'master' },
  };
  const mock = (data) => async (url) => {
    assert.equal(url.searchParams.get('head'), 'PerfectPan:feature/login');
    return { ok: true, json: async () => data };
  };
  assert.equal(
    await findPullRequestNumber('feature/login', mock([matching])),
    141,
  );
  assert.equal(
    await findPullRequestNumber(
      'feature/login',
      mock([
        { ...matching, state: 'closed' },
        {
          ...matching,
          head: { ref: 'feature/login', repo: { full_name: 'fork/blog' } },
        },
        { ...matching, base: { ref: 'other' } },
      ]),
    ),
    undefined,
  );
  await assert.rejects(
    findPullRequestNumber('feature/login', mock([matching, matching])),
    /Multiple/,
  );
  await assert.rejects(
    findPullRequestNumber('feature/login', async () => ({
      ok: false,
      status: 403,
    })),
    /403/,
  );
});

test('preview names are stable DNS labels and distinguish normalized branches', () => {
  const first = previewTarget('feature/login');
  assert.deepEqual(first, previewTarget('feature/login'));
  assert.notEqual(first.name, previewTarget('feature-login').name);
  assert.match(first.name, /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/);
  assert.equal(
    new URL(first.url).hostname,
    `${first.name}.preview.perfectpan.org`,
  );
  assert.ok(previewTarget('x'.repeat(200)).name.length <= 63);
  assert.notEqual(first.name, previewTarget('Feature/login').name);
});

test('production, detached and missing branches cannot deploy previews', () => {
  for (const branch of ['master', 'HEAD', '', undefined]) {
    assert.throws(() => previewTarget(branch));
  }
});

const config = {
  d1_databases: [
    { binding: 'DB', database_name: 'production', database_id: 'prod-id' },
  ],
  r2_buckets: [{ binding: 'MEDIA_BUCKET', bucket_name: 'production-media' }],
  previews: {
    d1_databases: [
      { binding: 'DB', database_name: 'preview', database_id: 'preview-id' },
    ],
    r2_buckets: [{ binding: 'MEDIA_BUCKET', bucket_name: 'preview-media' }],
  },
};

test('preview deployment rejects absent or production data bindings', () => {
  assert.doesNotThrow(() => assertPreviewIsolation(config));
  assert.throws(() => assertPreviewIsolation({}));
  for (const field of ['database_id', 'database_name']) {
    const unsafe = structuredClone(config);
    unsafe.previews.d1_databases[0][field] = config.d1_databases[0][field];
    assert.throws(() => assertPreviewIsolation(unsafe));
  }
  const unsafe = structuredClone(config);
  unsafe.previews.r2_buckets[0].bucket_name = config.r2_buckets[0].bucket_name;
  assert.throws(() => assertPreviewIsolation(unsafe));
});
