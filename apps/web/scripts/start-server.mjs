import { promises as fs, createReadStream } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import startHandler from '../dist/server/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const host = process.env.HOST ?? '0.0.0.0';
const port = Number(process.env.PORT ?? 3000);
const clientRoot = path.resolve(__dirname, '../dist/client');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function getOrigin(req) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol =
    typeof forwardedProto === 'string' && forwardedProto.length > 0
      ? forwardedProto.split(',')[0].trim()
      : 'http';
  const hostname = req.headers.host ?? `${host}:${port}`;
  return `${protocol}://${hostname}`;
}

function buildHeaders(req) {
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

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function toRequest(req) {
  const method = req.method ?? 'GET';
  const headers = buildHeaders(req);
  const url = new URL(req.url ?? '/', getOrigin(req));

  if (method === 'GET' || method === 'HEAD') {
    return new Request(url, { method, headers });
  }

  const body = await readBody(req);
  return new Request(url, { method, headers, body });
}

function getFilePathFromUrl(rawUrl) {
  const pathname = decodeURIComponent(rawUrl.split('?')[0]);
  const relativePath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  const fullPath = path.resolve(clientRoot, relativePath);
  if (!fullPath.startsWith(clientRoot)) {
    return null;
  }
  return fullPath;
}

async function serveStatic(req, res) {
  if (!req.url || req.url === '/' || req.url.startsWith('/api/')) {
    return false;
  }

  const filePath = getFilePathFromUrl(req.url);
  if (!filePath) {
    return false;
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      return false;
    }

    const ext = path.extname(filePath);
    const contentType =
      contentTypes[ext] ?? 'application/octet-stream; charset=binary';

    res.statusCode = 200;
    res.setHeader('content-type', contentType);
    createReadStream(filePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}

async function sendFetchResponse(res, response) {
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
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (await serveStatic(req, res)) {
    return;
  }

  try {
    const request = await toRequest(req);
    const response = await startHandler(request, {
      waitUntil() {},
    });
    await sendFetchResponse(res, response);
  } catch (error) {
    console.error('[web] request handling failed', error);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});

server.listen(port, host, () => {
  console.log(`[web] listening on http://${host}:${port}`);
});
