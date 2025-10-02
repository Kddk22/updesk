# UpDesk Projektstruktur

## 📁 Hauptverzeichnis

```
updesk/
├── 📄 docker-compose.yml          # Einzige Docker Compose Datei (Apache)
├── 📄 Dockerfile                  # Multi-stage Build
├── 📄 apache.conf                 # Apache VirtualHost Konfiguration
├── 📄 apache-httpd.conf           # Apache Haupt-Konfiguration
├── 📄 generate-ssl-certs.sh       # SSL-Zertifikat Generator
├── 📄 docker-publish.sh           # Docker Hub Publish Script
├── 📄 update.sh                   # Update Script
│
├── 📚 Dokumentation
│   ├── README.md                  # Hauptdokumentation
│   ├── INSTALL.md                 # Installationsanleitung
│   ├── MIGRATION-TO-APACHE.md     # Migrationsübersicht
│   ├── CHANGELOG.md               # Änderungsprotokoll
│   └── LICENSE                    # MIT Lizenz
│
├── 🔧 Konfiguration
│   ├── package.json               # Node.js Dependencies
│   ├── vite.config.js             # Vite Build-Konfiguration
│   ├── .dockerignore              # Docker Build Excludes
│   └── .gitignore                 # Git Excludes
│
├── 🎨 Frontend (Vue.js 3)
│   ├── src/
│   │   ├── App.vue                # Haupt-App-Komponente
│   │   ├── main.js                # Vue Entry Point
│   │   ├── components/            # Vue Komponenten
│   │   │   ├── DesktopWindow.vue
│   │   │   ├── Dock.vue
│   │   │   ├── Taskbar.vue
│   │   │   ├── TopBar.vue
│   │   │   ├── ProgramIcon.vue
│   │   │   ├── ProgramModal.vue
│   │   │   ├── SettingsModal.vue
│   │   │   ├── UpdateModal.vue
│   │   │   ├── IconSelector.vue
│   │   │   └── ContextMenu.vue
│   │   ├── stores/                # Pinia State Management
│   │   │   ├── programs.js
│   │   │   ├── settings.js
│   │   │   └── windowManager.js
│   │   ├── views/                 # Page Components
│   │   │   ├── Desktop.vue
│   │   │   └── apps/              # Integrierte Apps
│   │   ├── styles/                # CSS Styles
│   │   │   └── main.css
│   │   └── utils/                 # Utilities
│   │       └── api.js             # API Client
│   │
│   ├── public/                    # Statische Assets
│   │   ├── favicon.svg
│   │   ├── icons/                 # App Icons
│   │   │   ├── default-app.svg
│   │   │   ├── docker.svg
│   │   │   ├── github.svg
│   │   │   ├── nextcloud.svg
│   │   │   ├── proxmox.svg
│   │   │   └── ... (weitere Icons)
│   │   └── wallpapers/            # Hintergrundbilder
│   │       ├── ubuntu_standard.png
│   │       ├── updesk.png
│   │       ├── windows.png
│   │       └── ... (weitere Wallpapers)
│   │
│   └── dist/                      # Build Output (generiert)
│       ├── index.html
│       ├── assets/
│       ├── icons/
│       └── wallpapers/
│
├── 🔌 Backend (Node.js/Express)
│   └── server/
│       ├── index.js               # Express Server
│       ├── database.js            # SQLite Konfiguration
│       └── routes/                # API Routes
│           ├── programs.js        # Program CRUD
│           ├── settings.js        # Settings API
│           ├── icons.js           # Icon Management
│           ├── notizen.js         # Notes App
│           ├── zaehler.js         # Counter App
│           ├── zaehlerstaende.js  # Counter Readings
│           ├── transaktionen.js   # Transactions App
│           └── updates.js         # Update System
│
├── 💾 Daten (Docker Volumes)
│   └── data/
│       └── updesk.db              # SQLite Datenbank
│
└── 🔒 SSL
    └── ssl/
        ├── cert.pem               # SSL Zertifikat
        ├── key.pem                # SSL Private Key
        └── README.md              # SSL Dokumentation
```

## 🐳 Docker-Architektur

### Container
1. **updesk-backend** (Port 5002)
   - Node.js/Express API Server
   - SQLite Datenbank
   - Statische Dateien in `/app/dist`

2. **updesk-app** (Ports 80, 443)
   - Apache HTTP Server 2.4
   - Reverse Proxy für API (`/api/*`)
   - Direct Static File Serving
   - HTTP/2 und SSL Support

### Volumes
- `updesk_data`: SQLite Datenbank (persistent)
- `updesk_static`: Frontend Build (shared zwischen Backend und Apache)

### Network
- `updesk_network`: Bridge Network für Container-Kommunikation

## 📊 Datenfluss

```
Browser
   ↓
Apache (Port 80/443)
   ├─→ /api/*        → Backend (Port 5002)
   └─→ /assets/*     → Direct Static Serving (updesk_static volume)
       /index.html
       /favicon.svg
```

## 🔧 Build-Prozess

### Lokaler Build
```bash
docker-compose up -d
```

1. Dockerfile Stage 1: Frontend Build
   - `npm ci` (Dependencies installieren)
   - `npm run build` (Vite Build)
   - Output: `/app/dist`

2. Dockerfile Stage 2: Production
   - Node.js Alpine Image
   - Backend kopieren
   - Frontend Build kopieren
   - Volume Mount für Apache

### GitHub Build
```yaml
build: https://github.com/uptec-ps/updesk.git
```

### Docker Hub
```yaml
image: uptecps/updesk:latest
```

## 📝 Konfigurationsdateien

### docker-compose.yml
- Service-Definitionen
- Volume-Mappings
- Network-Konfiguration
- Build-Optionen (3 Varianten)

### apache.conf
- VirtualHost für HTTP (Port 80)
- VirtualHost für HTTPS (Port 443)
- ProxyPass für `/api/*`
- Static File Serving
- Caching-Regeln
- Gzip-Kompression
- Security Headers

### apache-httpd.conf
- LoadModule Direktiven
- MPM Event Konfiguration
- HTTP/2 Support
- SSL/TLS Konfiguration
- Include VirtualHost

### Dockerfile
- Multi-stage Build
- Frontend Build (Node.js)
- Backend Production (Node.js Alpine)
- Health Check
- Non-root User

## 🚀 Deployment-Optionen

### Entwicklung
```bash
npm run dev        # Frontend (Port 5173)
npm run server     # Backend (Port 5002)
```

### Produktion (Docker)
```bash
docker-compose up -d
```

### CI/CD (GitHub Actions)
- Automatischer Build bei Push
- Multi-Platform Support (amd64, arm64)
- Docker Hub Publish

## 📦 Dependencies

### Frontend
- Vue.js 3
- Pinia (State Management)
- Vite (Build Tool)
- Axios (HTTP Client)

### Backend
- Express.js
- SQLite3
- CORS
- Helmet (Security)

### Docker
- Node.js 18 Alpine
- Apache HTTP Server 2.4 Alpine

## 🔍 Wichtige Dateien

| Datei | Zweck | Bearbeiten? |
|-------|-------|-------------|
| `docker-compose.yml` | Container-Orchestrierung | ✅ Ja (Ports, Volumes) |
| `apache.conf` | Apache VirtualHost | ⚠️ Nur bei Bedarf |
| `apache-httpd.conf` | Apache Hauptconfig | ⚠️ Nur bei Bedarf |
| `Dockerfile` | Image Build | ❌ Nein (außer Anpassungen) |
| `package.json` | Node.js Dependencies | ✅ Ja (neue Packages) |
| `vite.config.js` | Build-Konfiguration | ⚠️ Nur bei Bedarf |

## 📚 Weitere Dokumentation

- **Installation**: [INSTALL.md](INSTALL.md)
- **Migration**: [MIGRATION-TO-APACHE.md](MIGRATION-TO-APACHE.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)
- **Hauptdoku**: [README.md](README.md)

---

**Projektstruktur optimiert für Apache! 🚀**
