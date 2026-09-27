import { LOCALES, type Locale } from '@blog/shared';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { getD1 } from './db.js';
import { getSessionUserFromRequest } from './session-core.js';

/**
 * UI-language preference storage (interface i18n, zh default + en).
 *
 * Resolution order lives elsewhere (LocaleProvider): signed-in users follow
 * `user.locale`, guests follow localStorage. These fns are the only writers
 * of the account preference. Like every server fn, this is reachable over
 * direct RPC, so all auth checks happen inside the handlers.
 */

/** Locale for the current session, or null for guests / unset preference.
 *  `isLoggedIn` lets the root loader drive LocaleProvider in one round trip. */
export const getLocaleServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getRequest();
    const sessionUser = await getSessionUserFromRequest(request);
    return {
      locale: sessionUser?.locale ?? null,
      isLoggedIn: sessionUser != null,
    };
  },
);

/** Persist the caller's own UI language. Handler-internal session check:
 *  a guest (or a forged RPC call without cookies) gets rejected here, and a
 *  signed-in user can only ever update their own row (id comes from the
 *  session, never from client input). */
export const setLocaleServerFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ locale: z.enum(LOCALES) }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const sessionUser = await getSessionUserFromRequest(request);
    if (!sessionUser) {
      throw new Error('未登录，无法保存语言偏好');
    }

    const locale: Locale = data.locale;
    await getD1()
      .prepare('UPDATE "user" SET "locale" = ? WHERE "id" = ?')
      .bind(locale, sessionUser.id)
      .run();

    return { locale };
  });
