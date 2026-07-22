import {
  buildObjectKey,
  extensionFor,
  isAllowedImageType,
  MAX_UPLOAD_BYTES,
} from '@blog/shared';
import { createFileRoute } from '@tanstack/react-router';
import { getSessionUserFromRequest } from '../../lib/session-core.js';
import { getMediaBucket, mediaUrl } from '../../lib/storage.js';

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/** Admin-only image upload -> R2. Used by the markdown editor's paste/drop. */
async function handleUpload({
  request,
}: {
  request: Request;
}): Promise<Response> {
  // Server fns are reachable over RPC, so enforce admin at the data layer (the
  // admin editor is the only intended caller).
  const sessionUser = await getSessionUserFromRequest(request);
  if (!sessionUser || sessionUser.role !== 'admin') {
    return json({ error: 'unauthorized' }, 401);
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const entry = form.get('file');
    file = entry instanceof File ? entry : null;
  } catch {
    return json({ error: 'invalid request' }, 400);
  }
  if (!file) {
    return json({ error: 'no file' }, 400);
  }
  if (!isAllowedImageType(file.type)) {
    return json({ error: 'unsupported file type' }, 422);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return json({ error: 'file too large (max 5MB)' }, 422);
  }

  const ext = extensionFor(file.type) ?? 'bin';
  const key = buildObjectKey(ext);
  try {
    await getMediaBucket().put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });
  } catch (error) {
    console.error('[web] R2 upload failed', error);
    return json({ error: 'upload failed' }, 500);
  }

  return json({ url: mediaUrl(key), key }, 200);
}

export const Route = createFileRoute('/api/upload')({
  server: { handlers: { POST: handleUpload } },
  component: () => null,
});
