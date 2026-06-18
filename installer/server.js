import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const HOST = '0.0.0.0';

const getAppDir = () => {
    const dir = path.dirname(__filename || process.argv[1] || process.cwd());
    // If running from installer/ (old build), serve from installer/output/ (new build)
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
    '.zip': 'application/zip',
    '.exe': 'application/octet-stream',
    '.msi': 'application/octet-stream'
};

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    orange: '\x1b[38;5;208m'
};

function log(message, color = colors.white) {
    const timestamp = new Date().toISOString().slice(11, 19);
    console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
}

function logError(message) {
    log(message, colors.red);
}

function logSuccess(message) {
    log(message, colors.green);
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const filePath = path.join(APP_DIR, url.pathname === '/' ? 'index.html' : url.pathname);

    if (!filePath.startsWith(APP_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                fs.readFile(path.join(APP_DIR, 'index.html'), (err2, indexContent) => {
                    if (err2) {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('404 Not Found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(indexContent);
                    }
                });
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(content);
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log('');
    console.log(`${colors.orange}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.orange}║                                                           ║${colors.reset}`);
    console.log(`${colors.orange}║   🎸 FretMaster - Interactive Guitar Coach               ║${colors.reset}`);
    console.log(`${colors.orange}║   Version 1.0.0                                          ║${colors.reset}`);
    console.log(`${colors.orange}║                                                           ║${colors.reset}`);
    console.log(`${colors.orange}╚═══════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log('');
    console.log(`${colors.green}✓ Server running at:${colors.reset}`);
    console.log(`  ${colors.white}Local:   http://localhost:${PORT}/${colors.reset}`);
    console.log(`  ${colors.white}Network: http://127.0.0.1:${PORT}/${colors.reset}`);
    console.log('');
    console.log(`${colors.cyan}Downloads available:${colors.reset}`);
    console.log(`  ${colors.yellow}Windows: http://localhost:${PORT}/fretmaster-windows.zip${colors.reset}`);
    console.log('');

    if (process.platform === 'win32') {
        exec(`start http://localhost:${PORT}`);
    }
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        logError(`Port ${PORT} is already in use`);
        process.exit(1);
    } else {
        logError(`Server error: ${err.message}`);
        process.exit(1);
    }
});

process.on('SIGINT', () => {
    log('Shutting down server...', colors.yellow);
    server.close(() => {
        logSuccess('Server stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    log('Received SIGTERM, shutting down...', colors.yellow);
    server.close(() => {
        logSuccess('Server stopped');
        process.exit(0);
    });
});
