import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function previewTarget(branch, pullRequestNumber) {
  if (!branch || branch === 'HEAD' || branch === 'master') {
    throw new Error('A non-production branch is required for a Preview');
  }
  if (pullRequestNumber !== undefined) {
    if (
      !/^[1-9]\d*$/.test(String(pullRequestNumber)) ||
      !Number.isSafeInteger(Number(pullRequestNumber))
    ) {
      throw new Error('Invalid pull request number');
    }
    const name = `pr-${pullRequestNumber}`;
    return { name, url: `https://${name}.preview.perfectpan.org` };
  }
  const slug =
    branch
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40)
      .replace(/-$/, '') || 'branch';
  // Keep branches such as feature/a and feature-a on different Preview URLs.
  const hash = createHash('sha256').update(branch).digest('hex').slice(0, 8);
  const name = `${slug}-${hash}`;
  return { name, url: `https://${name}.preview.perfectpan.org` };
}

export async function findPullRequestNumber(branch, fetcher = fetch) {
  const url = new URL('https://api.github.com/repos/PerfectPan/blog/pulls');
  url.search = new URLSearchParams({
    state: 'open',
    head: `PerfectPan:${branch}`,
    base: 'master',
    per_page: '100',
  }).toString();
  const response = await fetcher(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'blog-preview-build',
    },
    signal: AbortSignal.timeout(30_000),
  });
  // A failed lookup is not evidence that the branch has no PR.
  if (!response.ok)
    throw new Error(`GitHub PR lookup returned ${response.status}`);
  const pulls = await response.json();
  if (!Array.isArray(pulls)) throw new Error('Invalid GitHub PR response');
  const matches = pulls.filter(
    (pr) =>
      pr.state === 'open' &&
      pr.head?.ref === branch &&
      pr.head?.repo?.full_name === 'PerfectPan/blog' &&
      pr.base?.ref === 'master',
  );
  if (matches.length > 1)
    throw new Error('Multiple open PRs match this branch');
  return matches[0]?.number;
}

export function cleanupTargets(branch, pullRequestNumber) {
  if (!pullRequestNumber)
    throw new Error('PR cleanup requires its event number');
  return [previewTarget(branch, pullRequestNumber), previewTarget(branch)];
}

export function assertPreviewIsolation(config) {
  const production = config.d1_databases?.find((db) => db.binding === 'DB');
  const preview = config.previews?.d1_databases?.find(
    (db) => db.binding === 'DB',
  );
  const productionBucket = config.r2_buckets?.find(
    (bucket) => bucket.binding === 'MEDIA_BUCKET',
  );
  const previewBucket = config.previews?.r2_buckets?.find(
    (bucket) => bucket.binding === 'MEDIA_BUCKET',
  );
  if (
    !production?.database_id ||
    !preview?.database_id ||
    !preview.database_name ||
    production.database_id === preview.database_id ||
    production.database_name === preview.database_name ||
    !productionBucket?.bucket_name ||
    !previewBucket?.bucket_name ||
    productionBucket.bucket_name === previewBucket.bucket_name
  ) {
    throw new Error(
      'Preview DB and MEDIA_BUCKET must be explicitly separate from production',
    );
  }
}

function wrangler(args) {
  const result = spawnSync('pnpm', ['exec', 'wrangler', ...args], {
    encoding: 'utf8',
  });
  process.stdout.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');
  if (result.error) throw result.error;
  return result;
}

async function main() {
  const command = process.argv[2];
  if (!['deploy', 'delete'].includes(command))
    throw new Error('usage: preview-build.mjs <deploy|delete>');
  const branch =
    process.env.WORKERS_CI_BRANCH ||
    process.env.GITHUB_HEAD_REF ||
    execFileSync('git', ['branch', '--show-current'], {
      encoding: 'utf8',
    }).trim();
  if (command === 'delete') {
    for (const { name } of cleanupTargets(
      branch,
      process.env.PREVIEW_PR_NUMBER,
    )) {
      const result = wrangler([
        'preview',
        'delete',
        '--name',
        name,
        '--skip-confirmation',
      ]);
      // A closed PR may never have deployed; permission/network errors still fail.
      if (
        result.status !== 0 &&
        !/Preview not found\. \[code: 10025\]/.test(
          `${result.stdout}\n${result.stderr}`,
        )
      ) {
        throw new Error('Preview cleanup failed');
      }
    }
    return;
  }
  previewTarget(branch);
  const pullRequestNumber = await findPullRequestNumber(branch);
  const { name, url } = previewTarget(branch, pullRequestNumber);
  if (pullRequestNumber)
    process.env.PULL_REQUEST_NUMBER = String(pullRequestNumber);
  const { unstable_readConfig } = await import('wrangler');
  assertPreviewIsolation(unstable_readConfig({ config: 'wrangler.jsonc' }));
  assertPreviewIsolation(
    unstable_readConfig({ config: 'dist/server/wrangler.json' }),
  );
  execFileSync(process.execPath, ['scripts/preview-db.mjs', 'migrate'], {
    stdio: 'inherit',
  });
  const result = wrangler([
    'preview',
    '-c',
    'dist/server/wrangler.json',
    '--name',
    name,
    '--var',
    `APPS_WEB_URL:${url}`,
    '--json',
  ]);
  if (result.status !== 0) throw new Error('Preview deployment failed');
  const jsonStart = result.stdout.search(/^\{/m);
  if (jsonStart < 0)
    throw new Error('Wrangler did not return Preview metadata');
  const metadata = JSON.parse(result.stdout.slice(jsonStart));
  if (!metadata.preview?.urls?.includes(url))
    throw new Error('Preview URL does not match APPS_WEB_URL');
  for (const path of ['/login', '/api/auth/get-session']) {
    const response = await fetch(`${url}${path}`, {
      redirect: 'error',
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok)
      throw new Error(`Preview probe ${path} returned ${response.status}`);
    await response.arrayBuffer();
  }
  console.log(`Preview verified: ${url}`);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
