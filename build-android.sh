#!/bin/bash
# Build script for Android (Google Play Store)

set -e

echo "🏗️  Building FretMaster for Android..."

# Build the web app first
echo "📦 Building web app..."
npm run build

# Copy web assets to Android
echo "📱 Copying web assets to Android..."
mkdir -p android/app/src/main/assets

# Copy dist files
echo "📂 Copying build output..."
cp -r dist/* android/app/src/main/assets/

# Copy images from public directory to Android
echo "🖼️  Copying images..."
if [ -d "public" ]; then
    find public -type f | while read file; do
        relative_path=${file#public/}
        target_path="android/app/src/main/assets/images/$relative_path"
        mkdir -p "$(dirname "$target_path")"
        cp "$file" "$target_path"
        echo "  Copied: $relative_path" >&2
    done
fi

# Create Android icons (placeholder - replace with actual icons)
echo "🎨 Generating Android icons..."
mkdir -p android/app/src/main/res/mipmap-hdpi
mkdir -p android/app/src/main/res/mipmap-mdpi
mkdir -p android/app/src/main/res/mipmap-xhdpi
mkdir -p android/app/src/main/res/mipmap-xxhdpi
mkdir -p android/app/src/main/res/mipmap-xxxhdpi

# Build Android AAB
echo "🔨 Building Android App Bundle..."
cd android
./gradlew bundleRelease

echo "✅ Android build complete!"
echo "📦 Output: android/app/build/outputs/bundle/release/app-release.aab"