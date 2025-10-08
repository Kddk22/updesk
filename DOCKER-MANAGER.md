# Docker Manager für UpDesk

Eine vereinfachte Portainer-Alternative, die direkt in UpDesk integriert ist.

## Features

### ✅ Implementiert
- **Container-Übersicht**: Zeigt alle Docker-Container mit Status an
- **Container-Steuerung**: Start, Stop und Restart von Containern
- **Update-Erkennung**: Automatische Erkennung verfügbarer Image-Updates
- **Live-Statistiken**: CPU- und RAM-Nutzung für laufende Container
- **Container-Logs**: Anzeige der Container-Logs mit konfigurierbarer Zeilenzahl
- **Port-Mappings**: Übersicht aller Port-Weiterleitungen
- **Umgebungsvariablen**: Anzeige aller Container-Umgebungsvariablen
- **Auto-Refresh**: Automatische Aktualisierung alle 30 Sekunden

### 🎨 Benutzeroberfläche
- Moderne, übersichtliche Karten-Ansicht
- Farbcodierte Status-Anzeigen (grün = läuft, grau = gestoppt)
- Update-Badge für Container mit verfügbaren Updates
- Tabs für verschiedene Informationsbereiche
- Responsive Design

## Installation

### 1. Dependencies installieren
```bash
npm install
```

Die folgenden Pakete werden automatisch installiert:
- `dockerode`: Docker API Client
- `axios`: HTTP Client für Docker Hub API

### 2. Docker-Socket mounten

#### Für Docker Compose:
Der Docker-Socket ist bereits in der `docker-compose.yml` konfiguriert:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

#### Für Docker Run:
```bash
docker run -d \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -p 80:80 \
  uptecps/updesk:latest
```

### 3. Berechtigungen (Optional)
Wenn der Container als non-root User läuft, müssen Sie möglicherweise die Berechtigungen für den Docker-Socket anpassen:

```bash
# Auf dem Host-System
sudo chmod 666 /var/run/docker.sock
```

**Sicherheitshinweis**: Dies gibt allen Benutzern Zugriff auf Docker. Für Produktionsumgebungen sollten Sie eine sicherere Lösung verwenden.

## Verwendung

1. Öffnen Sie UpDesk im Browser
2. Klicken Sie auf das "Docker Manager" Icon auf dem Desktop
3. Die Container-Liste wird automatisch geladen

### Container-Aktionen
- **▶️ Start**: Startet einen gestoppten Container
- **⏹️ Stop**: Stoppt einen laufenden Container
- **🔄 Restart**: Startet einen Container neu
- **▼ Details**: Zeigt detaillierte Informationen an

### Tabs
- **ℹ️ Info**: Container-ID, Image-ID, Erstellungsdatum, IP-Adresse
- **🔌 Ports**: Port-Mappings und Netzwerk-Konfiguration
- **📋 Logs**: Container-Logs (50-500 Zeilen)
- **🔧 Umgebung**: Umgebungsvariablen

## Update-Erkennung

Der Docker Manager vergleicht automatisch die lokalen Images mit den neuesten Versionen auf Docker Hub:

- **Digest-Vergleich**: Verwendet SHA256-Hashes für präzise Vergleiche
- **Docker Hub API**: Ruft die neuesten Manifeste ab
- **Visuelle Anzeige**: Orange Badge bei verfügbaren Updates

### Unterstützte Registries
- Docker Hub (öffentliche Images)
- Docker Hub (offizielle Library-Images)

### Limitierungen
- Private Registries werden derzeit nicht unterstützt
- Authentifizierung für private Images nicht implementiert
- Rate-Limits von Docker Hub können die Update-Prüfung einschränken

## API-Endpunkte

Der Docker Manager stellt folgende API-Endpunkte bereit:

### Container
- `GET /api/docker/containers` - Liste aller Container
- `GET /api/docker/containers/:id/logs?tail=100` - Container-Logs
- `GET /api/docker/containers/:id/stats` - Container-Statistiken
- `POST /api/docker/containers/:id/start` - Container starten
- `POST /api/docker/containers/:id/stop` - Container stoppen
- `POST /api/docker/containers/:id/restart` - Container neustarten

### System
- `GET /api/docker/info` - Docker-System-Informationen

## Sicherheit

### Wichtige Hinweise
⚠️ **Der Docker-Socket gibt vollständigen Zugriff auf Docker!**

- Jeder mit Zugriff auf UpDesk kann Container steuern
- Container können gestartet, gestoppt und neu gestartet werden
- Logs und Umgebungsvariablen sind sichtbar (können sensible Daten enthalten)

### Empfohlene Sicherheitsmaßnahmen
1. **Authentifizierung**: Setzen Sie UpDesk hinter einen Reverse Proxy mit Authentifizierung
2. **Netzwerk-Isolation**: Verwenden Sie Firewalls, um den Zugriff zu beschränken
3. **Read-Only Mount**: Der Socket ist als `:ro` gemountet (nur Lesen)
4. **VPN**: Betreiben Sie UpDesk nur in einem VPN oder privaten Netzwerk

## Troubleshooting

### Container werden nicht angezeigt
- Prüfen Sie, ob der Docker-Socket korrekt gemountet ist
- Überprüfen Sie die Berechtigungen: `ls -la /var/run/docker.sock`
- Schauen Sie in die Container-Logs: `docker logs updesk-backend`

### Update-Erkennung funktioniert nicht
- Docker Hub Rate-Limits können die API-Anfragen blockieren
- Private Images werden nicht unterstützt
- Prüfen Sie die Browser-Konsole auf Fehler

### Logs werden nicht angezeigt
- Stellen Sie sicher, dass der Container Logs produziert
- Erhöhen Sie die Anzahl der Zeilen (50, 100, 200, 500)
- Manche Container loggen nur nach stderr oder stdout

### Statistiken fehlen
- Statistiken sind nur für laufende Container verfügbar
- Prüfen Sie, ob der Container tatsächlich läuft
- Docker muss cgroups unterstützen

## Entwicklung

### Lokale Entwicklung
```bash
# Backend starten
npm run server:dev

# Frontend starten
npm run client:dev
```

### Dateien
- **Backend**: `server/routes/docker.js`
- **Frontend**: `src/views/apps/DockerManager.vue`
- **Integration**: `src/views/Desktop.vue`

### Erweiterungen
Mögliche zukünftige Features:
- Container-Erstellung (aktuell nicht implementiert)
- Image-Management
- Volume-Verwaltung
- Netzwerk-Konfiguration
- Docker Compose Support
- Multi-Host Support (Swarm/Kubernetes)

## Lizenz

Siehe Haupt-README für Lizenzinformationen.

## Support

Bei Problemen oder Fragen:
- GitHub Issues: https://github.com/uptec-ps/updesk/issues
- Dokumentation: https://github.com/uptec-ps/updesk