# Docker Deployment Guide für UpDesk

## 📦 Übersicht

Dieses Dokument beschreibt, wie UpDesk auf Docker Hub veröffentlicht wird und wie Benutzer es installieren können.

## 🔗 Repository-Informationen

- **GitHub:** https://github.com/uptec-ps/updesk
- **Docker Hub:** https://hub.docker.com/r/uptecps/updesk
- **Docker Image:** `uptecps/updesk:latest`

## 📝 Erstellte Dateien

### 1. Docker-Konfiguration

| Datei | Beschreibung |
|-------|--------------|
| `Dockerfile` | Multi-stage Build mit GitHub/Docker Hub URLs |
| `docker-compose.yml` | Standard-Compose (lokaler Build) mit Performance-Optimierung |
| `docker-compose.apache.yml` | Apache-Version (statt nginx) |
| `docker-compose.github.yml` | Build direkt von GitHub |
| `docker-compose.hub.yml` | Pull von Docker Hub |
| `.dockerignore` | Optimiert Image-Größe |
| `nginx.conf` | Optimierte nginx-Konfiguration mit direktem Static-File-Serving |
| `apache.conf` | Apache VirtualHost-Konfiguration |
| `apache-httpd.conf` | Apache Haupt-Konfiguration |

### 2. Dokumentation

| Datei | Beschreibung |
|-------|--------------|
| `INSTALL.md` | Einfache Schnellinstallation für Endbenutzer |
| `DOCKER-SETUP.md` | Detaillierte Docker-Konfiguration |
| `DOCKER-README.md` | README für Docker Hub |
| `DOCKER-DEPLOYMENT-GUIDE.md` | Diese Datei |
| `PERFORMANCE-OPTIMIZATION.md` | Performance-Optimierungen und Benchmarks |
| `APACHE-MIGRATION.md` | Migration von nginx zu Apache |

### 3. Automatisierung

| Datei | Beschreibung |
|-------|--------------|
| `docker-publish.sh` | Manuelles Publish-Script |
| `.github/workflows/docker-publish.yml` | GitHub Actions für Auto-Deploy |

## 🚀 Deployment-Prozess

### Schritt 1: Docker Hub Account vorbereiten

1. Erstelle Account auf https://hub.docker.com
2. Erstelle Repository: `uptecps/updesk`
3. Notiere Username und Password

### Schritt 2: GitHub Secrets konfigurieren

Gehe zu GitHub Repository → Settings → Secrets and variables → Actions

Füge hinzu:
- `DOCKER_USERNAME`: `uptecps`
- `DOCKER_PASSWORD`: Dein Docker Hub Token

### Schritt 3: Manuelles Veröffentlichen

```bash
# Login zu Docker Hub
docker login

# Build und Push mit Script
./docker-publish.sh

# Oder manuell
docker build -t uptecps/updesk:latest .
docker push uptecps/updesk:latest
```

### Schritt 4: Automatisches Veröffentlichen

GitHub Actions wird automatisch ausgelöst bei:
- Push zu `main` Branch → `latest` Tag
- Git Tag `v*` → Versionierte Tags (z.B. `v1.0.0`)
- Pull Requests → Test-Build (kein Push)

```bash
# Neue Version veröffentlichen
git tag v1.0.0
git push origin v1.0.0

# Automatisch erstellt:
# - uptecps/updesk:latest
# - uptecps/updesk:1.0.0
# - uptecps/updesk:1.0
# - uptecps/updesk:1
```

## 📥 Installations-Methoden für Benutzer

### Methode 1: Docker Hub (Schnellste)

```bash
# Dateien herunterladen
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/docker-compose.hub.yml
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/nginx.conf
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/generate-ssl-certs.sh
chmod +x generate-ssl-certs.sh

# SSL generieren und starten
./generate-ssl-certs.sh
docker-compose -f docker-compose.hub.yml up -d
```

**Vorteile:**
- ✅ Kein Build erforderlich
- ✅ Schnellste Installation
- ✅ Vorgefertigtes, getestetes Image

### Methode 2: GitHub Build

```bash
# Dateien herunterladen
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/docker-compose.github.yml
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/nginx.conf
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/generate-ssl-certs.sh
chmod +x generate-ssl-certs.sh

# SSL generieren und starten
./generate-ssl-certs.sh
docker-compose -f docker-compose.github.yml up -d
```

**Vorteile:**
- ✅ Immer aktuellster Code
- ✅ Kein Repository-Clone nötig
- ✅ Transparent (Build von Source)

### Methode 3: Lokaler Build

```bash
# Repository klonen
git clone https://github.com/uptec-ps/updesk.git
cd updesk

# SSL generieren und starten
./generate-ssl-certs.sh
docker-compose up -d
```

**Vorteile:**
- ✅ Volle Kontrolle
- ✅ Für Entwickler
- ✅ Anpassungen möglich

## 🔄 Update-Prozess

### Für Docker Hub Benutzer

```bash
# Neue Version pullen
docker-compose -f docker-compose.hub.yml pull

# Neu starten
docker-compose -f docker-compose.hub.yml up -d
```

### Für GitHub Build Benutzer

```bash
# Neu bauen (holt automatisch neuesten Code)
docker-compose -f docker-compose.github.yml build --no-cache

# Neu starten
docker-compose -f docker-compose.github.yml up -d
```

### Für lokale Entwickler

```bash
# Code aktualisieren
git pull

# Neu bauen und starten
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Multi-Platform Support

Das GitHub Actions Workflow baut für:
- `linux/amd64` (Intel/AMD)
- `linux/arm64` (ARM, z.B. Raspberry Pi)

```bash
# Automatisch richtige Architektur
docker pull uptecps/updesk:latest
```

## 🔍 Verifizierung

### Image-Informationen prüfen

```bash
# Image inspizieren
docker inspect uptecps/updesk:latest

# Labels anzeigen
docker inspect uptecps/updesk:latest | jq '.[0].Config.Labels'

# Größe prüfen
docker images uptecps/updesk
```

### Health Check

```bash
# Container starten
docker run -d -p 3001:3001 --name updesk-test uptecps/updesk:latest

# Health prüfen
curl http://localhost:3001/api/health

# Logs prüfen
docker logs updesk-test

# Aufräumen
docker stop updesk-test
docker rm updesk-test
```

## 📈 Best Practices

### Versionierung

```bash
# Semantic Versioning verwenden
git tag v1.0.0  # Major release
git tag v1.1.0  # Minor update
git tag v1.1.1  # Patch/Bugfix

# Tags pushen
git push origin --tags
```

### Image-Optimierung

- ✅ Multi-stage Build (bereits implementiert)
- ✅ Alpine Linux Base (klein)
- ✅ .dockerignore (reduziert Build-Context)
- ✅ Layer-Caching (npm ci vor COPY)
- ✅ Non-root User (Sicherheit)
- ✅ Shared Volumes für statische Dateien (Performance)
- ✅ nginx serviert statische Dateien direkt (schneller)

### Performance-Optimierung

**Siehe [PERFORMANCE-OPTIMIZATION.md](PERFORMANCE-OPTIMIZATION.md) für Details**

Die aktuelle Architektur nutzt:
- nginx/Apache serviert statische Dateien direkt (50-75% schneller)
- Backend nur für API-Requests
- Aggressive Browser-Caching (1 Jahr für Assets)
- Gzip-Kompression
- HTTP/2 Support

### Webserver-Wahl: nginx vs Apache

**nginx (Standard):**
- ✅ Sehr schnell für statische Dateien
- ✅ Niedriger Speicherverbrauch
- ✅ Einfache Konfiguration

**Apache (Alternative):**
- ✅ Extrem stabil unter Last
- ✅ Bewährte Enterprise-Lösung
- ✅ Umfangreiche Module und Flexibilität

**Siehe [APACHE-MIGRATION.md](APACHE-MIGRATION.md) für Apache-Setup**

### Sicherheit

```bash
# Image scannen
docker scan uptecps/updesk:latest

# Vulnerabilities prüfen
trivy image uptecps/updesk:latest
```

## 🎯 Marketing & Distribution

### Docker Hub Beschreibung

Die `DOCKER-README.md` wird automatisch auf Docker Hub hochgeladen und enthält:
- Quick Start Guide
- Feature-Liste
- Beispiele
- Troubleshooting
- Links zur Dokumentation

### README.md aktualisieren

Füge Docker-Installation zum Haupt-README hinzu:

```markdown
## 🐳 Docker Installation

### Quick Start
\`\`\`bash
docker-compose -f docker-compose.hub.yml up -d
\`\`\`

See [INSTALL.md](INSTALL.md) for detailed instructions.
```

## 📞 Support

### Für Benutzer

- GitHub Issues: https://github.com/uptec-ps/updesk/issues
- Dokumentation: [INSTALL.md](INSTALL.md)
- Docker Hub: https://hub.docker.com/r/uptecps/updesk

### Für Entwickler

- Contribution Guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Development Setup: [README.md](README.md)
- Docker Setup: [DOCKER-SETUP.md](DOCKER-SETUP.md)

## ✅ Checkliste vor Veröffentlichung

- [ ] Docker Hub Account erstellt
- [ ] GitHub Secrets konfiguriert
- [ ] Lokaler Build getestet
- [ ] GitHub Actions Workflow getestet
- [ ] Dokumentation aktualisiert
- [ ] README.md mit Docker-Infos ergänzt
- [ ] Erste Version getaggt (v1.0.0)
- [ ] Image auf Docker Hub verifiziert
- [ ] Installation von Docker Hub getestet
- [ ] Installation von GitHub getestet

## 🎉 Nach der Veröffentlichung

1. **Ankündigung erstellen**
   - GitHub Release mit Changelog
   - Docker Hub Description aktualisieren

2. **Monitoring einrichten**
   - Docker Hub Pull-Statistiken
   - GitHub Actions Status
   - Issue-Tracking

3. **Community informieren**
   - Social Media Posts
   - Blog-Artikel
   - Dokumentation teilen

---

**Viel Erfolg mit dem Deployment! 🚀**