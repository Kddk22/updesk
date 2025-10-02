# UpDesk Update-System

## 📋 Übersicht

Das UpDesk Update-System ermöglicht automatische Updates direkt aus der Anwendung heraus. Es prüft regelmäßig auf neue Versionen im GitHub Repository und bietet eine benutzerfreundliche Oberfläche zum Installieren von Updates.

## ✨ Features

### 1. **Automatische Update-Prüfung**
- Prüft beim Start der Anwendung auf Updates
- Wiederholte Prüfung alle 30 Minuten
- Vergleicht lokale Version mit GitHub Releases

### 2. **Visuelles Update-Icon**
- Animiertes Update-Symbol in der TopBar
- Rote Badge mit Anzahl verfügbarer Updates
- Nur sichtbar wenn Update verfügbar ist

### 3. **Update-Modal**
- Zeigt aktuelle und neue Version an
- Anzeige der Release Notes
- Warnung vor Neustart
- Fortschrittsanzeige während des Updates

### 4. **Sicherer Update-Prozess**
- Automatisches Backup der Datenbank
- Download der neuen Version von GitHub
- Installation mit Dependency-Management
- Automatischer Neustart nach Update

## 🏗️ Architektur

### Backend API (`/api/updates`)

#### `GET /api/updates/check`
Prüft auf verfügbare Updates.

**Response:**
```json
{
  "currentVersion": "1.0.0",
  "latestVersion": "1.1.0",
  "updateAvailable": true,
  "releaseInfo": {
    "version": "1.1.0",
    "name": "Version 1.1.0 - Feature Update",
    "body": "## Neue Features\n- Feature 1\n- Feature 2",
    "publishedAt": "2024-01-15T10:00:00Z",
    "htmlUrl": "https://github.com/uptec-ps/updesk/releases/tag/v1.1.0"
  }
}
```

#### `POST /api/updates/install`
Startet den Update-Prozess.

**Response:**
```json
{
  "success": true,
  "message": "Update process started",
  "currentVersion": "1.0.0",
  "targetVersion": "1.1.0",
  "note": "The application will restart automatically after the update"
}
```

#### `GET /api/updates/status`
Gibt den aktuellen Update-Status zurück.

**Response:**
```json
{
  "currentVersion": "1.0.0",
  "isUpdating": false,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Frontend Komponenten

#### `TopBar.vue`
- Zeigt Update-Icon wenn verfügbar
- Prüft regelmäßig auf Updates
- Öffnet Update-Modal

#### `UpdateModal.vue`
- Zeigt Update-Informationen
- Startet Update-Prozess
- Zeigt Fortschritt und Status

### Update-Script (`update.sh`)

Bash-Script das den eigentlichen Update-Prozess durchführt:

1. **Backup erstellen**
   - Sichert Datenbank (`/app/data`)
   - Sichert `package.json`

2. **Download**
   - Lädt Release von GitHub
   - Extrahiert Archiv

3. **Installation**
   - Kopiert neue Dateien
   - Installiert Dependencies
   - Baut Frontend

4. **Wiederherstellung**
   - Stellt Datenbank wieder her
   - Behält Benutzerdaten

5. **Neustart**
   - Startet Container neu (Docker)
   - Oder nutzt PM2 (falls verfügbar)

## 🚀 Verwendung

### Für Benutzer

1. **Update-Benachrichtigung**
   - Wenn ein Update verfügbar ist, erscheint ein animiertes Icon in der TopBar
   - Klicken Sie auf das Icon um Details zu sehen

2. **Update installieren**
   - Lesen Sie die Release Notes
   - Klicken Sie auf "Jetzt aktualisieren"
   - Warten Sie bis das Update abgeschlossen ist
   - Die Anwendung startet automatisch neu

### Für Entwickler

#### Neue Version veröffentlichen

1. **Version in package.json aktualisieren**
   ```json
   {
     "version": "1.1.0"
   }
   ```

2. **Git Tag erstellen**
   ```bash
   git tag -a v1.1.0 -m "Version 1.1.0 - Feature Update"
   git push origin v1.1.0
   ```

3. **GitHub Release erstellen**
   - Gehen Sie zu: https://github.com/uptec-ps/updesk/releases/new
   - Wählen Sie den Tag: `v1.1.0`
   - Titel: `Version 1.1.0 - Feature Update`
   - Beschreibung: Release Notes in Markdown
   - Klicken Sie auf "Publish release"

4. **Automatische Erkennung**
   - UpDesk-Instanzen erkennen das neue Release automatisch
   - Benutzer werden benachrichtigt

## 🔧 Konfiguration

### GitHub Repository

Die Repository-Informationen sind in `server/routes/updates.js` konfiguriert:

```javascript
const GITHUB_OWNER = 'uptec-ps';
const GITHUB_REPO = 'updesk';
```

### Update-Intervall

Das Prüf-Intervall ist in `TopBar.vue` konfiguriert:

```javascript
// Check for updates on mount and every 30 minutes
checkForUpdates()
updateCheckInterval = setInterval(checkForUpdates, 30 * 60 * 1000)
```

### Docker-Konfiguration

Für automatische Neustarts muss der Container mit Restart-Policy konfiguriert sein:

```yaml
services:
  app:
    restart: unless-stopped
```

## 🐳 Docker-Spezifisch

### Voraussetzungen

1. **rsync installiert**
   ```dockerfile
   RUN apk add --no-cache rsync
   ```

2. **Restart-Policy**
   ```yaml
   restart: unless-stopped
   ```

3. **Volume für Daten**
   ```yaml
   volumes:
     - ./data:/app/data
   ```

### Update-Prozess im Container

1. Script wird im Container ausgeführt
2. Neue Dateien werden heruntergeladen
3. Dependencies werden installiert
4. Frontend wird gebaut
5. Container wird neu gestartet (PID 1 Signal)

## 🔒 Sicherheit

### Backup-Strategie

- Automatisches Backup vor jedem Update
- Backup-Location: `/tmp/updesk-backup-YYYYMMDD-HHMMSS`
- Enthält: Datenbank und Konfiguration

### Rollback

Bei Problemen kann manuell zum Backup zurückgekehrt werden:

```bash
# In Container einloggen
docker exec -it updesk-app sh

# Backup wiederherstellen
cp -r /tmp/updesk-backup-YYYYMMDD-HHMMSS/data/* /app/data/

# Container neu starten
exit
docker restart updesk-app
```

### Fehlerbehandlung

- Update-Lock verhindert parallele Updates
- Fehler werden geloggt
- Bei Fehlern bleibt alte Version aktiv
- Backup bleibt erhalten

## 📊 Monitoring

### Logs prüfen

```bash
# Docker Logs
docker logs updesk-app

# Update-Logs im Container
docker exec updesk-app cat /tmp/updesk-update.log
```

### Update-Status prüfen

```bash
# API-Aufruf
curl http://localhost:3001/api/updates/status
```

## 🧪 Testing

### Lokales Testen

1. **Mock GitHub Release**
   - Erstellen Sie einen Test-Tag
   - Veröffentlichen Sie ein Test-Release

2. **Update-Prüfung testen**
   ```bash
   curl http://localhost:3001/api/updates/check
   ```

3. **Update-Installation testen**
   ```bash
   curl -X POST http://localhost:3001/api/updates/install
   ```

### Entwicklungsumgebung

In der Entwicklungsumgebung (außerhalb Docker) wird das Update-System deaktiviert:

```javascript
if (!isDocker) {
  return res.status(400).json({ 
    error: 'Updates are only supported in Docker containers'
  });
}
```

## 📝 Versionierung

UpDesk verwendet [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.x.x): Breaking Changes
- **MINOR** (x.1.x): Neue Features (rückwärtskompatibel)
- **PATCH** (x.x.1): Bugfixes

## 🎨 UI/UX

### Update-Icon
- Animiertes Rotations-Icon
- Pulsierender Badge
- Hover-Effekt

### Update-Modal
- Moderne, responsive Oberfläche
- Klare Versionsinformationen
- Formatierte Release Notes
- Fortschrittsanzeige
- Erfolgs-/Fehler-Feedback

## 🔄 Workflow

```
┌─────────────────┐
│  App startet    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Prüfe Updates   │◄──────┐
└────────┬────────┘       │
         │                │
         ▼                │
    Update verfügbar?     │
         │                │
    ┌────┴────┐          │
    │ Ja      │ Nein     │
    ▼         └──────────┤
┌─────────────────┐      │
│ Zeige Icon      │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│ User klickt     │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│ Zeige Modal     │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│ User bestätigt  │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│ Starte Update   │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│ Download        │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│ Installation    │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│ Neustart        │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│ App startet     │──────┘
└─────────────────┘
```

## 🆘 Troubleshooting

### Update wird nicht erkannt

1. Prüfen Sie die GitHub API:
   ```bash
   curl https://api.github.com/repos/uptec-ps/updesk/releases/latest
   ```

2. Prüfen Sie die Version in `package.json`

3. Prüfen Sie die Browser-Konsole auf Fehler

### Update schlägt fehl

1. Prüfen Sie die Container-Logs
2. Prüfen Sie die Netzwerkverbindung
3. Prüfen Sie die Berechtigungen
4. Stellen Sie das Backup wieder her

### Container startet nicht neu

1. Prüfen Sie die Restart-Policy
2. Prüfen Sie die Docker-Logs
3. Starten Sie manuell neu:
   ```bash
   docker restart updesk-app
   ```

## 📚 Weitere Ressourcen

- [GitHub Releases API](https://docs.github.com/en/rest/releases)
- [Semantic Versioning](https://semver.org/)
- [Docker Restart Policies](https://docs.docker.com/config/containers/start-containers-automatically/)

---

**Hinweis:** Das Update-System ist nur in Docker-Containern verfügbar. Für manuelle Installationen müssen Updates manuell durchgeführt werden.