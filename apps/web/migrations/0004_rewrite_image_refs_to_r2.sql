-- Bundle A: legacy post images move from public/images/ to R2 (MEDIA_BUCKET).
--
-- Run order matters: apply this ONLY after the new Worker is deployed to prod
-- (so /api/asset + the MEDIA_BUCKET binding are live) AND the two legacy
-- objects below have been uploaded to the blog-assets bucket:
--
--   wrangler r2 object put blog-assets/images/legacy/github-blocks.png \
--     --file=public/images/github-blocks.png --content-type=image/png
--   wrangler r2 object put blog-assets/images/legacy/github-blocks-picker.png \
--     --file=public/images/github-blocks-picker.png --content-type=image/png
--
-- Running it before the new Worker is live would make the old Worker 404 these
-- (it has no /api/asset route and no R2 binding). After applying, the public/
-- copies can be deleted in a follow-up commit.
--
-- This also covers fresh installs: 0003 seeds the old /images/ refs, then this
-- migration rewrites them, so every environment converges on the R2 URLs.

UPDATE "post"
SET "body" = REPLACE("body", '/images/github-blocks.png', '/api/asset/images/legacy/github-blocks.png')
WHERE "body" LIKE '%/images/github-blocks.png%';

UPDATE "post"
SET "body" = REPLACE("body", '/images/github-blocks-picker.png', '/api/asset/images/legacy/github-blocks-picker.png')
WHERE "body" LIKE '%/images/github-blocks-picker.png%';
