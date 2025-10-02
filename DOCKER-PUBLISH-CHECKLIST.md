# Docker Publish Checklist

## 📋 Vor der Veröffentlichung

### 1. Docker Hub Setup
- [ ] Account erstellt auf https://hub.docker.com
- [ ] Repository erstellt: `uptecps/updesk`
- [ ] Repository auf "Public" gesetzt
- [ ] Access Token generiert (Settings → Security)
- [ ] Token sicher gespeichert

### 2. GitHub Secrets
- [ ] Zu Repository Settings → Secrets → Actions navigiert
- [ ] `DOCKER_USERNAME` hinzugefügt: `uptecps`
- [ ] `DOCKER_PASSWORD` hinzugefügt (Docker Hub Token)
- [ ] Secrets getestet (Test-Workflow ausführen)

### 3. Lokale Tests

#### Build-Test
```bash
# Lokales Image bauen
docker build -t updesk-test .

# Image-Größe prüfen (sollte < 300MB sein)
docker images updesk-test

# Container starten
docker run -d -p 3001:3001 --name updesk-test updesk-test

# Health Check
curl http://localhost:3001/api/health

# Logs prüfen
docker logs updesk-test

# Aufräumen
docker stop updesk-test
docker rm updesk-test
docker rmi updesk-test
```

#### Docker Compose Test
```bash
# SSL-Zertifikate generieren
./generate-ssl-certs.sh

# Mit lokalem Build starten
docker-compose up -d

# Prüfen
curl http://localhost/api/health
curl -k https://localhost/api/health

# Browser-Test
# - http://localhost öffnen
# - Apps öffnen und testen
# - Taskbar testen
# - Minimize/Maximize testen

# Logs prüfen
docker-compose logs

# Aufräumen
docker-compose down
```

### 4. Dokumentation
- [ ] README.md aktualisiert mit Docker-Infos
- [ ] INSTALL.md vollständig
- [ ] DOCKER-SETUP.md vollständig
- [ ] DOCKER-README.md für Docker Hub bereit
- [ ] Alle Links funktionieren
- [ ] Screenshots aktuell (optional)

### 5. Code-Qualität
- [ ] Alle Tests laufen durch
- [ ] Keine Console-Errors im Browser
- [ ] Keine Warnungen in Docker Build
- [ ] .dockerignore optimiert
- [ ] package.json Version aktualisiert

## 🚀 Veröffentlichung

### Schritt 1: Manueller Test-Push

```bash
# Login zu Docker Hub
docker login
# Username: uptecps
# Password: [Dein Token]

# Image bauen
docker build -t uptecps/updesk:test .

# Test-Push
docker push uptecps/updesk:test

# Von Docker Hub pullen und testen
docker pull uptecps/updesk:test
docker run -d -p 3001:3001 uptecps/updesk:test

# Prüfen
curl http://localhost:3001/api/health

# Aufräumen
docker stop $(docker ps -q --filter ancestor=uptecps/updesk:test)
docker rmi uptecps/updesk:test
```

- [ ] Test-Push erfolgreich
- [ ] Image auf Docker Hub sichtbar
- [ ] Pull und Run funktioniert
- [ ] Health Check OK

### Schritt 2: Erste offizielle Version

```bash
# Version in package.json prüfen
cat package.json | grep version

# Git Tag erstellen
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions beobachten
# → https://github.com/uptec-ps/updesk/actions

# Warten bis Build fertig (ca. 5-10 Minuten)
```

- [ ] GitHub Actions Workflow gestartet
- [ ] Build erfolgreich (grüner Haken)
- [ ] Image auf Docker Hub erschienen
- [ ] Tags korrekt: `latest`, `1.0.0`, `1.0`, `1`

### Schritt 3: Installation testen

#### Test 1: Docker Hub Installation
```bash
# Neues Verzeichnis
mkdir test-dockerhub && cd test-dockerhub

# Dateien herunterladen
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/docker-compose.hub.yml
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/nginx.conf
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/generate-ssl-certs.sh
chmod +x generate-ssl-certs.sh

# Starten
./generate-ssl-certs.sh
docker-compose -f docker-compose.hub.yml up -d

# Testen
curl http://localhost/api/health
# Browser: http://localhost

# Aufräumen
docker-compose -f docker-compose.hub.yml down -v
cd .. && rm -rf test-dockerhub
```

- [ ] Download erfolgreich
- [ ] Start erfolgreich
- [ ] Health Check OK
- [ ] Browser-Zugriff OK
- [ ] Alle Apps funktionieren

#### Test 2: GitHub Build Installation
```bash
# Neues Verzeichnis
mkdir test-github && cd test-github

# Dateien herunterladen
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/docker-compose.github.yml
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/nginx.conf
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/generate-ssl-certs.sh
chmod +x generate-ssl-certs.sh

# Starten (baut von GitHub)
./generate-ssl-certs.sh
docker-compose -f docker-compose.github.yml up -d

# Testen
curl http://localhost/api/health

# Aufräumen
docker-compose -f docker-compose.github.yml down -v
cd .. && rm -rf test-github
```

- [ ] Build von GitHub erfolgreich
- [ ] Start erfolgreich
- [ ] Funktioniert wie Docker Hub Version

## 📢 Nach der Veröffentlichung

### 1. Docker Hub Beschreibung
- [ ] Zu https://hub.docker.com/r/uptecps/updesk navigiert
- [ ] "Description" Tab geöffnet
- [ ] Inhalt von DOCKER-README.md eingefügt
- [ ] Gespeichert und Vorschau geprüft

### 2. GitHub Release
```bash
# GitHub Release erstellen
# → https://github.com/uptec-ps/updesk/releases/new

# Tag: v1.0.0
# Title: UpDesk v1.0.0 - Initial Release
# Description:
```

```markdown
## 🎉 Initial Release

UpDesk Virtual Desktop Launcher with Ubuntu-style Taskbar.

### ✨ Features
- Virtual Desktop Environment
- Ubuntu-style Taskbar with minimize/restore
- Integrated Apps: FlowUp, Port Documentation, UpNote, UpSum
- Dark/Light Theme Support
- Responsive Design

### 🐳 Docker Installation
```bash
docker-compose -f docker-compose.hub.yml up -d
```

See [INSTALL.md](INSTALL.md) for details.

### 📦 Docker Images
- Docker Hub: `uptecps/updesk:latest`
- Platforms: linux/amd64, linux/arm64

### 📚 Documentation
- [Installation Guide](INSTALL.md)
- [Docker Setup](DOCKER-SETUP.md)
- [Architecture](DOCKER-ARCHITECTURE.md)
```

- [ ] Release erstellt
- [ ] Assets hochgeladen (optional)
- [ ] Release veröffentlicht

### 3. README.md aktualisieren

Füge Docker-Badge und Installation hinzu:

```markdown
# UpDesk

![Docker Pulls](https://img.shields.io/docker/pulls/uptecps/updesk)
![Docker Image Size](https://img.shields.io/docker/image-size/uptecps/updesk)
![GitHub Release](https://img.shields.io/github/v/release/uptec-ps/updesk)

## 🚀 Quick Start

### Docker (Recommended)
```bash
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/docker-compose.hub.yml
docker-compose -f docker-compose.hub.yml up -d
```

See [INSTALL.md](INSTALL.md) for detailed instructions.
```

- [ ] README.md aktualisiert
- [ ] Badges hinzugefügt
- [ ] Docker-Installation prominent platziert
- [ ] Committed und gepusht

### 4. Monitoring einrichten

- [ ] Docker Hub Pull-Statistiken beobachten
- [ ] GitHub Actions Status im Auge behalten
- [ ] GitHub Issues für Support aktiviert
- [ ] Discussions aktiviert (optional)

### 5. Community informieren

- [ ] Social Media Post (falls vorhanden)
- [ ] Blog-Artikel (optional)
- [ ] Reddit/HackerNews (optional)
- [ ] Docker Hub Community (optional)

## 🔄 Zukünftige Updates

### Patch-Release (v1.0.1)
```bash
# Version in package.json erhöhen
npm version patch

# Commit und Tag
git push
git push --tags

# GitHub Actions baut automatisch
```

### Minor-Release (v1.1.0)
```bash
npm version minor
git push
git push --tags
```

### Major-Release (v2.0.0)
```bash
npm version major
git push
git push --tags
```

## ✅ Erfolgs-Kriterien

- [ ] Image auf Docker Hub verfügbar
- [ ] Installation in < 2 Minuten möglich
- [ ] Alle drei Methoden funktionieren
- [ ] Dokumentation vollständig
- [ ] Health Checks grün
- [ ] Keine kritischen Fehler in Logs
- [ ] Browser-Zugriff funktioniert
- [ ] Alle Apps starten
- [ ] Taskbar funktioniert
- [ ] Minimize/Restore funktioniert

## 🐛 Troubleshooting

### Build schlägt fehl
```bash
# Logs prüfen
docker-compose logs

# Neu bauen ohne Cache
docker-compose build --no-cache

# Docker System aufräumen
docker system prune -a
```

### GitHub Actions schlägt fehl
- Secrets prüfen (DOCKER_USERNAME, DOCKER_PASSWORD)
- Workflow-Logs auf GitHub prüfen
- Dockerfile Syntax prüfen
- .github/workflows/docker-publish.yml prüfen

### Image zu groß
- .dockerignore prüfen
- Multi-stage Build optimieren
- Unnötige Dependencies entfernen
- Alpine Base Image verwenden

### Container startet nicht
- Logs prüfen: `docker logs updesk-app`
- Health Check prüfen: `docker inspect updesk-app`
- Port-Konflikte prüfen: `lsof -i :3001`
- Volumes prüfen: `docker volume ls`

## 📊 Metriken

Nach 1 Woche:
- [ ] Docker Pulls: > 10
- [ ] GitHub Stars: > 5
- [ ] Issues: < 3 offen
- [ ] Erfolgreiche Installationen: > 5

Nach 1 Monat:
- [ ] Docker Pulls: > 100
- [ ] GitHub Stars: > 20
- [ ] Community-Feedback eingeholt
- [ ] Erste Contributions erhalten

---

**Viel Erfolg mit der Veröffentlichung! 🚀**

**Letzte Aktualisierung:** 2. Oktober 2024