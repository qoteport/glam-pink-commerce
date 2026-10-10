import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = '0.0.0.0';
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  // Health check endpoints
  if (req.url === '/healthz' || req.url === '/_health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  // Parse URL to get file path
  let parsedUrl;
  try {
    parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  let pathname = decodeURIComponent(parsedUrl.pathname);
  let filePath = path.join(DIST_DIR, pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Check if target exists
  fs.stat(filePath, (err, stats) => {
    let servePath = filePath;
    let isHtmlFallback = false;

    if (!err && stats.isFile()) {
      servePath = filePath;
    } else if (!err && stats.isDirectory()) {
      servePath = path.join(filePath, 'index.html');
    } else {
      // SPA Fallback for React Router
      servePath = path.join(DIST_DIR, 'index.html');
      isHtmlFallback = true;
    }

    fs.stat(servePath, (statErr, finalStats) => {
      if (statErr || !finalStats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }

      const ext = path.extname(servePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      const headers = {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
      };

      // Caching headers
      if (servePath.includes(path.sep + 'assets' + path.sep) && !isHtmlFallback) {
        // Immutable cached assets with hash
        headers['Cache-Control'] = 'public, max-age=31536000, immutable';
      } else {
        // HTML and root files: check for revalidation
        headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
      }

      // Handle Gzip compression if supported
      const acceptEncoding = req.headers['accept-encoding'] || '';
      const rawStream = fs.createReadStream(servePath);

      if (/\bgzip\b/.test(acceptEncoding) && (contentType.startsWith('text/') || contentType.startsWith('application/'))) {
        headers['Content-Encoding'] = 'gzip';
        res.writeHead(200, headers);
        rawStream.pipe(zlib.createGzip()).pipe(res);
      } else {
        headers['Content-Length'] = finalStats.size;
        res.writeHead(200, headers);
        rawStream.pipe(res);
      }
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Firebase App Hosting server listening on http://${HOST}:${PORT}`);
  console.log(`Serving static assets from: ${DIST_DIR}`);
});
