import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    const requested = url.pathname.startsWith('/watch/') ? '/tests/player.html' : decodeURIComponent(url.pathname);
    const file = path.resolve(root, `.${requested}`);
    if (!file.startsWith(root + path.sep)) throw new Error('Invalid path');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'text/plain', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(8765, '127.0.0.1', () => console.log('Demo: http://127.0.0.1:8765/watch/100\nTests: http://127.0.0.1:8765/watch/100?test=1'));
