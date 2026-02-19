import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import { handleEndpoints } from 'payload';
import config from './payload.config.js';

const DEFAULT_PORT = 4000;
const port = Number(process.env.PORT ?? DEFAULT_PORT);
const host = process.env.HOST ?? '0.0.0.0';

process.on('unhandledRejection', (reason) => {
  console.error('[cms] unhandled rejection', reason);
});

function requestOrigin(req: IncomingMessage): string {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol =
    typeof forwardedProto === 'string' && forwardedProto.length > 0
      ? forwardedProto.split(',')[0].trim()
      : 'http';
  const host = req.headers.host ?? `localhost:${port}`;
  return `${protocol}://${host}`;
}

function buildHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
      continue;
    }

    if (typeof value === 'string') {
      headers.set(key, value);
    }
  }

  return headers;
}

async function readRequestBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

async function toFetchRequest(req: IncomingMessage): Promise<Request> {
  const method = req.method ?? 'GET';
  const url = new URL(req.url ?? '/', requestOrigin(req));
  const headers = buildHeaders(req);

  if (method === 'GET' || method === 'HEAD') {
    return new Request(url, { method, headers });
  }

  const body = await readRequestBody(req);
  return new Request(url, { method, headers, body });
}

async function sendFetchResponse(
  res: ServerResponse,
  response: Response,
): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  const body = Buffer.from(await response.arrayBuffer());
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if ((req.url ?? '') === '/healthz') {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  try {
    const request = await toFetchRequest(req);
    const response = await handleEndpoints({
      config,
      request,
    });
    await sendFetchResponse(res, response);
  } catch (error) {
    console.error('[cms] request handling failed', error);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});

server.listen(port, host, () => {
  console.log(`[cms] listening on http://${host}:${port}`);
  console.log('[cms] payload API mounted on /api');
});
