# 🚀 Quick Start: Update-System

## In 5 Minuten zum ersten Update!

### Schritt 1: Ersten Release erstellen

```bash
# 1. Stelle sicher, dass package.json die richtige Version hat
cat package.json | grep version
# Sollte zeigen: "version": "1.0.0"

# 2. Committen Sie alle Änderungen
git add .
git commit -m "Add automatic update system"

# 3. Erstellen Sie einen Git Tag
git tag -a v1.0.0 -m "Initial Release v1.0.0"

# 4. Pushen Sie alles zu GitHub
git push origin main
git push origin v1.0.0
```

### Schritt 2: GitHub Release erstellen

1. Öffnen Sie: https://github.com/uptec-ps/updesk/releases/new

2. Füllen Sie das Formular aus:
   ```
   Tag: v1.0.0
   Release title: Version 1.0.0 - Initial Release
   
   Description:
   ## 🎉 Initial Release
   
   ### Features
   - Virtual Desktop Environment
   - Integrated Apps (UpFlow, UpSum, UpNote, Port Documentation)
   - External App Support
   - Dark/Light Theme
   - Automatic Update System
   
   ### Installation
   ```bash
   docker-compose up -d
   ```
   ```

3. Klicken Sie auf **"Publish release"**

### Schritt 3: Docker Container bauen

```bash
# Container neu bauen (mit Update-System)
docker-compose build

# Container starten
docker-compose up -d

# Logs prüfen
docker-compose logs -f app
```

### Schritt 4: Testen

```bash
# 1. Öffnen Sie im Browser
http://localhost

# 2. Prüfen Sie die API
curl http://localhost:3001/api/updates/check

# Sollte zeigen:
# {
#   "currentVersion": "1.0.0",
#   "latestVersion": "1.0.0",
#   "updateAvailable": false
# }
```

### Schritt 5: Erstes Update testen

```bash
# 1. Ändern Sie die Version in package.json
vim package.json
# Ändern Sie: "version": "1.0.0" → "1.0.1"

# 2. Committen
git add package.json
git commit -m "Release v1.0.1"

# 3. Tag erstellen
git tag -a v1.0.1 -m "Version 1.0.1 - Update Test"

# 4. Pushen
git push origin main
git push origin v1.0.1

# 5. GitHub Release erstellen
# Gehen Sie zu: https://github.com/uptec-ps/updesk/releases/new
# Tag: v1.0.1
# Title: Version 1.0.1 - Update Test
# Description:
# ## 🔧 Update Test
# - Test des automatischen Update-Systems
```

### Schritt 6: Update-Icon sollte erscheinen!

Nach ca. 30 Sekunden (oder Seite neu laden):

1. **Update-Icon erscheint** in der TopBar (oben rechts)
   - Rotierendes Icon
   - Rote Badge mit "1"

2. **Klicken Sie auf das Icon**
   - Modal öffnet sich
   - Zeigt: 1.0.0 → 1.0.1

3. **Klicken Sie "Jetzt aktualisieren"**
   - Update wird installiert
   - Container startet neu
   - Seite lädt automatisch neu

4. **Fertig!**
   - Version ist jetzt 1.0.1
   - Update-Icon verschwindet

## 🎯 Cheat Sheet

### Neue Version veröffentlichen (Kurzform)

```bash
# Version erhöhen
vim package.json  # z.B. 1.0.1 → 1.0.2

# Git
git add .
git commit -m "Release v1.0.2"
git tag -a v1.0.2 -m "Version 1.0.2"
git push origin main v1.0.2

# GitHub Release erstellen (Web-Interface)
# https://github.com/uptec-ps/updesk/releases/new
```

### Update-Status prüfen

```bash
# Aktuelle Version
curl http://localhost:3001/api/updates/status

# Auf Updates prüfen
curl http://localhost:3001/api/updates/check

# Update installieren
curl -X POST http://localhost:3001/api/updates/install
```

### Container-Befehle

```bash
# Logs anzeigen
docker-compose logs -f app

# Container neu starten
docker-compose restart app

# In Container einloggen
docker exec -it updesk-app sh

# Backups anzeigen
docker exec updesk-app ls -la /tmp/updesk-backup-*
```

## 🐛 Troubleshooting

### Update-Icon erscheint nicht?

```bash
# 1. Browser-Konsole öffnen (F12)
# 2. Prüfen auf Fehler

# 3. API manuell testen
curl http://localhost:3001/api/updates/check

# 4. Container-Logs prüfen
docker-compose logs app | grep -i update
```

### Update schlägt fehl?

```bash
# 1. Logs prüfen
docker-compose logs app

# 2. In Container einloggen
docker exec -it updesk-app sh

# 3. Update-Script manuell ausführen
bash /app/update.sh 1.0.1

# 4. Bei Problemen: Backup wiederherstellen
ls -la /tmp/updesk-backup-*
cp -r /tmp/updesk-backup-YYYYMMDD-HHMMSS/data/* /app/data/
```

## 📝 Release Notes Template

```markdown
## 🎉 Version X.Y.Z

### ✨ Neue Features
- Feature 1: Beschreibung
- Feature 2: Beschreibung

### 🐛 Bugfixes
- Fix 1: Beschreibung
- Fix 2: Beschreibung

### 🔧 Verbesserungen
- Verbesserung 1: Beschreibung
- Verbesserung 2: Beschreibung

### ⚠️ Breaking Changes
- Change 1: Beschreibung und Migration

### 📦 Installation
\`\`\`bash
docker-compose pull
docker-compose up -d
\`\`\`

### 🔄 Update
Das Update kann direkt über die Anwendung installiert werden:
1. Klicken Sie auf das Update-Icon in der TopBar
2. Klicken Sie auf "Jetzt aktualisieren"
3. Warten Sie bis die Anwendung neu startet
```

## 🎓 Best Practices

### Versionierung

- **MAJOR** (1.0.0 → 2.0.0): Breaking Changes
- **MINOR** (1.0.0 → 1.1.0): Neue Features
- **PATCH** (1.0.0 → 1.0.1): Bugfixes

### Release-Zyklus

1. **Development** → Entwicklung neuer Features
2. **Testing** → Testen in Entwicklungsumgebung
3. **Staging** → Testen in produktionsähnlicher Umgebung
4. **Release** → Tag erstellen und GitHub Release veröffentlichen
5. **Deployment** → Benutzer installieren Update über UI

### Backup-Strategie

- Automatisches Backup vor jedem Update
- Backups werden in `/tmp` gespeichert
- Alte Backups manuell löschen (nach erfolgreicher Verifizierung)

```bash
# Alte Backups löschen (älter als 7 Tage)
docker exec updesk-app find /tmp -name "updesk-backup-*" -mtime +7 -exec rm -rf {} \;
```

## 🎉 Fertig!

Sie haben jetzt ein vollständig funktionierendes automatisches Update-System!

### Was Sie jetzt haben:
- ✅ Automatische Update-Erkennung
- ✅ Benutzerfreundliche Update-Installation
- ✅ Sichere Backups
- ✅ Automatischer Neustart
- ✅ Vollständige Dokumentation

### Nächste Schritte:
1. Erstellen Sie Ihren ersten Release (v1.0.0)
2. Testen Sie das Update-System (v1.0.1)
3. Nutzen Sie es für echte Updates!

---

**Viel Erfolg! 🚀**

Bei Fragen: Siehe [UPDATE-SYSTEM.md](./UPDATE-SYSTEM.md) für Details.