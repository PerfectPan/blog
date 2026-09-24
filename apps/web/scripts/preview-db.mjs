#!/usr/bin/env node
/**
 * Maintain the Worker Previews D1 (`previews.d1_databases` in wrangler.jsonc).
 *
 *   node scripts/preview-db.mjs migrate     apply migrations/ to the preview DB
 *   node scripts/preview-db.mjs sync-posts  replace its posts with production's
 *                                            public, published posts
 *
 * `wrangler d1` only resolves databases from the top-level `d1_databases`, so
 * each command runs against a throwaway config holding just the preview DB.
 * sync-posts copies the `post` table only, and only public published rows:
 * every other table holds accounts, sessions or comments, and non-public
 * posts can carry a password.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { unstable_readConfig } from 'wrangler';

const POST_COLUMNS = [
  'slug',
  'title',
  'description',
  'body',
  'visibility',
  'status',
  'tags',
  'publishedAt',
  'createdAt',
  'updatedAt',
];

const config = unstable_readConfig({ config: 'wrangler.jsonc' });
const production = config.d1_databases.find((d) => d.binding === 'DB');
const preview = config.previews?.d1_databases?.find((d) => d.binding === 'DB');
if (!production || !preview) {
  throw new Error(
    'wrangler.jsonc needs a DB binding at the top level and in previews',
  );
}

const work = mkdtempSync(join(tmpdir(), 'preview-db-'));
const previewConfig = join(work, 'wrangler.json');
writeFileSync(
  previewConfig,
  JSON.stringify({
    name: config.name,
    d1_databases: [
      {
        ...preview,
        migrations_dir: resolve(preview.migrations_dir ?? 'migrations'),
      },
    ],
  }),
);

const wrangler = (args, options = {}) =>
  execFileSync('pnpm', ['exec', 'wrangler', ...args], {
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    env: { ...process.env, CI: '1' },
  });

const sqlString = (value) =>
  value == null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`;

function syncPosts() {
  const out = wrangler(
    [
      'd1',
      'execute',
      production.database_name,
      '--remote',
      '--json',
      '--command',
      `SELECT ${POST_COLUMNS.map((c) => `"${c}"`).join(', ')} FROM "post" WHERE "visibility" = 'public' AND "status" = 'published'`,
    ],
    { capture: true },
  );
  const rows = JSON.parse(out)[0].results;
  const statements = [
    'DELETE FROM "post";',
    ...rows.map(
      (row) =>
        `INSERT INTO "post" (${POST_COLUMNS.map((c) => `"${c}"`).join(', ')}) VALUES (${POST_COLUMNS.map((c) => sqlString(row[c])).join(', ')});`,
    ),
  ];
  const file = join(work, 'posts.sql');
  writeFileSync(file, `${statements.join('\n')}\n`);
  wrangler([
    'd1',
    'execute',
    preview.database_name,
    '--remote',
    '--file',
    file,
    '-c',
    previewConfig,
  ]);
  console.log(
    `Copied ${rows.length} public posts into ${preview.database_name}.`,
  );
}

try {
  const command = process.argv[2];
  if (command === 'migrate') {
    wrangler([
      'd1',
      'migrations',
      'apply',
      preview.database_name,
      '--remote',
      '-c',
      previewConfig,
    ]);
  } else if (command === 'sync-posts') {
    syncPosts();
  } else {
    console.error('usage: node scripts/preview-db.mjs <migrate|sync-posts>');
    process.exitCode = 1;
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
