import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assertPreviewIsolation, previewTarget } from './preview-build.mjs';

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
