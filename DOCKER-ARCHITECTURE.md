# Docker Architecture & Deployment Flow

## 🏗️ System-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Port 80/443
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Nginx Container                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - SSL/TLS Termination                               │  │
│  │  - Reverse Proxy                                     │  │
│  │  - Gzip Compression                                  │  │
│  │  - Static File Caching                               │  │
│  │  - Security Headers                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Port 3001
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   UpDesk Container                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Frontend (Vue.js)                                   │  │
│  │  ├─ Desktop Environment                              │  │
│  │  ├─ Taskbar Component                                │  │
│  │  ├─ Window Manager                                   │  │
│  │  └─ Integrated Apps                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Backend (Node.js/Express)                           │  │
│  │  ├─ REST API                                         │  │
│  │  ├─ Authentication                                   │  │
│  │  ├─ File Management                                  │  │
│  │  └─ Health Checks                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Volume Mount
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Persistent Storage                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  updesk_data Volume                                  │  │
│  │  └─ database.db (SQLite)                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Optional Mounts                                     │  │
│  │  ├─ ./wallpapers → /app/public/wallpapers            │  │
│  │  ├─ ./icons → /app/public/icons                      │  │
│  │  └─ ./ssl → /etc/nginx/ssl                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Deployment Flow

### Methode 1: Docker Hub

```
┌──────────────┐
│  Developer   │
└──────┬───────┘
       │ git push
       ▼
┌──────────────┐
│    GitHub    │
└──────┬───────┘
       │ trigger
       ▼
┌──────────────────┐
│ GitHub Actions   │
│  - Build Image   │
│  - Run Tests     │
│  - Multi-Arch    │
└──────┬───────────┘
       │ push
       ▼
┌──────────────┐
│  Docker Hub  │
│ uptecps/     │
│   updesk     │
└──────┬───────┘
       │ pull
       ▼
┌──────────────┐
│  End User    │
│ docker-      │
│ compose up   │
└──────────────┘
```

### Methode 2: GitHub Build

```
┌──────────────┐
│  Developer   │
└──────┬───────┘
       │ git push
       ▼
┌──────────────┐
│    GitHub    │
│  Repository  │
└──────┬───────┘
       │ build from
       ▼
┌──────────────┐
│  End User    │
│ docker-      │
│ compose      │
│ build        │
└──────────────┘
```

### Methode 3: Lokaler Build

```
┌──────────────┐
│  Developer   │
└──────┬───────┘
       │ git clone
       ▼
┌──────────────┐
│    Local     │
│  Repository  │
└──────┬───────┘
       │ docker build
       ▼
┌──────────────┐
│    Local     │
│    Image     │
└──────┬───────┘
       │ docker run
       ▼
┌──────────────┐
│  Container   │
└──────────────┘
```

## 📦 Multi-Stage Build Process

```
┌─────────────────────────────────────────────────────────────┐
│                    Stage 1: Frontend Builder                 │
├─────────────────────────────────────────────────────────────┤
│  FROM node:18-alpine                                         │
│  ├─ COPY package*.json                                       │
│  ├─ RUN npm ci                                               │
│  ├─ COPY source files                                        │
│  └─ RUN npm run build                                        │
│     └─ Output: /app/dist                                     │
└────────────────────────┬────────────────────────────────────┘
                         │ copy dist/
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Stage 2: Production                       │
├─────────────────────────────────────────────────────────────┤
│  FROM node:18-alpine                                         │
│  ├─ Install dumb-init                                        │
│  ├─ Create non-root user                                     │
│  ├─ COPY package*.json                                       │
│  ├─ RUN npm ci --only=production                             │
│  ├─ COPY server/                                             │
│  ├─ COPY --from=frontend-builder /app/dist                   │
│  ├─ COPY public/                                             │
│  └─ CMD ["npm", "start"]                                     │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
                  Final Image (~200MB)
```

## 🌐 Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network: updesk_network            │
│                         (Bridge Mode)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  nginx:alpine    │────────▶│  updesk-app      │         │
│  │  Port: 80, 443   │  3001   │  Port: 3001      │         │
│  │  (Public)        │         │  (Internal)      │         │
│  └──────────────────┘         └──────────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │                               │
         │ Volume                        │ Volume
         ▼                               ▼
    ./ssl/                          updesk_data/
    ./nginx.conf                    database.db
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Network Security                                   │
│  ├─ Only ports 80/443 exposed                                │
│  ├─ Backend on internal network                              │
│  └─ Bridge network isolation                                 │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Nginx Security                                     │
│  ├─ SSL/TLS 1.2+ only                                        │
│  ├─ Strong cipher suites                                     │
│  ├─ Security headers (HSTS, CSP, etc.)                       │
│  ├─ Rate limiting                                            │
│  └─ Request size limits                                      │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Container Security                                 │
│  ├─ Non-root user (updesk:1001)                              │
│  ├─ Read-only volumes where possible                         │
│  ├─ Minimal base image (Alpine)                              │
│  └─ No unnecessary packages                                  │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Application Security                               │
│  ├─ Input validation                                         │
│  ├─ Authentication                                           │
│  ├─ CORS configuration                                       │
│  └─ Environment-based config                                 │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### User Request Flow

```
User Browser
    │
    │ HTTPS Request
    ▼
Nginx (Port 443)
    │
    │ SSL Termination
    │ Security Headers
    │ Gzip Compression
    ▼
Nginx Routing
    │
    ├─ /api/* ────────────┐
    │                     │
    └─ /* (static) ───┐   │
                      │   │
                      ▼   ▼
                ┌──────────────┐
                │  UpDesk App  │
                │  Port 3001   │
                └──────┬───────┘
                       │
                       ├─ Static Files (Vue.js)
                       │
                       └─ API Endpoints (Express)
                              │
                              ▼
                        ┌──────────┐
                        │ SQLite   │
                        │ Database │
                        └──────────┘
```

## 🔄 Update & Rollback Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Version Management                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Docker Hub Tags:                                            │
│  ├─ latest          → Always newest stable                   │
│  ├─ v1.0.0          → Specific version                       │
│  ├─ v1.0            → Minor version                          │
│  └─ v1              → Major version                          │
│                                                              │
│  Update Process:                                             │
│  1. docker-compose pull                                      │
│  2. docker-compose up -d                                     │
│  3. Health check                                             │
│  4. If OK: Done                                              │
│  5. If Error: Rollback                                       │
│                                                              │
│  Rollback:                                                   │
│  1. docker-compose down                                      │
│  2. docker tag uptecps/updesk:v1.0.0 uptecps/updesk:latest  │
│  3. docker-compose up -d                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💾 Backup Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Backup Components                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Database Backup:                                         │
│     docker-compose exec updesk \                             │
│       cp /app/data/database.db /app/data/backup.db          │
│                                                              │
│  2. Volume Backup:                                           │
│     docker run --rm \                                        │
│       -v updesk_data:/data \                                 │
│       -v $(pwd):/backup \                                    │
│       alpine tar czf /backup/updesk-data.tar.gz /data        │
│                                                              │
│  3. Configuration Backup:                                    │
│     tar czf config-backup.tar.gz \                           │
│       docker-compose.yml \                                   │
│       nginx.conf \                                           │
│       ssl/                                                   │
│                                                              │
│  4. Restore:                                                 │
│     docker-compose down                                      │
│     docker volume rm updesk_data                             │
│     docker volume create updesk_data                         │
│     docker run --rm \                                        │
│       -v updesk_data:/data \                                 │
│       -v $(pwd):/backup \                                    │
│       alpine tar xzf /backup/updesk-data.tar.gz -C /         │
│     docker-compose up -d                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                    Optimization Layers                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Build Optimization:                                      │
│     ├─ Multi-stage build (smaller image)                     │
│     ├─ Layer caching (faster rebuilds)                       │
│     ├─ .dockerignore (smaller context)                       │
│     └─ Production dependencies only                          │
│                                                              │
│  2. Runtime Optimization:                                    │
│     ├─ Nginx caching (static files)                          │
│     ├─ Gzip compression (smaller transfers)                  │
│     ├─ HTTP/2 (multiplexing)                                 │
│     └─ Keepalive connections                                 │
│                                                              │
│  3. Resource Limits:                                         │
│     ├─ Memory limits (prevent OOM)                           │
│     ├─ CPU limits (fair sharing)                             │
│     └─ Restart policies (auto-recovery)                      │
│                                                              │
│  4. Monitoring:                                              │
│     ├─ Health checks (every 30s)                             │
│     ├─ Container stats (docker stats)                        │
│     └─ Log aggregation (docker logs)                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Dieses Dokument visualisiert die komplette Docker-Architektur von UpDesk.**