---
description: Repository Information Overview
alwaysApply: true
---

# UpDesk Information

## Summary
UpDesk is a modern, Ubuntu-inspired virtual desktop application built with Vue.js 3 and deployed with Docker. It provides a web-based desktop interface with features like program management, theme switching, and customizable wallpapers.

## Structure
- **public/**: Static assets including icons and wallpapers
- **src/**: Vue.js frontend source code with components, stores, and views
- **server/**: Express.js backend API with SQLite database integration
- **dist/**: Production build output directory
- **data/**: SQLite database storage

## Language & Runtime
**Language**: JavaScript (ES Modules)
**Frontend Framework**: Vue.js 3.4.0 with Composition API
**Backend Framework**: Express.js 4.18.2
**Build System**: Vite 5.0.0
**Package Manager**: npm
**Node Version**: 18.x (Alpine in Docker)

## Dependencies
**Main Dependencies**:
- vue: ^3.4.0
- vue-router: ^4.2.5
- pinia: ^2.1.7 (State management)
- express: ^4.18.2
- sqlite3: ^5.1.6
- cors: ^2.8.5
- helmet: ^7.1.0 (Security)
- compression: ^1.7.4

**Development Dependencies**:
- @vitejs/plugin-vue: ^5.0.0
- vite: ^5.0.0
- concurrently: ^8.2.2
- nodemon: ^3.0.2

## Build & Installation
```bash
# Development mode
npm install
npm run dev

# Production build
npm run build
npm run start

# Docker deployment
docker-compose up -d
```

## Docker
**Dockerfile**: Multi-stage build process
- Stage 1: Build Vue.js frontend with Node.js 18 Alpine
- Stage 2: Production server with Node.js 18 Alpine

**Docker Compose**:
- Main service: updesk (Node.js application)
- Optional: nginx reverse proxy (commented out by default)
- Persistent volumes for database and customizable assets

**Configuration**:
- Exposed port: 3001
- Environment variables: NODE_ENV, PORT
- Health check endpoint: /api/health

## Main Files
**Frontend Entry**: src/main.js
**Backend Entry**: server/index.js
**Database**: SQLite with automatic initialization (server/database.js)
**API Routes**:
- /api/programs - Program management
- /api/settings - Settings management

## Testing
No dedicated testing framework found in the project configuration.

## Database Schema
**Programs Table**: Stores application shortcuts with name, URL, icon, and position
**Settings Table**: Stores application settings like theme and wallpaper preferences