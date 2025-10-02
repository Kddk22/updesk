# UpDesk Installation Guide

Drei einfache Wege, UpDesk zu installieren und zu starten.

## 🚀 Schnellinstallation

### Option 1: Docker Hub (Empfohlen - Am schnellsten)

Verwende das fertige Image von Docker Hub:

```bash
# 1. Benötigte Dateien herunterladen
mkdir updesk && cd updesk
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/docker-compose.hub.yml
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/nginx.conf
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/generate-ssl-certs.sh
chmod +x generate-ssl-certs.sh

# 2. SSL-Zertifikate generieren
./generate-ssl-certs.sh

# 3. Starten
docker-compose -f docker-compose.hub.yml up -d
```

**Fertig!** UpDesk läuft jetzt auf:
- HTTP: http://localhost
- HTTPS: https://localhost

---

### Option 2: Direkt von GitHub bauen

Baue das Image direkt aus dem GitHub Repository:

```bash
# 1. Benötigte Dateien herunterladen
mkdir updesk && cd updesk
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/docker-compose.github.yml
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/nginx.conf
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/generate-ssl-certs.sh
chmod +x generate-ssl-certs.sh

# 2. SSL-Zertifikate generieren
./generate-ssl-certs.sh

# 3. Starten (baut automatisch von GitHub)
docker-compose -f docker-compose.github.yml up -d
```

---

### Option 3: Repository klonen (Für Entwickler)

Klone das komplette Repository für Entwicklung:

```bash
# 1. Repository klonen
git clone https://github.com/uptec-ps/updesk.git
cd updesk

# 2. SSL-Zertifikate generieren
./generate-ssl-certs.sh

# 3. Starten
docker-compose up -d
```

---

## 📋 Voraussetzungen

- Docker (Version 20.10+)
- Docker Compose (Version 2.0+)
- Ports 80 und 443 verfügbar

### Docker installieren (falls nicht vorhanden)

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**macOS:**
```bash
brew install --cask docker
```

**Windows:**
Lade [Docker Desktop](https://www.docker.com/products/docker-desktop) herunter.

---

## 🔧 Verwaltung

### Status prüfen
```bash
docker-compose ps
```

### Logs anzeigen
```bash
docker-compose logs -f
```

### Stoppen
```bash
docker-compose down
```

### Neustarten
```bash
docker-compose restart
```

### Update auf neue Version

**Docker Hub:**
```bash
docker-compose -f docker-compose.hub.yml pull
docker-compose -f docker-compose.hub.yml up -d
```

**GitHub:**
```bash
docker-compose -f docker-compose.github.yml build --no-cache
docker-compose -f docker-compose.github.yml up -d
```

---

## 🔒 Produktion

Für Produktionsumgebungen siehe [DOCKER-SETUP.md](DOCKER-SETUP.md) für:
- Let's Encrypt SSL-Zertifikate
- Domain-Konfiguration
- Sicherheits-Best-Practices
- Performance-Optimierung

---

## 🐛 Fehlerbehebung

### Port bereits belegt
```bash
# Prüfen, welcher Prozess Port 80/443 verwendet
sudo lsof -i :80
sudo lsof -i :443

# Andere Webserver stoppen
sudo systemctl stop apache2
sudo systemctl stop nginx
```

### Container startet nicht
```bash
# Logs prüfen
docker-compose logs updesk

# Container neu bauen
docker-compose build --no-cache
docker-compose up -d
```

### SSL-Zertifikat-Fehler
```bash
# Zertifikate neu generieren
rm -rf ssl/*.pem
./generate-ssl-certs.sh
docker-compose restart nginx
```

---

## 📚 Weitere Dokumentation

- [Docker Setup Details](DOCKER-SETUP.md)
- [GitHub Repository](https://github.com/uptec-ps/updesk)
- [Docker Hub](https://hub.docker.com/r/uptecps/updesk)

---

## 💡 Tipps

**Nur Backend ohne Nginx:**
```bash
# Nur UpDesk auf Port 3001
docker run -d -p 3001:3001 -v updesk_data:/app/data uptecps/updesk:latest
```

**Eigene Hintergrundbilder:**
```bash
# Erstelle Ordner und mounte ihn
mkdir wallpapers
# Füge deine Bilder hinzu
cp mein-bild.jpg wallpapers/
# Starte mit Volume-Mount (siehe docker-compose.yml)
```

**Datenbank-Backup:**
```bash
docker-compose exec updesk cp /app/data/database.db /app/data/backup.db
docker cp updesk-app:/app/data/backup.db ./backup.db
```