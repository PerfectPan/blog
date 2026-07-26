-- Bundle A follow-up: move legacy post images from public/images/ to R2.
--
-- Safe to apply now that the new Worker is deployed (the /api/asset route +
-- MEDIA_BUCKET binding are live) and the two legacy objects are uploaded to the
-- blog-assets bucket at images/legacy/. The previous deploy kept public/images
-- so the live site kept rendering until this point.
--
-- Idempotent: after the first run the refs no longer contain /images/, so the
-- WHERE matches nothing on re-run (migrate.yml re-applies it as a no-op).

UPDATE "post"
SET "body" = REPLACE("body", '/images/github-blocks.png', '/api/asset/images/legacy/github-blocks.png')
WHERE "body" LIKE '%/images/github-blocks.png%';

UPDATE "post"
SET "body" = REPLACE("body", '/images/github-blocks-picker.png', '/api/asset/images/legacy/github-blocks-picker.png')
WHERE "body" LIKE '%/images/github-blocks-picker.png%';
