# UpDesk Installation Guide

## 🚀 Quick Start

### Voraussetzungen
- Docker und Docker Compose installiert
- Git (optional, für lokalen Build)

### Installation

#### Option 1: Lokaler Build (Empfohlen für Entwicklung)

```bash
# Repository klonen
git clone https://github.com/uptec-ps/updesk.git
cd updesk

# SSL-Zertifikate generieren
./generate-ssl-certs.sh

# Starten
docker-compose up -d
```

#### Option 2: Build von GitHub

```bash
# docker-compose.yml bearbeiten und diese Zeilen auskommentieren:
# build:
#   context: .
#   dockerfile: Dockerfile

# Und diese Zeile aktivieren:
# build: https://github.com/uptec-ps/updesk.git

# Dann starten:
docker-compose up -d
```

#### Option 3: Docker Hub Image

```bash
# docker-compose.yml bearbeiten und diese Zeilen auskommentieren:
# build:
#   context: .
#   dockerfile: Dockerfile

# Und diese Zeile aktivieren:
# image: uptecps/updesk:latest

# Dann starten:
docker-compose up -d
```

## 🌐 Zugriff

Nach dem Start ist UpDesk erreichbar unter:
- **HTTP**: http://localhost
- **HTTPS**: https://localhost

## 🔧 Konfiguration

### Ports ändern

Bearbeiten Sie `docker-compose.yml`:

```yaml
apache:
  ports:
    - "8080:80"    # HTTP auf Port 8080
    - "8443:443"   # HTTPS auf Port 8443
```

### Eigene Wallpapers/Icons

```bash
# Wallpapers hinzufügen
cp mein-wallpaper.jpg public/wallpapers/

# Icons hinzufügen
cp mein-icon.svg public/icons/

# Container neu starten
docker-compose restart
```

## 📊 Verwaltung

### Container Status prüfen
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

### Neu starten
```bash
docker-compose restart
```

### Update durchführen

**Lokaler Build:**
```bash
git pull
docker-compose build --no-cache
docker-compose up -d
```

**Docker Hub:**
```bash
docker-compose pull
docker-compose up -d
```

## 🔍 Troubleshooting

### Port bereits belegt
```bash
# Prüfen, welcher Prozess Port 80 nutzt
sudo lsof -i :80

# Andere Ports in docker-compose.yml verwenden
```

### Container startet nicht
```bash
# Logs prüfen
docker-compose logs updesk
docker-compose logs apache

# Container neu bauen
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### SSL-Zertifikat Fehler
```bash
# Neue Zertifikate generieren
./generate-ssl-certs.sh

# Container neu starten
docker-compose restart apache
```

### Datenbank zurücksetzen
```bash
# WARNUNG: Löscht alle Daten!
docker-compose down -v
docker-compose up -d
```

## 📁 Daten-Persistenz

Alle Daten werden in Docker Volumes gespeichert:
- `updesk_data`: SQLite Datenbank
- `updesk_static`: Statische Frontend-Dateien

### Backup erstellen
```bash
# Datenbank sichern
docker cp updesk-app:/app/data/updesk.db ./backup-updesk.db
```

### Backup wiederherstellen
```bash
# Datenbank wiederherstellen
docker cp ./backup-updesk.db updesk-app:/app/data/updesk.db
docker-compose restart updesk
```

## 🔒 Sicherheit

### Produktions-Deployment

1. **Echte SSL-Zertifikate verwenden** (z.B. Let's Encrypt)
2. **Firewall konfigurieren**
3. **Regelmäßige Updates durchführen**
4. **Backups automatisieren**

### Let's Encrypt Integration

```bash
# Certbot installieren
sudo apt install certbot

# Zertifikat erstellen
sudo certbot certonly --standalone -d ihre-domain.de

# Zertifikate in docker-compose.yml einbinden
# - /etc/letsencrypt/live/ihre-domain.de/fullchain.pem:/usr/local/apache2/ssl/cert.pem:ro
# - /etc/letsencrypt/live/ihre-domain.de/privkey.pem:/usr/local/apache2/ssl/key.pem:ro
```

## 📞 Support

- **GitHub Issues**: https://github.com/uptec-ps/updesk/issues
- **Dokumentation**: [README.md](README.md)
- **Docker Hub**: https://hub.docker.com/r/uptecps/updesk

## ✅ Checkliste

- [ ] Docker und Docker Compose installiert
- [ ] Repository geklont oder docker-compose.yml heruntergeladen
- [ ] SSL-Zertifikate generiert
- [ ] `docker-compose up -d` ausgeführt
- [ ] http://localhost im Browser geöffnet
- [ ] Funktionalität getestet
- [ ] Backup-Strategie geplant

---

**Viel Erfolg mit UpDesk! 🎉**