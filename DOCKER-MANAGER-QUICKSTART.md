# Docker Manager - Schnellstart

## 🚀 Schnellstart mit Docker Compose

### 1. Docker Compose starten
```bash
docker-compose up -d
```

Das war's! Der Docker Manager ist jetzt verfügbar unter:
- **URL**: http://localhost
- **Desktop-Icon**: "Docker Manager" (mit Docker-Logo)

### 2. Zugriff testen
1. Öffne http://localhost im Browser
2. Klicke auf das "Docker Manager" Icon
3. Du solltest alle laufenden Container sehen

## 📋 Voraussetzungen

- Docker und Docker Compose installiert
- Port 80 verfügbar
- Docker-Socket unter `/var/run/docker.sock`

## 🔧 Manuelle Installation (ohne Docker)

### 1. Dependencies installieren
```bash
npm install
```

### 2. Datenbank initialisieren (falls neu)
```bash
npm run init-db
```

### 3. Entwicklungsserver starten
```bash
npm run dev
```

Der Docker Manager ist dann verfügbar unter:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5002

## 🐳 Docker Manager zu bestehender Installation hinzufügen

Falls du bereits eine UpDesk-Installation hast:

### Option 1: SQL-Script
```bash
sqlite3 data/updesk.db < add-docker-manager.sql
```

### Option 2: Manuell über die UI
1. Rechtsklick auf den Desktop
2. "Programm hinzufügen"
3. Eingeben:
   - **Name**: Docker Manager
   - **URL**: /apps/docker
   - **Icon**: /icons/docker.svg

## 🧪 Docker-Verbindung testen

```bash
node test-docker.js
```

Dieser Befehl testet:
- ✅ Docker-Verbindung
- ✅ Container-Liste
- ✅ Container-Details
- ✅ Statistiken
- ✅ Logs

## 🔐 Sicherheit

⚠️ **WICHTIG**: Der Docker-Socket gibt vollständigen Zugriff auf Docker!

### Empfohlene Konfiguration für Produktion:

1. **Reverse Proxy mit Authentifizierung**
```nginx
location / {
    auth_basic "UpDesk Login";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://localhost:80;
}
```

2. **Firewall-Regel**
```bash
# Nur lokales Netzwerk erlauben
sudo ufw allow from 192.168.1.0/24 to any port 80
```

3. **VPN-Zugriff**
   - Betreibe UpDesk nur über VPN (z.B. WireGuard, OpenVPN)
   - Keine direkte Internet-Exposition

## 📊 Features im Überblick

### ✅ Was funktioniert
- Container anzeigen (alle + nur laufende)
- Container starten/stoppen/neustarten
- Update-Erkennung (Docker Hub)
- Live-Statistiken (CPU, RAM)
- Container-Logs anzeigen
- Port-Mappings anzeigen
- Umgebungsvariablen anzeigen
- Auto-Refresh (30 Sekunden)

### ❌ Was NICHT funktioniert (absichtlich)
- Container erstellen
- Images pullen/löschen
- Volumes verwalten
- Netzwerke erstellen
- Container löschen

Dies ist eine **Read-Only** Lösung zur Überwachung, nicht zur Verwaltung!

## 🐛 Troubleshooting

### Problem: "Container werden nicht angezeigt"
**Lösung**:
```bash
# Prüfe Docker-Socket
ls -la /var/run/docker.sock

# Prüfe Container-Logs
docker logs updesk-backend

# Prüfe Browser-Konsole (F12)
```

### Problem: "Permission denied"
**Lösung**:
```bash
# Temporär (nicht für Produktion!)
sudo chmod 666 /var/run/docker.sock

# Besser: User zur docker-Gruppe hinzufügen
sudo usermod -aG docker $USER
```

### Problem: "Update-Erkennung funktioniert nicht"
**Ursachen**:
- Docker Hub Rate-Limits
- Private Images (nicht unterstützt)
- Netzwerk-Probleme

**Lösung**: Warten oder Docker Hub Login implementieren

## 📚 Weitere Dokumentation

- **Vollständige Dokumentation**: [DOCKER-MANAGER.md](DOCKER-MANAGER.md)
- **API-Dokumentation**: Siehe `server/routes/docker.js`
- **Frontend-Code**: Siehe `src/views/apps/DockerManager.vue`

## 💡 Tipps

1. **Auto-Refresh deaktivieren**: Kommentiere in `DockerManager.vue` die Zeilen mit `setInterval` aus
2. **Mehr Logs anzeigen**: Wähle im Dropdown "Letzte 500 Zeilen"
3. **Schnellerer Refresh**: Ändere `30000` auf `10000` (10 Sekunden)

## 🎯 Nächste Schritte

1. ✅ Installation abgeschlossen
2. ✅ Docker Manager öffnen
3. ✅ Container-Status prüfen
4. ⏭️ Authentifizierung einrichten (empfohlen)
5. ⏭️ Firewall konfigurieren (empfohlen)
6. ⏭️ Backup-Strategie planen

## 🆘 Support

Bei Problemen:
1. Prüfe die Logs: `docker logs updesk-backend`
2. Teste die Docker-Verbindung: `node test-docker.js`
3. Öffne ein Issue: https://github.com/uptec-ps/updesk/issues

Viel Erfolg! 🚀