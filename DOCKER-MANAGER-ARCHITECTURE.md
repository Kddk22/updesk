# Docker Manager - Architektur

## 📐 System-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           UpDesk Desktop (Vue.js 3)                   │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │      Docker Manager Component                   │  │  │
│  │  │  - Container List                               │  │  │
│  │  │  - Stats Display                                │  │  │
│  │  │  - Logs Viewer                                  │  │  │
│  │  │  - Control Buttons                              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Server                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Docker API Routes                        │  │
│  │  /api/docker/containers                               │  │
│  │  /api/docker/containers/:id/logs                      │  │
│  │  /api/docker/containers/:id/stats                     │  │
│  │  /api/docker/containers/:id/start                     │  │
│  │  /api/docker/containers/:id/stop                      │  │
│  │  /api/docker/containers/:id/restart                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Dockerode Library
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Docker Socket                              │
│              /var/run/docker.sock                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Docker API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Docker Engine                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Container1│  │Container2│  │Container3│  │Container4│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Datenfluss

### 1. Container-Liste abrufen
```
Browser → GET /api/docker/containers
         ↓
Express.js → docker.listContainers()
         ↓
Docker Socket → Docker Engine
         ↓
Docker Engine → Container-Daten
         ↓
Express.js → Anreicherung mit Update-Info
         ↓
Browser ← JSON Response
```

### 2. Update-Erkennung
```
Express.js → Lokales Image inspizieren
         ↓
         → Docker Hub API (Token holen)
         ↓
         → Docker Hub API (Manifest abrufen)
         ↓
         → Digest-Vergleich
         ↓
Browser ← Update-Status
```

### 3. Container starten
```
Browser → POST /api/docker/containers/:id/start
         ↓
Express.js → docker.getContainer(id).start()
         ↓
Docker Socket → Docker Engine
         ↓
Docker Engine → Container starten
         ↓
Browser ← Success Response
         ↓
Browser → Auto-Refresh (Container-Liste neu laden)
```

## 📁 Dateistruktur

```
updesk/
├── server/
│   ├── routes/
│   │   └── docker.js              # Docker API Routes
│   └── index.js                   # Route-Integration
├── src/
│   ├── views/
│   │   └── apps/
│   │       └── DockerManager.vue  # Frontend-Komponente
│   └── Desktop.vue                # Integration
├── public/
│   └── icons/
│       └── docker.svg             # Docker-Icon
├── DOCKER-MANAGER.md              # Vollständige Dokumentation
├── DOCKER-MANAGER-QUICKSTART.md   # Schnellstart-Anleitung
├── add-docker-manager.sql         # SQL-Script für bestehende DBs
└── test-docker.js                 # Test-Script
```

## 🔌 API-Endpunkte

### GET /api/docker/containers
**Beschreibung**: Liste aller Container mit angereicherten Daten

**Response**:
```json
[
  {
    "id": "abc123...",
    "name": "updesk-backend",
    "image": "uptecps/updesk:latest",
    "state": "running",
    "status": "Up 2 hours",
    "updateAvailable": true,
    "ports": [...],
    "config": {...},
    "networkSettings": {...}
  }
]
```

### GET /api/docker/containers/:id/logs?tail=100
**Beschreibung**: Container-Logs abrufen

**Query-Parameter**:
- `tail`: Anzahl der Zeilen (default: 100)

**Response**:
```json
{
  "logs": "2024-01-15 10:30:00 Server started\n..."
}
```

### GET /api/docker/containers/:id/stats
**Beschreibung**: Live-Statistiken für Container

**Response**:
```json
{
  "cpu": {
    "percent": "2.45"
  },
  "memory": {
    "usage": 104857600,
    "limit": 2147483648,
    "percent": "4.88",
    "usageMB": "100.00",
    "limitMB": "2048.00"
  }
}
```

### POST /api/docker/containers/:id/start
**Beschreibung**: Container starten

**Response**:
```json
{
  "success": true,
  "message": "Container started"
}
```

## 🎨 Frontend-Komponenten

### DockerManager.vue
**Hauptkomponente** mit folgenden Bereichen:

1. **Header**
   - Container-Anzahl
   - Refresh-Button

2. **Container-Liste**
   - Container-Karten mit Status
   - Action-Buttons
   - Expand/Collapse für Details

3. **Detail-Tabs**
   - Info: Basis-Informationen
   - Ports: Port-Mappings
   - Logs: Container-Logs
   - Env: Umgebungsvariablen

4. **Auto-Refresh**
   - Container-Liste: alle 30 Sekunden
   - Statistiken: alle 5 Sekunden

## 🔐 Sicherheitsarchitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Empfohlenes Setup                         │
└─────────────────────────────────────────────────────────────┘

Internet
   │
   ▼
┌─────────────────┐
│   Firewall      │  ← Nur VPN/lokales Netzwerk
└─────────────────┘
   │
   ▼
┌─────────────────┐
│ Reverse Proxy   │  ← Nginx/Apache mit Auth
│ (Nginx/Apache)  │
└─────────────────┘
   │
   ▼
┌─────────────────┐
│   UpDesk        │  ← Docker Manager
│   (Port 80)     │
└─────────────────┘
   │
   ▼
┌─────────────────┐
│ Docker Socket   │  ← Read-Only Mount
│ (ro)            │
└─────────────────┘
   │
   ▼
┌─────────────────┐
│ Docker Engine   │
└─────────────────┘
```

## 🔄 Update-Erkennungs-Algorithmus

```javascript
// Pseudo-Code
async function checkImageUpdate(container) {
  // 1. Lokales Image inspizieren
  localImage = await docker.getImage(container.Image).inspect()
  localDigest = localImage.RepoDigests[0].split('@')[1]
  
  // 2. Docker Hub Token holen
  token = await getDockerHubToken(imageName)
  
  // 3. Remote Manifest abrufen
  manifest = await getDockerHubManifest(imageName, tag, token)
  remoteDigest = manifest.headers['docker-content-digest']
  
  // 4. Vergleichen
  updateAvailable = (localDigest !== remoteDigest)
  
  return { updateAvailable, localDigest, remoteDigest }
}
```

## 📊 Datenmodell

### Container-Objekt (Frontend)
```typescript
interface Container {
  id: string
  name: string
  image: string
  imageId: string
  state: 'running' | 'exited' | 'paused' | ...
  status: string
  created: number
  ports: Port[]
  updateAvailable: boolean
  updateInfo: UpdateInfo
  config: ContainerConfig
  networkSettings: NetworkSettings
  mounts: Mount[]
  restartCount: number
}
```

### Update-Info
```typescript
interface UpdateInfo {
  updateAvailable: boolean
  currentDigest?: string
  latestDigest?: string
  error?: string
}
```

## 🚀 Performance-Optimierungen

1. **Caching**
   - Update-Checks werden nur bei Container-Refresh durchgeführt
   - Statistiken werden separat aktualisiert (5s Intervall)

2. **Lazy Loading**
   - Logs werden nur geladen, wenn Tab geöffnet wird
   - Details werden nur bei Expand geladen

3. **Batch-Requests**
   - Alle Container-Daten in einem Request
   - Statistiken parallel für alle laufenden Container

4. **Auto-Refresh**
   - Intelligentes Polling (nur wenn Fenster aktiv)
   - Separate Intervalle für verschiedene Daten

## 🧪 Testing

### Manuelle Tests
```bash
# 1. Docker-Verbindung testen
node test-docker.js

# 2. API-Endpunkte testen
curl http://localhost:5002/api/docker/containers

# 3. Frontend testen
npm run dev
# → http://localhost:3000
```

### Automatisierte Tests (TODO)
- Unit-Tests für Docker-Route
- Integration-Tests für API
- E2E-Tests für Frontend

## 📈 Monitoring & Logging

### Backend-Logs
```javascript
// Alle Docker-API-Fehler werden geloggt
console.error('Error fetching containers:', error)
```

### Frontend-Logs
```javascript
// Fehler in Browser-Konsole
console.error('Error loading containers:', err)
```

### Docker-Logs
```bash
# UpDesk Container-Logs
docker logs updesk-backend

# Alle Container-Logs
docker logs <container-name>
```

## 🔮 Zukünftige Erweiterungen

### Geplante Features
1. **Multi-Host Support**
   - Mehrere Docker-Hosts verwalten
   - Swarm/Kubernetes-Integration

2. **Erweiterte Statistiken**
   - Historische Daten
   - Grafische Darstellung
   - Alerts bei hoher Auslastung

3. **Image-Management**
   - Images anzeigen
   - Ungenutzte Images löschen
   - Pull-Funktionalität

4. **Volume-Management**
   - Volumes anzeigen
   - Größe anzeigen
   - Backup-Funktionen

5. **Netzwerk-Management**
   - Netzwerke anzeigen
   - Container-Verbindungen visualisieren

### Nicht geplant (absichtlich)
- Container-Erstellung (zu komplex)
- Compose-File-Editor (Sicherheitsrisiko)
- Root-Zugriff auf Container (Sicherheitsrisiko)

## 📚 Verwendete Technologien

### Backend
- **Express.js**: Web-Framework
- **Dockerode**: Docker API Client
- **Axios**: HTTP Client für Docker Hub

### Frontend
- **Vue.js 3**: UI-Framework
- **Composition API**: Reaktive Datenstruktur
- **Axios**: HTTP Client

### Docker
- **Docker Engine API**: Container-Verwaltung
- **Docker Hub API**: Update-Erkennung

## 🎓 Lernressourcen

- [Docker Engine API](https://docs.docker.com/engine/api/)
- [Dockerode Documentation](https://github.com/apocas/dockerode)
- [Docker Hub API](https://docs.docker.com/docker-hub/api/latest/)
- [Vue.js 3 Documentation](https://vuejs.org/)