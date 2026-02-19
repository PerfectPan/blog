import { postgresAdapter } from '@payloadcms/db-postgres';
import bcrypt from 'bcryptjs';
import { buildConfig } from 'payload';
import type { PayloadRequest } from 'payload';
import { Posts } from './collections/Posts.js';
import { Users } from './collections/Users.js';
import {
  buildPublishedReadWhereForRole,
  getRoleFromRequest,
  getServiceTokenFromRequest,
} from './lib/access.js';
import { getCmsEnv } from './lib/env.js';

const env = getCmsEnv();

type PayloadDoc = Record<string, unknown>;
type RequestWithRouteParams = PayloadRequest & {
  routeParams?: Record<string, unknown>;
};

function getAllowedOrigins(): string[] {
  return env.appsWebUrl
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function assertServiceRequest(req: { headers: Headers }): Response | null {
  const serviceToken = getServiceTokenFromRequest(req);
  if (!serviceToken || serviceToken !== env.payloadServiceToken) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized service request' }),
      {
        status: 401,
        headers: { 'content-type': 'application/json' },
      },
    );
  }

  const origin = req.headers.get('origin');
  if (origin) {
    const allowedOrigins = getAllowedOrigins();
    if (!allowedOrigins.includes(origin)) {
      return new Response(JSON.stringify({ error: 'Forbidden origin' }), {
        status: 403,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  return null;
}

function getRouteParam(
  req: RequestWithRouteParams,
  key: string,
): string | undefined {
  const value = req.routeParams?.[key];
  return typeof value === 'string' ? value : undefined;
}

function toPostSummary(doc: PayloadDoc) {
  const tags = Array.isArray(doc.tags)
    ? doc.tags.map((item) => String((item as PayloadDoc).value))
    : [];

  return {
    slug: String(doc.slug),
    title: String(doc.title),
    description: String(doc.description ?? ''),
    visibility: String(doc.visibility ?? 'public'),
    publishedAt: String(
      doc.publishedAt ?? doc.updatedAt ?? new Date().toISOString(),
    ),
    tags,
  };
}

function toPostDetail(doc: PayloadDoc) {
  return {
    ...toPostSummary(doc),
    contentMdx: String(doc.contentMdx ?? ''),
    status: String(doc._status ?? 'draft'),
    passwordEnabled: Boolean(doc.visibility === 'password' && doc.passwordHash),
  };
}

export default buildConfig({
  secret: env.payloadSecret,
  serverURL: env.payloadPublicUrl,
  cors: getAllowedOrigins(),
  csrf: getAllowedOrigins(),
  admin: {
    user: Users.slug,
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.databaseUrl,
    },
  }),
  collections: [Users, Posts],
  endpoints: [
    {
      path: '/web/posts',
      method: 'get',
      handler: async (req) => {
        const request = req as RequestWithRouteParams;
        const denyResponse = assertServiceRequest(request);
        if (denyResponse) {
          return denyResponse;
        }

        const role = getRoleFromRequest(request);
        const where = buildPublishedReadWhereForRole(role);
        const docs = await request.payload.find({
          collection: 'posts',
          where,
          depth: 0,
          sort: '-publishedAt',
          pagination: false,
        });
        const posts = docs.docs as PayloadDoc[];

        return Response.json({
          docs: posts.map((doc) => toPostSummary(doc)),
          total: docs.totalDocs,
        });
      },
    },
    {
      path: '/web/posts/:slug',
      method: 'get',
      handler: async (req) => {
        const request = req as RequestWithRouteParams;
        const denyResponse = assertServiceRequest(request);
        if (denyResponse) {
          return denyResponse;
        }

        const slug = getRouteParam(request, 'slug');
        if (!slug) {
          return new Response(JSON.stringify({ error: 'Missing slug' }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
          });
        }

        const docs = await request.payload.find({
          collection: 'posts',
          where: {
            and: [
              { slug: { equals: slug } },
              { _status: { equals: 'published' } },
            ],
          },
          depth: 0,
          limit: 1,
        });

        const post = docs.docs[0] as PayloadDoc | undefined;
        if (!post) {
          return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { 'content-type': 'application/json' },
          });
        }

        return Response.json({
          doc: toPostDetail(post),
        });
      },
    },
    {
      path: '/web/posts/:slug/verify-password',
      method: 'post',
      handler: async (req) => {
        const request = req as RequestWithRouteParams;
        const denyResponse = assertServiceRequest(request);
        if (denyResponse) {
          return denyResponse;
        }

        const slug = getRouteParam(request, 'slug');
        if (!slug) {
          return new Response(JSON.stringify({ error: 'Missing slug' }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
          });
        }

        const body =
          typeof request.json === 'function'
            ? ((await request.json().catch(() => ({}))) as {
                password?: unknown;
              })
            : ((request.data ?? {}) as { password?: unknown });
        const password = String(body.password ?? '');
        if (!password) {
          return new Response(JSON.stringify({ error: 'Missing password' }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
          });
        }

        const docs = await request.payload.find({
          collection: 'posts',
          where: {
            and: [
              { slug: { equals: slug } },
              { _status: { equals: 'published' } },
              { visibility: { equals: 'password' } },
            ],
          },
          depth: 0,
          limit: 1,
        });

        const post = docs.docs[0] as PayloadDoc | undefined;
        if (!post || !post.passwordHash) {
          return new Response(
            JSON.stringify({ error: 'Password protected post not found' }),
            {
              status: 404,
              headers: { 'content-type': 'application/json' },
            },
          );
        }

        const ok = await bcrypt.compare(password, String(post.passwordHash));
        return Response.json({ ok });
      },
    },
  ],
});
