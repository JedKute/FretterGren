#!/usr/bin/env node

/**
 * Store Validation Script for FretMaster
 * Validates the app is ready for Play Store and Microsoft Store submission
 */

const fs = require('fs');
const path = require('path');

// Validation results
const results = {
  android: { passed: 0, failed: 0, warnings: 0 },
  windows: { passed: 0, failed: 0, warnings: 0 },
  pwa: { passed: 0, failed: 0, warnings: 0 }
};

// Log functions
function logPass(platform, message) {
  console.log(`✅ [${platform.toUpperCase()}] ${message}`);
  results[platform].passed++;
}

function logFail(platform, message) {
  console.log(`❌ [${platform.toUpperCase()}] ${message}`);
  results[platform].failed++;
}

function logWarning(platform, message) {
  console.log(`⚠️  [${platform.toUpperCase()}] ${message}`);
  results[platform].warnings++;
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

// Check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Validate Android configuration
function validateAndroid() {
  console.log('\n📱 Validating Android (Google Play Store) configuration...\n');

  const androidDir = path.join(__dirname, '..', 'android');
  const mainDir = path.join(androidDir, 'src', 'main');

  // Check AndroidManifest.xml
  if (fileExists(path.join(mainDir, 'AndroidManifest.xml'))) {
    logPass('android', 'AndroidManifest.xml exists');
  } else {
    logFail('android', 'AndroidManifest.xml not found');
  }

  // Check build.gradle.kts
  if (fileExists(path.join(androidDir, 'build.gradle.kts'))) {
    logPass('android', 'build.gradle.kts exists');
  } else {
    logFail('android', 'build.gradle.kts not found');
  }

  // Check MainActivity.kt
  if (fileExists(path.join(mainDir, 'java', 'com', 'fretmaster', 'guitarcoach', 'MainActivity.kt'))) {
    logPass('android', 'MainActivity.kt exists');
  } else {
    logFail('android', 'MainActivity.kt not found');
  }

  // Check Application class
  if (fileExists(path.join(mainDir, 'java', 'com', 'fretmaster', 'guitarcoach', 'FretMasterApplication.kt'))) {
    logPass('android', 'FretMasterApplication.kt exists');
  } else {
    logFail('android', 'FretMasterApplication.kt not found');
  }

  // Check layout files
  if (fileExists(path.join(mainDir, 'res', 'layout', 'activity_main.xml'))) {
    logPass('android', 'activity_main.xml layout exists');
  } else {
    logFail('android', 'activity_main.xml layout not found');
  }

  // Check string resources
  if (fileExists(path.join(mainDir, 'res', 'values', 'strings.xml'))) {
    logPass('android', 'strings.xml exists');
  } else {
    logFail('android', 'strings.xml not found');
  }

  // Check theme files
  if (fileExists(path.join(mainDir, 'res', 'values', 'themes.xml'))) {
    logPass('android', 'themes.xml exists');
  } else {
    logFail('android', 'themes.xml not found');
  }

  // Check color resources
  if (fileExists(path.join(mainDir, 'res', 'values', 'colors.xml'))) {
    logPass('android', 'colors.xml exists');
  } else {
    logFail('android', 'colors.xml not found');
  }

  // Check build script
  if (fileExists(path.join(__dirname, '..', 'build-android.sh'))) {
    logPass('android', 'build-android.sh exists');
  } else {
    logFail('android', 'build-android.sh not found');
  }

  // Check Android permissions in manifest
  const manifestPath = path.join(mainDir, 'AndroidManifest.xml');
  if (fileExists(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath, 'utf8');
    if (manifest.includes('android.permission.INTERNET')) {
      logPass('android', 'INTERNET permission declared');
    } else {
      logWarning('android', 'INTERNET permission not declared');
    }
    if (manifest.includes('android.permission.RECORD_AUDIO')) {
      logPass('android', 'RECORD_AUDIO permission declared');
    } else {
      logWarning('android', 'RECORD_AUDIO permission not declared');
    }
  }
}

// Validate Windows configuration
function validateWindows() {
  console.log('\n💻 Validating Windows (Microsoft Store) configuration...\n');

  const windowsDir = path.join(__dirname, '..', 'windows');

  // Check Package.appxmanifest
  if (fileExists(path.join(windowsDir, 'Package.appxmanifest'))) {
    logPass('windows', 'Package.appxmanifest exists');
  } else {
    logFail('windows', 'Package.appxmanifest not found');
  }

  // Check appmanifest.json
  if (fileExists(path.join(windowsDir, 'appmanifest.json'))) {
    logPass('windows', 'appmanifest.json exists');
  } else {
    logFail('windows', 'appmanifest.json not found');
  }

  // Check Assets directory
  if (fileExists(path.join(windowsDir, 'Assets'))) {
    logPass('windows', 'Assets directory exists');
  } else {
    logFail('windows', 'Assets directory not found');
  }

  // Check build script
  if (fileExists(path.join(__dirname, '..', 'build-windows.ps1'))) {
    logPass('windows', 'build-windows.ps1 exists');
  } else {
    logFail('windows', 'build-windows.ps1 not found');
  }

  // Check manifest content
  const manifestPath = path.join(windowsDir, 'Package.appxmanifest');
  if (fileExists(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath, 'utf8');
    if (manifest.includes('FretMaster.GuitarCoach')) {
      logPass('windows', 'Package identity set');
    } else {
      logWarning('windows', 'Package identity not set');
    }
    if (manifest.includes('internetClient')) {
      logPass('windows', 'Internet capability declared');
    } else {
      logWarning('windows', 'Internet capability not declared');
    }
    if (manifest.includes('microphone')) {
      logPass('windows', 'Microphone capability declared');
    } else {
      logWarning('windows', 'Microphone capability not declared');
    }
  }
}

// Validate PWA configuration
function validatePWA() {
  console.log('\n🌐 Validating PWA configuration...\n');

  const publicDir = path.join(__dirname, '..', 'public');

  // Check manifest.json
  if (fileExists(path.join(publicDir, 'manifest.json'))) {
    logPass('pwa', 'manifest.json exists');
  } else {
    logFail('pwa', 'manifest.json not found');
  }

  // Check service worker
  if (fileExists(path.join(publicDir, 'sw.js'))) {
    logPass('pwa', 'Service worker (sw.js) exists');
  } else {
    logFail('pwa', 'Service worker (sw.js) not found');
  }

  // Check offline page
  if (fileExists(path.join(publicDir, 'offline.html'))) {
    logPass('pwa', 'Offline page exists');
  } else {
    logFail('pwa', 'Offline page not found');
  }

  // Check icons directory
  if (fileExists(path.join(publicDir, 'icons'))) {
    logPass('pwa', 'Icons directory exists');
  } else {
    logFail('pwa', 'Icons directory not found');
  }

  // Check manifest content
  const manifestPath = path.join(publicDir, 'manifest.json');
  if (fileExists(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (manifest.name) {
        logPass('pwa', 'App name set in manifest');
      } else {
        logWarning('pwa', 'App name not set in manifest');
      }
      if (manifest.icons && manifest.icons.length > 0) {
        logPass('pwa', 'Icons configured in manifest');
      } else {
        logWarning('pwa', 'No icons configured in manifest');
      }
      if (manifest.display === 'standalone') {
        logPass('pwa', 'Display mode set to standalone');
      } else {
        logWarning('pwa', 'Display mode not set to standalone');
      }
    } catch (e) {
      logFail('pwa', 'manifest.json is not valid JSON');
    }
  }

  // Check index.html for PWA meta tags
  const indexPath = path.join(__dirname, '..', 'index.html');
  if (fileExists(indexPath)) {
    const index = fs.readFileSync(indexPath, 'utf8');
    if (index.includes('manifest.json')) {
      logPass('pwa', 'Manifest linked in index.html');
    } else {
      logFail('pwa', 'Manifest not linked in index.html');
    }
    if (index.includes('serviceWorker')) {
      logPass('pwa', 'Service worker registration found');
    } else {
      logWarning('pwa', 'Service worker registration not found');
    }
  }
}

// Validate store metadata
function validateStoreMetadata() {
  console.log('\n📋 Validating store metadata...\n');

  const metadataDir = path.join(__dirname, '..', 'store-metadata');

  // Check Google Play metadata
  if (fileExists(path.join(metadataDir, 'google-play', 'store-listing.md'))) {
    logPass('android', 'Google Play store listing exists');
  } else {
    logFail('android', 'Google Play store listing not found');
  }

  // Check Microsoft Store metadata
  if (fileExists(path.join(metadataDir, 'microsoft-store', 'store-listing.md'))) {
    logPass('windows', 'Microsoft Store listing exists');
  } else {
    logFail('windows', 'Microsoft Store listing not found');
  }

  // Check privacy policy
  if (fileExists(path.join(metadataDir, 'privacy-policy.md'))) {
    logPass('android', 'Privacy policy exists');
    logPass('windows', 'Privacy policy exists');
  } else {
    logFail('android', 'Privacy policy not found');
    logFail('windows', 'Privacy policy not found');
  }

  // Check terms of service
  if (fileExists(path.join(metadataDir, 'terms-of-service.md'))) {
    logPass('android', 'Terms of service exists');
    logPass('windows', 'Terms of service exists');
  } else {
    logFail('android', 'Terms of service not found');
    logFail('windows', 'Terms of service not found');
  }
}

// Print summary
function printSummary() {
  console.log('\n📊 Validation Summary\n');
  console.log('=' .repeat(50));

  ['android', 'windows', 'pwa'].forEach(platform => {
    const r = results[platform];
    const total = r.passed + r.failed + r.warnings;
    console.log(`\n${platform.toUpperCase()}:`);
    console.log(`  ✅ Passed: ${r.passed}`);
    console.log(`  ❌ Failed: ${r.failed}`);
    console.log(`  ⚠️  Warnings: ${r.warnings}`);
    console.log(`  📊 Total: ${total}`);
  });

  const totalPassed = results.android.passed + results.windows.passed + results.pwa.passed;
  const totalFailed = results.android.failed + results.windows.failed + results.pwa.failed;
  const totalWarnings = results.android.warnings + results.windows.warnings + results.pwa.warnings;

  console.log('\n' + '='.repeat(50));
  console.log('\n🎯 Overall Results:');
  console.log(`  ✅ Total Passed: ${totalPassed}`);
  console.log(`  ❌ Total Failed: ${totalFailed}`);
  console.log(`  ⚠️  Total Warnings: ${totalWarnings}`);

  if (totalFailed === 0) {
    console.log('\n🎉 Your app is ready for store submission!');
  } else {
    console.log('\n🔧 Please fix the failing checks before submitting.');
  }
}

// Main function
function main() {
  console.log('🔍 FretMaster Store Validation\n');
  console.log('='.repeat(50));

  validateAndroid();
  validateWindows();
  validatePWA();
  validateStoreMetadata();
  printSummary();
}

// Run the script
main();