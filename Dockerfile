# Multi-stage build for production optimization
# GitHub Repository: https://github.com/uptec-ps/updesk
# Docker Hub: uptecps/updesk
# 
# Build from GitHub:
#   docker build -t updesk https://github.com/uptec-ps/updesk.git
#
# Pull from Docker Hub:
#   docker pull uptecps/updesk:latest

# Stage 1: Build the Vue.js frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Set Node options for better memory handling in emulated environments
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy package files
COPY package*.json ./

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Install all dependencies (including devDependencies needed for build)
# Use --legacy-peer-deps and increase timeout for ARM64 builds
RUN npm ci --silent --legacy-peer-deps --fetch-timeout=300000 || \
    npm install --silent --legacy-peer-deps --fetch-timeout=300000

# Copy source code
COPY . .

# Build the frontend with error handling
RUN npm run build || (echo "Build failed, retrying with verbose output..." && npm run build --verbose)

# Stage 2: Setup the production server
FROM node:18-alpine AS production

# Set production environment
ENV NODE_ENV=production
ENV PORT=5002

# Install dumb-init and build dependencies for native modules
RUN apk add --no-cache dumb-init python3 make g++

# Create app directory and user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S updesk -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies with increased timeout
RUN npm ci --only=production --silent --fetch-timeout=300000 || \
    npm install --only=production --silent --fetch-timeout=300000 && \
    npm cache clean --force

# Remove build dependencies to reduce image size
RUN apk del python3 make g++

# Copy server files
COPY server/ ./server/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/dist ./dist

# Create data directory for SQLite database
RUN mkdir -p /app/data && \
    chown -R updesk:nodejs /app

# Copy static assets
COPY public/ ./public/

# Copy update script
COPY update.sh ./update.sh
RUN chmod +x ./update.sh

# Switch to non-root user
USER updesk

# Expose port
EXPOSE 5002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5002/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]