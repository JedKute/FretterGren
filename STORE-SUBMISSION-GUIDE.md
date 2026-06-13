# FretMaster - Store Submission Guide

This guide explains how to submit FretMaster to the Google Play Store and Microsoft Store.

## Prerequisites

### Google Play Store
- Google Play Developer account ($25 one-time fee)
- Android Studio installed
- Java Development Kit (JDK) 17 or later
- Google Play Signing key

### Microsoft Store
- Microsoft Partner Center account ($19 one-time fee)
- Windows 10/11 development environment
- Visual Studio 2022 (recommended)
- Windows SDK

## Quick Start

### 1. Generate Icons
```bash
npm run generate-icons
```

### 2. Validate Configuration
```bash
npm run store:validate
```

### 3. Build for Each Platform

#### Android (Google Play Store)
```bash
npm run build:android
```

#### Windows (Microsoft Store)
```bash
npm run build:windows
```

#### PWA (Progressive Web App)
```bash
npm run build:pwa
```

## Detailed Instructions

### Google Play Store Submission

#### Step 1: Set Up Android Development

1. Install Android Studio from https://developer.android.com/studio
2. Install JDK 17 or later
3. Set up Android SDK (API 34)

#### Step 2: Configure the Project

1. Open the `android` folder in Android Studio
2. Sync Gradle files
3. Configure signing in `build.gradle.kts`
4. Update the `google-services.json` file with your Firebase configuration

#### Step 3: Build the App

```bash
# Build the web app first
npm run build

# Build Android App Bundle
cd android
./gradlew bundleRelease
```

The output will be at: `android/app/build/outputs/bundle/release/app-release.aab`

#### Step 4: Prepare Store Listing

1. Log in to Google Play Console (https://play.google.com/console)
2. Create a new app
3. Fill in store listing:
   - Title: FretMaster - Interactive Guitar Coach
   - Short Description: AI-powered guitar learning app
   - Full Description: See `store-metadata/google-play/store-listing.md`
4. Upload screenshots (min 2, max 8):
   - Phone: 1080x1920px
   - Tablet: 1200x1920px
5. Upload feature graphic: 1024x500px
6. Upload app icon: 512x512px

#### Step 5: Configure Pricing

1. Set price: Free
2. Set up in-app products:
   - Premium Subscription: $9.99/month
   - Pro Subscription: $19.99/month
   - Lifetime Access: $149.99

#### Step 6: Content Rating

1. Complete content rating questionnaire
2. Select "Everyone" rating

#### Step 7: Privacy Policy

1. Upload privacy policy URL
2. Use: https://fretmaster.app/privacy

#### Step 8: Upload and Test

1. Upload the AAB file
2. Complete testing track setup
3. Submit for review

### Microsoft Store Submission

#### Step 1: Set Up Windows Development

1. Install Visual Studio 2022
2. Install Windows SDK
3. Join Windows Insider Program (optional)

#### Step 2: Configure the Project

1. Open the `windows` folder
2. Configure `Package.appxmanifest`
3. Update store identity in the manifest

#### Step 3: Build the App

```bash
# Build the web app first
npm run build

# Build Windows package
cd windows
# Open FretMaster.sln in Visual Studio
# Build > Publish > Store App Packages
```

#### Step 4: Prepare Store Listing

1. Log in to Partner Center (https://partner.microsoft.com/dashboard)
2. Create a new app submission
3. Fill in store listing:
   - Title: FretMaster - Interactive Guitar Coach
   - Subtitle: AI-Powered Guitar Learning
   - Description: See `store-metadata/microsoft-store/store-listing.md`
4. Upload screenshots (min 1, max 10):
   - Desktop: 1920x1080px
   - Tablet: 1366x1024px
   - Phone: 1080x1920px

#### Step 5: Configure Pricing

1. Set price: Free
2. Set up in-app purchases
3. Configure market availability

#### Step 6: Age Rating

1. Complete age rating questionnaire
2. Select "Everyone" rating

#### Step 7: Privacy Policy

1. Upload privacy policy URL
2. Use: https://fretmaster.app/privacy

#### Step 8: Upload and Test

1. Upload the MSIX package
2. Complete certification testing
3. Submit for review

## File Structure

```
fretmaster-guitar-coach/
├── android/                          # Android project
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/fretmaster/guitarcoach/
│   │   ├── res/
│   │   └── assets/                   # Web app files
│   └── build.gradle.kts
├── windows/                          # Windows project
│   ├── Package.appxmanifest
│   ├── Assets/
│   └── appmanifest.json
├── public/                           # PWA files
│   ├── manifest.json
│   ├── sw.js
│   ├── offline.html
│   ├── icons/
│   └── screenshots/
├── store-metadata/                   # Store listings
│   ├── google-play/
│   ├── microsoft-store/
│   ├── privacy-policy.md
│   └── terms-of-service.md
├── scripts/
│   ├── generate-icons.cjs
│   └── validate-store.cjs
├── build-android.sh
├── build-windows.ps1
└── package.json
```

## Important Notes

### Icons
- Replace placeholder SVG icons with actual PNG icons
- Required sizes:
  - Android: 36px to 192px (multiple densities)
  - Windows: 44px to 310px
  - PWA: 16px to 512px

### Screenshots
- Create high-quality screenshots showing key features
- Include captions describing what's shown

### Privacy Policy
- Update privacy policy with actual contact information
- Host at a publicly accessible URL

### Testing
- Test on multiple devices before submission
- Verify all features work offline
- Test audio recording permissions

### Certification
- Google Play: 1-7 days review time
- Microsoft Store: 1-3 days review time

## Troubleshooting

### Common Issues

1. **Build fails**
   - Ensure all dependencies are installed
   - Check Android SDK/Windows SDK versions

2. **Icons not showing**
   - Verify icon sizes match requirements
   - Check file formats (PNG for stores)

3. **Audio not working**
   - Test microphone permissions
   - Check audio API compatibility

4. **Offline mode issues**
   - Verify service worker registration
   - Test with network disabled

## Support

For help with store submission:
- Email: support@fretmaster.app
- Documentation: https://fretmaster.app/docs
- GitHub: https://github.com/fretmaster/guitar-coach