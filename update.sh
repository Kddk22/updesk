#!/bin/bash

# UpDesk Update Script
# This script updates the UpDesk application to a new version from GitHub

set -e  # Exit on error

VERSION=$1
GITHUB_OWNER="uptec-ps"
GITHUB_REPO="updesk"
TEMP_DIR="/tmp/updesk-update"
BACKUP_DIR="/tmp/updesk-backup-$(date +%Y%m%d-%H%M%S)"
APP_DIR="/app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}UpDesk Update Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if version is provided
if [ -z "$VERSION" ]; then
    echo -e "${RED}Error: Version not specified${NC}"
    echo "Usage: $0 <version>"
    exit 1
fi

echo -e "${YELLOW}Target Version: ${VERSION}${NC}"
echo ""

# Create lock file
touch /tmp/updesk-update.lock

# Function to cleanup on exit
cleanup() {
    rm -f /tmp/updesk-update.lock
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
cp -r "$APP_DIR/data" "$BACKUP_DIR/" 2>/dev/null || true
cp "$APP_DIR/package.json" "$BACKUP_DIR/" 2>/dev/null || true
echo -e "${GREEN}✓ Backup created at $BACKUP_DIR${NC}"
echo ""

# Download new version
echo -e "${YELLOW}Downloading version ${VERSION}...${NC}"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Download tarball from GitHub
DOWNLOAD_URL="https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/archive/refs/tags/v${VERSION}.tar.gz"
echo "Downloading from: $DOWNLOAD_URL"

if ! curl -L -o update.tar.gz "$DOWNLOAD_URL"; then
    echo -e "${RED}Error: Failed to download update${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Download complete${NC}"
echo ""

# Extract archive
echo -e "${YELLOW}Extracting files...${NC}"
tar -xzf update.tar.gz
EXTRACTED_DIR=$(find . -maxdepth 1 -type d -name "${GITHUB_REPO}-*" | head -n 1)

if [ -z "$EXTRACTED_DIR" ]; then
    echo -e "${RED}Error: Failed to extract archive${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Files extracted${NC}"
echo ""

# Stop application (if running with PM2 or similar)
echo -e "${YELLOW}Preparing for update...${NC}"

# Copy new files (excluding data directory and node_modules)
echo -e "${YELLOW}Installing new version...${NC}"
cd "$EXTRACTED_DIR"

# Copy application files
rsync -av --exclude='node_modules' --exclude='data' --exclude='.git' --exclude='dist' ./ "$APP_DIR/"

echo -e "${GREEN}✓ Files copied${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
cd "$APP_DIR"
npm ci --only=production --silent

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
npm run build

echo -e "${GREEN}✓ Frontend built${NC}"
echo ""

# Restore data directory
if [ -d "$BACKUP_DIR/data" ]; then
    echo -e "${YELLOW}Restoring data...${NC}"
    cp -r "$BACKUP_DIR/data"/* "$APP_DIR/data/" 2>/dev/null || true
    echo -e "${GREEN}✓ Data restored${NC}"
    echo ""
fi

# Update complete
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Update Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Version: ${GREEN}${VERSION}${NC}"
echo -e "Backup: ${YELLOW}${BACKUP_DIR}${NC}"
echo ""
echo -e "${YELLOW}Restarting application...${NC}"

# Restart the application
# In Docker, we can exit and let the container restart
# Or use process manager if available
if command -v pm2 &> /dev/null; then
    pm2 restart all
elif [ -f "/.dockerenv" ]; then
    # In Docker, exit to trigger restart
    echo -e "${GREEN}Container will restart automatically${NC}"
    sleep 2
    kill 1  # Send signal to PID 1 to restart container
else
    # Manual restart needed
    echo -e "${YELLOW}Please restart the application manually${NC}"
fi

exit 0