@echo off
title FretMaster - Interactive Guitar Coach
color 0A

echo ==================================================
echo   FretMaster - Interactive Guitar Coach
echo   Version 1.0.0
echo ==================================================
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is required but not installed.
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Get the directory of this script
set "APP_DIR=%~dp0"

REM Check if the app files exist
if not exist "%APP_DIR%index.html" (
    echo [ERROR] Application files not found.
    echo Please ensure all files are in the same directory.
    echo.
    pause
    exit /b 1
)

echo Starting FretMaster...
echo.

REM Start the server
node -e "const http = require('http'); const fs = require('fs'); const path = require('path'); const mimeTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.zip': 'application/zip', '.ico': 'image/x-icon' }; const server = http.createServer((req, res) => { let filePath = path.join('%APP_DIR%', req.url === '/' ? 'index.html' : req.url); const ext = path.extname(filePath).toLowerCase(); const contentType = mimeTypes[ext] || 'application/octet-stream'; fs.readFile(filePath, (err, content) => { if (err) { res.writeHead(404); res.end('Not Found'); } else { res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }); res.end(content); } }); }); server.listen(3000, '0.0.0.0', () => { console.log('FretMaster is running at http://localhost:3000'); console.log('Press Ctrl+C to stop.'); });"

pause