import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
  renderCommentHtml,
  renderPostHtml,
  resolveRequestLocale,
} from './markdown-html.js';

/**
 * RPC wrappers for live markdown previews. Server-fn-only module on purpose
 * (see markdown-html.tsx): the client imports these stubs, and the handlers —
 * with the whole react-markdown pipeline — stay on the worker.
 */

const previewInput = z.object({ body: z.string().max(100_000) });

/** Live preview for the admin post editor: renders through the same post
 *  pipeline so the preview matches the published page exactly. */
export const previewPostServerFn = createServerFn({ method: 'POST' })
  .inputValidator(previewInput)
  .handler(async ({ data }) => {
    const locale = await resolveRequestLocale();
    return { html: renderPostHtml(data.body, locale) };
  });

const commentPreviewInput = z.object({ body: z.string().max(2000) });

/** Live preview for the comment composer (same pipeline as stored comments). */
export const previewCommentServerFn = createServerFn({ method: 'POST' })
  .inputValidator(commentPreviewInput)
  .handler(async ({ data }) => {
    return { html: renderCommentHtml(data.body) };
  });
