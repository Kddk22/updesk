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

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Stage 2: Setup the production server
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S updesk -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --silent && \
    npm cache clean --force

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
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]