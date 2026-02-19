import { postgresAdapter } from '@payloadcms/db-postgres';
import { compare } from 'bcryptjs';
import { buildConfig } from 'payload';
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

type PayloadRequestLike = Request & {
  routeParams?: Record<string, string | undefined>;
  payload: {
    find: (args: Record<string, unknown>) => Promise<{
      docs: PayloadDoc[];
      totalDocs: number;
    }>;
  };
  json: () => Promise<unknown>;
};

function getAllowedOrigins(): string[] {
  return env.appsWebUrl
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function assertServiceRequest(req: Request): Response | null {
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
        const request = req as PayloadRequestLike;
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

        return Response.json({
          docs: docs.docs.map((doc) => toPostSummary(doc)),
          total: docs.totalDocs,
        });
      },
    },
    {
      path: '/web/posts/:slug',
      method: 'get',
      handler: async (req) => {
        const request = req as PayloadRequestLike;
        const denyResponse = assertServiceRequest(request);
        if (denyResponse) {
          return denyResponse;
        }

        const slug = request.routeParams?.slug;
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

        const post = docs.docs[0];
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
        const request = req as PayloadRequestLike;
        const denyResponse = assertServiceRequest(request);
        if (denyResponse) {
          return denyResponse;
        }

        const slug = request.routeParams?.slug;
        if (!slug) {
          return new Response(JSON.stringify({ error: 'Missing slug' }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
          });
        }

        const body = (await request.json().catch(() => ({}))) as {
          password?: unknown;
        };
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

        const post = docs.docs[0];
        if (!post || !post.passwordHash) {
          return new Response(
            JSON.stringify({ error: 'Password protected post not found' }),
            {
              status: 404,
              headers: { 'content-type': 'application/json' },
            },
          );
        }

        const ok = await compare(password, String(post.passwordHash));
        return Response.json({ ok });
      },
    },
  ],
});
