import type { PostDetail, PostSummary, Role } from '@blog/shared';
import { getWebEnv } from './env.js';

const env = getWebEnv();

function buildHeaders(role?: Role): HeadersInit {
  const headers: Record<string, string> = {
    'x-service-token': env.payloadServiceToken,
  };

  if (role) {
    headers['x-user-role'] = role;
  }

  return headers;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `[web->cms] ${response.status} ${response.statusText}: ${body}`,
    );
  }

  return (await response.json()) as T;
}

type ListResponse = {
  docs: PostSummary[];
};

type SingleResponse = {
  doc: PostDetail;
};

export async function fetchVisiblePostsFromCms(
  role?: Role,
): Promise<PostSummary[]> {
  const url = new URL('/api/web/posts', env.payloadPublicUrl);
  const response = await fetch(url, {
    headers: buildHeaders(role),
  });

  const data = await parseJson<ListResponse>(response);
  return data.docs;
}

export async function fetchPostBySlugFromCms(
  slug: string,
): Promise<PostDetail | null> {
  const url = new URL(`/api/web/posts/${slug}`, env.payloadPublicUrl);
  const response = await fetch(url, {
    headers: buildHeaders(),
  });

  if (response.status === 404) {
    return null;
  }

  const data = await parseJson<SingleResponse>(response);
  return data.doc;
}

export async function verifyPostPasswordWithCms(
  slug: string,
  password: string,
): Promise<boolean> {
  const url = new URL(
    `/api/web/posts/${slug}/verify-password`,
    env.payloadPublicUrl,
  );
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...buildHeaders(),
      'content-type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { ok?: boolean };
  return Boolean(data.ok);
}
