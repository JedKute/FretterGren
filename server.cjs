const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const HOST = '0.0.0.0';
const WEBSITE_DIR = path.join(__dirname, 'website');

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.zip': 'application/zip',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    let filePath = path.join(WEBSITE_DIR, req.url === '/' ? 'index.html' : req.url);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(WEBSITE_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log(`404: ${req.url}`);
                res.writeHead(404);
                res.end('Not Found');
            } else {
                console.error(`500: ${err.message}`);
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            console.log(`200: ${req.url} (${contentType})`);
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
    console.log('='.repeat(50));
    console.log('FretMaster Website Server');
    console.log('='.repeat(50));
    console.log(`Server running at:`);
    console.log(`  Local:   http://localhost:${PORT}/`);
    console.log(`  Network: http://192.168.56.1:${PORT}/`);
    console.log(`  Network: http://172.168.3.73:${PORT}/`);
    console.log(`  Network: http://172.30.192.1:${PORT}/`);
    console.log('='.repeat(50));
    console.log('');
    console.log('Downloads available:');
    console.log(`  Android: http://localhost:${PORT}/fretmaster-android.zip`);
    console.log(`  Windows: http://localhost:${PORT}/fretmaster-windows.zip`);
    console.log('');
});