-- Interface i18n: per-user UI-language preference.
--
-- Additive only: one nullable TEXT column on the Better Auth-managed `user`
-- table (created by 0001). NULL — existing rows and anything written by code
-- that predates this column — is treated as zh at read time, so no backfill
-- is required and branches still running old code are unaffected. The column
-- is owned by the app (apps/web/src/lib/locale-service.ts), not registered
-- with Better Auth, so Better Auth never writes it.
ALTER TABLE "user" ADD COLUMN "locale" TEXT;
