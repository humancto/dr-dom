#!/bin/bash

# Dr. DOM Extension Packaging Script
# This script packages the Chrome extension for distribution

echo "📦 Packaging Dr. DOM Extension..."

# Set variables
EXTENSION_NAME="dr-dom-extension"
VERSION=$(grep '"version"' dist/chrome/manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
OUTPUT_FILE="${EXTENSION_NAME}-v${VERSION}.zip"

# Remove old package if it exists
if [ -f "dist/$OUTPUT_FILE" ]; then
    echo "🗑️  Removing old package..."
    rm "dist/$OUTPUT_FILE"
fi

# Create the zip file
echo "📁 Creating zip archive..."
cd dist/chrome
zip -r "../$OUTPUT_FILE" . \
    -x "*.DS_Store" \
    -x "*/.DS_Store" \
    -x "*/.*" \
    -x "test/*" \
    -x "*.bak" \
    -x "*.backup"

cd ../..

# Show package info
echo ""
echo "✅ Extension packaged successfully!"
echo "📦 Package: dist/$OUTPUT_FILE"
echo "📊 Version: $VERSION"

# Calculate package size
SIZE=$(du -h "dist/$OUTPUT_FILE" | cut -f1)
echo "💾 Size: $SIZE"

echo ""
echo "🚀 Ready for distribution!"
echo ""
echo "Next steps:"
echo "1. Test the extension by loading dist/chrome/ in Chrome"
echo "2. Upload dist/$OUTPUT_FILE to Chrome Web Store"
echo "3. Fill in store listing details (description, screenshots, etc.)"
