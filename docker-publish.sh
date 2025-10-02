#!/bin/bash

# UpDesk Docker Hub Publishing Script
# Builds and publishes the Docker image to Docker Hub

set -e

# Configuration
DOCKER_USERNAME="uptecps"
IMAGE_NAME="updesk"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🐳 UpDesk Docker Hub Publishing Script${NC}"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    exit 1
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}📦 Version: ${VERSION}${NC}"

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username: ${DOCKER_USERNAME}"; then
    echo -e "${YELLOW}🔐 Please login to Docker Hub:${NC}"
    docker login
fi

echo ""
echo -e "${GREEN}🔨 Building Docker image...${NC}"
docker build -t ${FULL_IMAGE_NAME}:latest -t ${FULL_IMAGE_NAME}:${VERSION} .

echo ""
echo -e "${GREEN}✅ Build successful!${NC}"
echo ""
echo -e "${YELLOW}📋 Image tags:${NC}"
echo "  - ${FULL_IMAGE_NAME}:latest"
echo "  - ${FULL_IMAGE_NAME}:${VERSION}"

echo ""
read -p "Push to Docker Hub? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}📤 Pushing to Docker Hub...${NC}"
    docker push ${FULL_IMAGE_NAME}:latest
    docker push ${FULL_IMAGE_NAME}:${VERSION}
    
    echo ""
    echo -e "${GREEN}✅ Successfully published to Docker Hub!${NC}"
    echo ""
    echo -e "${YELLOW}📦 Image available at:${NC}"
    echo "  https://hub.docker.com/r/${FULL_IMAGE_NAME}"
    echo ""
    echo -e "${YELLOW}🚀 Users can now install with:${NC}"
    echo "  docker pull ${FULL_IMAGE_NAME}:latest"
    echo "  docker-compose -f docker-compose.hub.yml up -d"
else
    echo -e "${YELLOW}⏭️  Skipped publishing${NC}"
fi

echo ""
echo -e "${GREEN}✨ Done!${NC}"