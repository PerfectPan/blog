import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import {
  renderCommentHtml,
  renderPostHtml,
  resolveRequestLocale,
} from './markdown-html.js';
import { getSessionUserFromRequest } from './session-core.js';

/**
 * RPC wrappers for live markdown previews. Server-fn-only module on purpose
 * (see markdown-html.tsx): the client imports these stubs, and the handlers —
 * with the whole react-markdown pipeline — stay on the worker.
 */

const previewInput = z.object({ body: z.string().max(100_000) });

// Both fns are RPC-reachable, so per the two-layer permission rule the checks
// live inside the handlers — not only in the UI that happens to call them.

/** Throws toward /login unless the caller is signed in. */
async function requireSession() {
  const sessionUser = await getSessionUserFromRequest(getRequest());
  if (!sessionUser) {
    throw redirect({ to: '/login' });
  }
  return sessionUser;
}

/** Live preview for the admin post editor: renders through the same post
 *  pipeline so the preview matches the published page exactly. */
export const previewPostServerFn = createServerFn({ method: 'POST' })
  .inputValidator(previewInput)
  .handler(async ({ data }) => {
    const sessionUser = await requireSession();
    if (sessionUser.role !== 'admin') {
      throw redirect({ to: '/' });
    }
    const locale = await resolveRequestLocale();
    return { html: renderPostHtml(data.body, locale) };
  });

const commentPreviewInput = z.object({ body: z.string().max(2000) });

/** Live preview for the comment composer (same pipeline as stored comments). */
export const previewCommentServerFn = createServerFn({ method: 'POST' })
  .inputValidator(commentPreviewInput)
  .handler(async ({ data }) => {
    await requireSession();
    return { html: renderCommentHtml(data.body) };
  });
