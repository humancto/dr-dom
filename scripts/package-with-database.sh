#!/bin/bash

# Dr. DOM Extension Packager with URLhaus Database
# This script downloads the latest URLhaus database and packages it with the extension

echo "🔍 Dr. DOM Extension Packager"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PROJECT_DIR/dist/chrome"
DATA_DIR="$DIST_DIR/data"
OUTPUT_DIR="$PROJECT_DIR/build"

# Create directories
mkdir -p "$DATA_DIR"
mkdir -p "$OUTPUT_DIR"

echo "📦 Preparing extension package..."
echo ""

# Step 1: Download URLhaus database
echo -e "${YELLOW}Step 1: Downloading URLhaus malware database...${NC}"
URLHAUS_URL="https://urlhaus.abuse.ch/downloads/csv/"
URLHAUS_FILE="$DATA_DIR/urlhaus.csv"

# Download with progress bar
if command -v curl &> /dev/null; then
    curl -L --progress-bar -o "$URLHAUS_FILE" "$URLHAUS_URL"
elif command -v wget &> /dev/null; then
    wget --show-progress -O "$URLHAUS_FILE" "$URLHAUS_URL"
else
    echo -e "${RED}Error: Neither curl nor wget found. Please install one.${NC}"
    exit 1
fi

if [ -f "$URLHAUS_FILE" ]; then
    FILE_SIZE=$(du -h "$URLHAUS_FILE" | cut -f1)
    LINE_COUNT=$(wc -l < "$URLHAUS_FILE")
    echo -e "${GREEN}✓ Downloaded URLhaus database: $FILE_SIZE, $LINE_COUNT entries${NC}"
else
    echo -e "${RED}✗ Failed to download URLhaus database${NC}"
    exit 1
fi

# Step 2: Download EasyList and EasyPrivacy
echo ""
echo -e "${YELLOW}Step 2: Downloading tracker blocking lists...${NC}"

EASYLIST_URL="https://easylist.to/easylist/easylist.txt"
EASYPRIVACY_URL="https://easylist.to/easylist/easyprivacy.txt"

curl -L --progress-bar -o "$DATA_DIR/easylist.txt" "$EASYLIST_URL"
curl -L --progress-bar -o "$DATA_DIR/easyprivacy.txt" "$EASYPRIVACY_URL"

echo -e "${GREEN}✓ Downloaded tracker blocking lists${NC}"

# Step 3: Process and optimize databases
echo ""
echo -e "${YELLOW}Step 3: Optimizing databases for performance...${NC}"

# Create a lightweight version (top 50k malicious URLs only)
head -n 50000 "$URLHAUS_FILE" > "$DATA_DIR/urlhaus-lite.csv"
echo -e "${GREEN}✓ Created lightweight database (50k entries)${NC}"

# Extract just domains for faster lookup
awk -F ',' '{print $3}' "$URLHAUS_FILE" | \
    sed 's|https\?://||' | \
    sed 's|/.*||' | \
    sort -u > "$DATA_DIR/malicious-domains.txt"

DOMAIN_COUNT=$(wc -l < "$DATA_DIR/malicious-domains.txt")
echo -e "${GREEN}✓ Extracted $DOMAIN_COUNT unique malicious domains${NC}"

# Step 4: Create manifest for packaged data
echo ""
echo -e "${YELLOW}Step 4: Creating data manifest...${NC}"

cat > "$DATA_DIR/manifest.json" << EOF
{
  "version": "1.0.0",
  "generated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "sources": {
    "urlhaus": {
      "url": "$URLHAUS_URL",
      "entries": $LINE_COUNT,
      "size": "$FILE_SIZE"
    },
    "domains": {
      "count": $DOMAIN_COUNT
    }
  }
}
EOF

echo -e "${GREEN}✓ Created data manifest${NC}"

# Step 5: Update extension manifest to include data
echo ""
echo -e "${YELLOW}Step 5: Updating extension manifest...${NC}"

# Add data directory to web_accessible_resources if not already there
if ! grep -q '"data/\*"' "$DIST_DIR/manifest.json"; then
    # Use a temporary file for the modification
    jq '.web_accessible_resources[0].resources += ["data/*"]' \
        "$DIST_DIR/manifest.json" > "$DIST_DIR/manifest.tmp.json" && \
        mv "$DIST_DIR/manifest.tmp.json" "$DIST_DIR/manifest.json"
    echo -e "${GREEN}✓ Updated manifest.json${NC}"
else
    echo -e "${GREEN}✓ Manifest already configured${NC}"
fi

# Step 6: Create ZIP package
echo ""
echo -e "${YELLOW}Step 6: Creating extension package...${NC}"

PACKAGE_NAME="dr-dom-v1.0.0-with-database.zip"
PACKAGE_PATH="$OUTPUT_DIR/$PACKAGE_NAME"

# Remove old package if exists
rm -f "$PACKAGE_PATH"

# Create ZIP (excluding unnecessary files)
cd "$DIST_DIR"
zip -r "$PACKAGE_PATH" . \
    -x "*.DS_Store" \
    -x "*/.git/*" \
    -x "*/node_modules/*" \
    -x "*.map" \
    -x "*.log" \
    -q

cd "$PROJECT_DIR"

if [ -f "$PACKAGE_PATH" ]; then
    PACKAGE_SIZE=$(du -h "$PACKAGE_PATH" | cut -f1)
    echo -e "${GREEN}✓ Created package: $PACKAGE_PATH ($PACKAGE_SIZE)${NC}"
else
    echo -e "${RED}✗ Failed to create package${NC}"
    exit 1
fi

# Step 7: Create lite version without full database
echo ""
echo -e "${YELLOW}Step 7: Creating lite version (no database)...${NC}"

LITE_PACKAGE_NAME="dr-dom-v1.0.0-lite.zip"
LITE_PACKAGE_PATH="$OUTPUT_DIR/$LITE_PACKAGE_NAME"

# Temporarily move data directory
mv "$DATA_DIR" "$DATA_DIR.tmp"

# Create lite ZIP
cd "$DIST_DIR"
zip -r "$LITE_PACKAGE_PATH" . \
    -x "*.DS_Store" \
    -x "*/.git/*" \
    -x "*/node_modules/*" \
    -x "*.map" \
    -x "*.log" \
    -q

# Restore data directory
mv "$DATA_DIR.tmp" "$DATA_DIR"

cd "$PROJECT_DIR"

if [ -f "$LITE_PACKAGE_PATH" ]; then
    LITE_SIZE=$(du -h "$LITE_PACKAGE_PATH" | cut -f1)
    echo -e "${GREEN}✓ Created lite package: $LITE_PACKAGE_PATH ($LITE_SIZE)${NC}"
fi

# Step 8: Generate statistics
echo ""
echo -e "${YELLOW}Step 8: Package Statistics${NC}"
echo "=============================="
echo -e "Full Package:  ${GREEN}$PACKAGE_SIZE${NC}"
echo -e "Lite Package:  ${GREEN}$LITE_SIZE${NC}"
echo -e "Database Size: ${GREEN}$FILE_SIZE${NC}"
echo -e "Malicious URLs: ${GREEN}$LINE_COUNT${NC}"
echo -e "Malicious Domains: ${GREEN}$DOMAIN_COUNT${NC}"
echo ""

# Step 9: Installation instructions
echo -e "${YELLOW}Installation Instructions:${NC}"
echo "=============================="
echo "1. Open Chrome and navigate to: chrome://extensions/"
echo "2. Enable 'Developer mode' (top right)"
echo "3. Drag and drop the package file:"
echo "   - Full version: $PACKAGE_PATH"
echo "   - Lite version: $LITE_PACKAGE_PATH"
echo ""
echo -e "${GREEN}✓ Packaging complete!${NC}"
echo ""
echo -e "${YELLOW}Notes:${NC}"
echo "- Full version includes offline malware database (recommended)"
echo "- Lite version downloads database on first run (smaller size)"
echo "- Database auto-updates every 6 hours when running"
echo ""

# Create a package info file
cat > "$OUTPUT_DIR/package-info.json" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "packages": {
    "full": {
      "file": "$PACKAGE_NAME",
      "size": "$PACKAGE_SIZE",
      "includes_database": true
    },
    "lite": {
      "file": "$LITE_PACKAGE_NAME",
      "size": "$LITE_SIZE",
      "includes_database": false
    }
  },
  "database": {
    "urlhaus_entries": $LINE_COUNT,
    "malicious_domains": $DOMAIN_COUNT,
    "last_update": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  }
}
EOF

echo -e "${GREEN}Package info saved to: $OUTPUT_DIR/package-info.json${NC}"
echo ""
echo "🎉 Done!"