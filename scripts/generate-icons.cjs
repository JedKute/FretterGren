#!/usr/bin/env node

/**
 * Icon Generation Script for FretMaster
 * Generates placeholder icons for all platforms
 */

const fs = require('fs');
const path = require('path');

// Icon sizes for different platforms
const iconSizes = {
  // PWA icons
  pwa: [
    { size: 16, name: 'icon-16x16.png' },
    { size: 32, name: 'icon-32x32.png' },
    { size: 72, name: 'icon-72x72.png' },
    { size: 96, name: 'icon-96x96.png' },
    { size: 128, name: 'icon-128x128.png' },
    { size: 144, name: 'icon-144x144.png' },
    { size: 152, name: 'icon-152x152.png' },
    { size: 192, name: 'icon-192x192.png' },
    { size: 384, name: 'icon-384x384.png' },
    { size: 512, name: 'icon-512x512.png' }
  ],
  // Android icons
  android: [
    { size: 36, density: 'ldpi', name: 'ic_launcher.png' },
    { size: 48, density: 'mdpi', name: 'ic_launcher.png' },
    { size: 72, density: 'hdpi', name: 'ic_launcher.png' },
    { size: 96, density: 'xhdpi', name: 'ic_launcher.png' },
    { size: 144, density: 'xxhdpi', name: 'ic_launcher.png' },
    { size: 192, density: 'xxxhdpi', name: 'ic_launcher.png' }
  ],
  // Windows icons
  windows: [
    { size: 44, name: 'Square44x44Logo.png' },
    { size: 71, name: 'Square71x71Logo.png' },
    { size: 150, name: 'Square150x150Logo.png' },
    { size: 310, name: 'Square310x310Logo.png' },
    { size: 50, name: 'StoreLogo.png' },
    { size: 310, width: 310, height: 150, name: 'Wide310x150Logo.png' },
    { size: 620, width: 620, height: 300, name: 'SplashScreen.png' }
  ]
};

// Generate SVG placeholder
function generateSVG(size, width = size, height = size) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6200EE;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#03DAC5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="${Math.min(width, height) * 0.15}" fill="url(#grad)"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.25}" font-weight="bold">FM</text>
</svg>`;
}

// Create directories
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Write SVG file
function writeSVG(filePath, svg) {
  fs.writeFileSync(filePath, svg, 'utf8');
  console.log(`Generated: ${filePath}`);
}

// Main function
function main() {
  console.log('Generating icons for FretMaster...\n');

  // PWA icons
  console.log('Generating PWA icons...');
  const publicIconsDir = path.join(__dirname, '..', 'public', 'icons');
  ensureDir(publicIconsDir);

  iconSizes.pwa.forEach(icon => {
    const svg = generateSVG(icon.size);
    const filePath = path.join(publicIconsDir, icon.name);
    writeSVG(filePath, svg);
  });

  // Android icons
  console.log('\nGenerating Android icons...');
  const androidResDir = path.join(__dirname, '..', 'android', 'src', 'main', 'res');
  ensureDir(androidResDir);

  iconSizes.android.forEach(icon => {
    const dir = path.join(androidResDir, `mipmap-${icon.density}`);
    ensureDir(dir);
    const svg = generateSVG(icon.size);
    const filePath = path.join(dir, icon.name);
    writeSVG(filePath, svg);
  });

  // Windows icons
  console.log('\nGenerating Windows icons...');
  const windowsAssetsDir = path.join(__dirname, '..', 'windows', 'Assets');
  ensureDir(windowsAssetsDir);

  iconSizes.windows.forEach(icon => {
    const svg = generateSVG(icon.size, icon.width || icon.size, icon.height || icon.size);
    const filePath = path.join(windowsAssetsDir, icon.name);
    writeSVG(filePath, svg);
  });

  console.log('\nIcon generation complete!');
  console.log('\nNote: These are SVG placeholder icons. Replace them with actual PNG icons for production.');
}

// Run the script
main();