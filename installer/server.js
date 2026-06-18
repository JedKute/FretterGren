import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = '0.0.0.0';

const getAppDir = () => {
    const dir = __dirname;
    const outputDir = path.join(dir, 'output');
    if (dir.endsWith('installer') && fs.existsSync(path.join(outputDir, 'server.js'))) {
        return outputDir;
    }
    return dir;
};

const APP_DIR = getAppDir();

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const filePath = path.join(APP_DIR, url.pathname === '/' ? 'index.html' : url.pathname);

    if (!filePath.startsWith(APP_DIR)) {
        res.writeHead(403);
        return res.end();
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                fs.readFile(path.join(APP_DIR, 'index.html'), (err2, indexContent) => {
                    if (err2) {
                        res.writeHead(404);
                        res.end();
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(indexContent);
                    }
                });
            } else {
                res.writeHead(500);
                res.end();
            }
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
            });
            res.end(content);
        }
    });
});

server.listen(0, HOST, () => {
    const actualPort = server.address().port;
    console.log(`FRETMASTER_PORT=${actualPort}`);
    console.log(`FretMaster running on http://localhost:${actualPort}`);
});

process.on('SIGTERM', () => process.exit(0));
