# Docker Compose Varianten für UpDesk

Dieses Repository enthält mehrere `docker-compose.yml` Varianten für verschiedene Anwendungsfälle.

## 📁 Verfügbare Dateien

### 1. `docker-compose.yml` (Standard - Lokale Entwicklung)
**Verwendung**: Lokale Entwicklung mit Git Clone

**Features**:
- ✅ Build from GitHub oder lokalen Dateien
- ✅ Apache Reverse Proxy mit HTTPS
- ✅ Vollständige Konfiguration
- ✅ Custom Wallpapers & Icons

**Voraussetzungen**:
- Repository geklont
- Lokale Konfigurationsdateien vorhanden
- SSL-Zertifikate generiert

**Start**:
```bash
git clone https://github.com/uptec-ps/updesk.git
cd updesk
./generate-ssl-certs.sh
docker-compose up -d
```

**Zugriff**:
- HTTP: http://localhost
- HTTPS: https://localhost

---

### 2. `docker-compose.portainer.yml` (Portainer - Einfach)
**Verwendung**: Portainer Installation - nur Backend

**Features**:
- ✅ Nur Docker Hub Image
- ✅ Keine lokalen Dateien benötigt
- ✅ Ein Container
- ✅ Einfache Konfiguration

**Voraussetzungen**:
- Nur Portainer

**Start in Portainer**:
1. Stacks → Add Stack
2. Name: `updesk`
3. YAML aus `docker-compose.portainer.yml` kopieren
4. Deploy

**Zugriff**:
- Backend: http://SERVER-IP:5002

---

### 3. `docker-compose.portainer-full.yml` (Portainer - Vollständig)
**Verwendung**: Portainer Installation - Backend + Nginx

**Features**:
- ✅ Nur Docker Hub Image
- ✅ Keine lokalen Dateien benötigt
- ✅ Nginx Reverse Proxy
- ✅ Standard HTTP Port (80)
- ✅ Eingebettete Nginx-Konfiguration

**Voraussetzungen**:
- Nur Portainer

**Start in Portainer**:
1. Stacks → Add Stack
2. Name: `updesk-full`
3. YAML aus `docker-compose.portainer-full.yml` kopieren
4. Deploy

**Zugriff**:
- Frontend: http://SERVER-IP

---

## 🔍 Vergleich

| Feature | Standard | Portainer (Einfach) | Portainer (Vollständig) |
|---------|----------|---------------------|-------------------------|
| **Datei** | `docker-compose.yml` | `docker-compose.portainer.yml` | `docker-compose.portainer-full.yml` |
| **Lokale Dateien** | ✅ Erforderlich | ❌ Nicht benötigt | ❌ Nicht benötigt |
| **Container** | 2 (Backend + Apache) | 1 (Backend) | 2 (Backend + Apache) |
| **Reverse Proxy** | Apache | - | Apache |
| **HTTPS** | ✅ Ja | ❌ Nein | ❌ Nein (kann erweitert werden) |
| **Port** | 80, 443 | 5002 | 80 |
| **Komplexität** | Hoch | Niedrig | Mittel |
| **Portainer-geeignet** | ❌ Nein | ✅ Ja | ✅ Ja |

---

## 🎯 Welche Variante soll ich verwenden?

### Verwende `docker-compose.yml` wenn:
- ✅ Du das Repository lokal geklont hast
- ✅ Du HTTPS mit eigenen Zertifikaten brauchst
- ✅ Du Apache als Reverse Proxy bevorzugst
- ✅ Du die volle Kontrolle über die Konfiguration willst

### Verwende `docker-compose.portainer.yml` wenn:
- ✅ Du Portainer verwendest
- ✅ Du nur das Backend brauchst
- ✅ Du einen anderen Reverse Proxy davor hast
- ✅ Du die einfachste Installation willst

### Verwende `docker-compose.portainer-full.yml` wenn:
- ✅ Du Portainer verwendest
- ✅ Du eine vollständige Lösung mit Reverse Proxy willst
- ✅ Du keine lokalen Dateien haben willst
- ✅ Du Apache bevorzugst (wie im Original)

---

## 🚨 Häufige Probleme

### Problem: "Nur Backend-Container startet in Portainer"

**Ursache**: Die Standard-`docker-compose.yml` verwendet relative Pfade zu lokalen Dateien, die in Portainer nicht verfügbar sind.

**Lösung**: Verwende `docker-compose.portainer.yml` oder `docker-compose.portainer-full.yml`

### Problem: "Apache Container startet nicht"

**Ursache**: Fehlende Konfigurationsdateien (`apache.conf`, `apache-httpd.conf`, `ssl/`)

**Lösung**: 
1. Entweder: Repository klonen und lokal starten
2. Oder: Portainer-Variante verwenden

### Problem: "Port 80 bereits belegt"

**Lösung**: Port in der YAML ändern:
```yaml
ports:
  - "8080:80"  # Statt "80:80"
```

---

## 📝 Anpassungen

### Port ändern

**Portainer Einfach** (Port 5002 → 8080):
```yaml
ports:
  - "8080:5002"  # Statt "5002:5002"
```

**Portainer Vollständig** (Port 80 → 8080):
```yaml
ports:
  - "8080:80"  # Statt "80:80"
```

### Eigene Domain verwenden

In `docker-compose.portainer-full.yml` die Nginx-Konfiguration anpassen:
```yaml
server_name deine-domain.de;  # Statt localhost
```

### HTTPS hinzufügen

Für HTTPS empfehlen wir einen externen Reverse Proxy:
- **Traefik** (automatische Let's Encrypt Zertifikate)
- **Nginx Proxy Manager** (GUI für Nginx)
- **Caddy** (automatische HTTPS)

---

## 🔄 Migration zwischen Varianten

### Von Standard zu Portainer

1. **Daten sichern**:
   ```bash
   docker cp updesk-backend:/app/data/updesk.db ./backup.db
   ```

2. **Alte Installation stoppen**:
   ```bash
   docker-compose down
   ```

3. **Portainer-Variante deployen** (siehe oben)

4. **Daten wiederherstellen**:
   ```bash
   docker cp ./backup.db updesk-backend:/app/data/updesk.db
   docker restart updesk-backend
   ```

---

## 📚 Weitere Dokumentation

- **Portainer Installation**: Siehe `PORTAINER-INSTALL.md`
- **Docker Installation**: Siehe `DOCKER-README.md`
- **Allgemeine Installation**: Siehe `INSTALL.md`

---

**Hinweis**: Alle Varianten verwenden das gleiche Docker Image (`uptecps/updesk:latest`) und sind funktional identisch. Der Unterschied liegt nur in der Deployment-Methode und dem Reverse Proxy.