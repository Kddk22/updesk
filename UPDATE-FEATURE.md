# 🔄 Update-Feature Implementierung

## ✅ Implementierte Funktionen

Das automatische Update-System für UpDesk wurde erfolgreich implementiert!

### 🎯 Features

1. **Automatische Update-Erkennung**
   - ✅ Prüft GitHub Releases beim Start
   - ✅ Wiederholte Prüfung alle 30 Minuten
   - ✅ Vergleicht lokale mit neuester Version

2. **Visuelles Feedback**
   - ✅ Animiertes Update-Icon in der TopBar
   - ✅ Rote Badge mit Update-Anzahl
   - ✅ Nur sichtbar wenn Update verfügbar

3. **Update-Modal**
   - ✅ Zeigt aktuelle und neue Version
   - ✅ Formatierte Release Notes
   - ✅ Veröffentlichungsdatum
   - ✅ Warnhinweis vor Neustart
   - ✅ Fortschrittsanzeige
   - ✅ Erfolgs-/Fehler-Meldungen

4. **Automatischer Update-Prozess**
   - ✅ Backup der Datenbank
   - ✅ Download von GitHub
   - ✅ Installation der Dependencies
   - ✅ Frontend-Build
   - ✅ Datenwiederherstellung
   - ✅ Automatischer Neustart

## 📁 Erstellte Dateien

### Backend
- ✅ `server/routes/updates.js` - Update API Endpoints
  - `GET /api/updates/check` - Prüft auf Updates
  - `POST /api/updates/install` - Startet Update
  - `GET /api/updates/status` - Update-Status

### Frontend
- ✅ `src/components/UpdateModal.vue` - Update-Dialog
- ✅ `src/components/TopBar.vue` - Erweitert mit Update-Icon

### Scripts
- ✅ `update.sh` - Bash-Script für Update-Prozess

### Dokumentation
- ✅ `UPDATE-SYSTEM.md` - Vollständige Dokumentation
- ✅ `UPDATE-FEATURE.md` - Diese Datei

## 🔧 Geänderte Dateien

1. **server/index.js**
   - Import von `updatesRouter`
   - Route `/api/updates` registriert

2. **Dockerfile**
   - `rsync`, `curl`, `bash` installiert
   - `update.sh` kopiert und ausführbar gemacht

3. **src/components/TopBar.vue**
   - Update-Icon hinzugefügt
   - Update-Prüfung implementiert
   - UpdateModal integriert

## 🚀 Verwendung

### Für Endbenutzer

1. **Update-Benachrichtigung sehen**
   ```
   Wenn ein Update verfügbar ist, erscheint ein rotierendes 
   Icon mit roter Badge in der TopBar (oben rechts)
   ```

2. **Update-Details ansehen**
   ```
   Klicken Sie auf das Update-Icon
   → Modal öffnet sich mit Versionsinformationen
   ```

3. **Update installieren**
   ```
   Klicken Sie auf "Jetzt aktualisieren"
   → Update wird heruntergeladen und installiert
   → Anwendung startet automatisch neu
   ```

### Für Entwickler

#### Neue Version veröffentlichen

```bash
# 1. Version in package.json erhöhen
vim package.json  # z.B. "1.0.0" → "1.1.0"

# 2. Änderungen committen
git add .
git commit -m "Release v1.1.0"

# 3. Tag erstellen
git tag -a v1.1.0 -m "Version 1.1.0 - Feature Update"

# 4. Pushen
git push origin main
git push origin v1.1.0

# 5. GitHub Release erstellen
# Gehen Sie zu: https://github.com/uptec-ps/updesk/releases/new
# - Tag: v1.1.0
# - Titel: Version 1.1.0 - Feature Update
# - Beschreibung: Release Notes in Markdown
# - "Publish release" klicken
```

#### Release Notes Format

```markdown
## 🎉 Neue Features
- Feature 1: Beschreibung
- Feature 2: Beschreibung

## 🐛 Bugfixes
- Fix 1: Beschreibung
- Fix 2: Beschreibung

## 🔧 Verbesserungen
- Verbesserung 1: Beschreibung
- Verbesserung 2: Beschreibung

## ⚠️ Breaking Changes
- Change 1: Beschreibung und Migration
```

## 🧪 Testing

### Lokales Testen (Development)

```bash
# Server starten
npm run dev

# In Browser öffnen
http://localhost:3000

# Update-API testen
curl http://localhost:3001/api/updates/check
```

**Hinweis:** In der Entwicklungsumgebung wird das Update-System deaktiviert (nur Docker-Support).

### Docker Testen

```bash
# Container bauen
docker-compose build

# Container starten
docker-compose up -d

# Logs prüfen
docker-compose logs -f app

# Update-API testen
curl http://localhost:3001/api/updates/check

# In Browser öffnen
http://localhost
```

## 🔍 API Endpoints

### Check for Updates
```bash
curl http://localhost:3001/api/updates/check
```

**Response:**
```json
{
  "currentVersion": "1.0.0",
  "latestVersion": "1.1.0",
  "updateAvailable": true,
  "releaseInfo": {
    "version": "1.1.0",
    "name": "Version 1.1.0",
    "body": "## Release Notes...",
    "publishedAt": "2024-01-15T10:00:00Z",
    "htmlUrl": "https://github.com/uptec-ps/updesk/releases/tag/v1.1.0"
  }
}
```

### Install Update
```bash
curl -X POST http://localhost:3001/api/updates/install
```

**Response:**
```json
{
  "success": true,
  "message": "Update process started",
  "currentVersion": "1.0.0",
  "targetVersion": "1.1.0"
}
```

### Get Update Status
```bash
curl http://localhost:3001/api/updates/status
```

**Response:**
```json
{
  "currentVersion": "1.0.0",
  "isUpdating": false,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## 🎨 UI Komponenten

### Update-Icon (TopBar)
- **Position:** TopBar rechts, vor Theme-Toggle
- **Sichtbarkeit:** Nur wenn Update verfügbar
- **Animation:** Rotation (2s)
- **Badge:** Rote Badge mit Anzahl (pulsierend)

### Update-Modal
- **Trigger:** Klick auf Update-Icon
- **Inhalt:**
  - Versionsvergleich (aktuell → neu)
  - Release-Titel und Datum
  - Formatierte Release Notes
  - Warnhinweis
  - Aktions-Buttons

- **Zustände:**
  - Initial: Informationen + Buttons
  - Updating: Spinner + Fortschritt
  - Success: Erfolgs-Icon + Countdown
  - Error: Fehler-Icon + Meldung

## 🔒 Sicherheit

### Backup-Strategie
- Automatisches Backup vor jedem Update
- Location: `/tmp/updesk-backup-YYYYMMDD-HHMMSS`
- Inhalt: Datenbank + Konfiguration

### Rollback
```bash
# Container-Shell öffnen
docker exec -it updesk-app sh

# Backups anzeigen
ls -la /tmp/updesk-backup-*

# Backup wiederherstellen
cp -r /tmp/updesk-backup-YYYYMMDD-HHMMSS/data/* /app/data/

# Container neu starten
exit
docker restart updesk-app
```

## 📊 Monitoring

### Logs überwachen
```bash
# Docker Logs
docker logs -f updesk-app

# Update-Logs im Container
docker exec updesk-app tail -f /tmp/updesk-update.log
```

### Update-Status prüfen
```bash
# Via API
curl http://localhost:3001/api/updates/status

# Im Container
docker exec updesk-app cat /tmp/updesk-update.lock
```

## 🐛 Troubleshooting

### Problem: Update-Icon erscheint nicht

**Lösung:**
1. Browser-Konsole öffnen (F12)
2. Prüfen auf Fehler
3. API manuell testen:
   ```bash
   curl http://localhost:3001/api/updates/check
   ```

### Problem: Update schlägt fehl

**Lösung:**
1. Container-Logs prüfen:
   ```bash
   docker logs updesk-app
   ```
2. Netzwerkverbindung prüfen
3. GitHub API prüfen:
   ```bash
   curl https://api.github.com/repos/uptec-ps/updesk/releases/latest
   ```

### Problem: Container startet nicht neu

**Lösung:**
1. Restart-Policy prüfen:
   ```bash
   docker inspect updesk-app | grep -A 5 RestartPolicy
   ```
2. Manuell neu starten:
   ```bash
   docker restart updesk-app
   ```

## 📝 Konfiguration

### GitHub Repository ändern

In `server/routes/updates.js`:
```javascript
const GITHUB_OWNER = 'uptec-ps';  // Ändern
const GITHUB_REPO = 'updesk';     // Ändern
```

### Update-Intervall ändern

In `src/components/TopBar.vue`:
```javascript
// Alle 30 Minuten (Standard)
updateCheckInterval = setInterval(checkForUpdates, 30 * 60 * 1000)

// Alle 10 Minuten
updateCheckInterval = setInterval(checkForUpdates, 10 * 60 * 1000)

// Jede Stunde
updateCheckInterval = setInterval(checkForUpdates, 60 * 60 * 1000)
```

## 🎯 Nächste Schritte

1. **Ersten Release erstellen**
   - Version in `package.json` auf `1.0.0` setzen
   - Tag `v1.0.0` erstellen
   - GitHub Release veröffentlichen

2. **Docker Container neu bauen**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. **Update-System testen**
   - Neue Version (z.B. `1.0.1`) erstellen
   - Release veröffentlichen
   - Warten bis Update-Icon erscheint
   - Update durchführen

## 📚 Weitere Dokumentation

- **Vollständige Dokumentation:** `UPDATE-SYSTEM.md`
- **Docker Setup:** `DOCKER-SETUP.md`
- **Änderungsprotokoll:** `CHANGES.md`

---

**Status:** ✅ Vollständig implementiert und einsatzbereit!

**Letzte Aktualisierung:** 2024-01-15