# Docker Setup für UpDesk

Diese Anleitung beschreibt, wie Sie UpDesk mit Docker auf Port 80 (HTTP) und Port 443 (HTTPS) betreiben.

**GitHub Repository:** https://github.com/uptec-ps/updesk  
**Docker Hub:** https://hub.docker.com/r/uptecps/updesk

> 💡 **Für eine einfache Schnellinstallation siehe [INSTALL.md](INSTALL.md)**

## Voraussetzungen

- Docker (Version 20.10 oder höher)
- Docker Compose (Version 2.0 oder höher)
- Ports 80 und 443 müssen verfügbar sein

## Installationsmethoden

### Methode 1: Docker Hub (Empfohlen)

Verwende das fertige Image von Docker Hub:

```bash
# Benötigte Dateien herunterladen
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/docker-compose.hub.yml
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/nginx.conf
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/generate-ssl-certs.sh
chmod +x generate-ssl-certs.sh

# SSL-Zertifikate generieren
./generate-ssl-certs.sh

# Starten
docker-compose -f docker-compose.hub.yml up -d
```

### Methode 2: Direkt von GitHub bauen

Baue das Image direkt aus dem Repository:

```bash
# Benötigte Dateien herunterladen
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/docker-compose.github.yml
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/nginx.conf
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/generate-ssl-certs.sh
chmod +x generate-ssl-certs.sh

# SSL-Zertifikate generieren
./generate-ssl-certs.sh

# Starten (baut automatisch von GitHub)
docker-compose -f docker-compose.github.yml up -d
```

### Methode 3: Lokaler Build (Entwicklung)

Für Entwickler mit geklontem Repository:

```bash
# Repository klonen
git clone https://github.com/uptec-ps/updesk.git
cd updesk

# SSL-Zertifikate generieren
./generate-ssl-certs.sh

# Starten
docker-compose up -d
```

### Anwendung aufrufen

- **HTTP:** http://localhost
- **HTTPS:** https://localhost

**Hinweis:** Browser zeigen eine Sicherheitswarnung bei selbstsignierten Zertifikaten. Dies ist normal für Entwicklungsumgebungen.

## Architektur

Die Docker-Konfiguration besteht aus zwei Services:

1. **updesk** - Node.js Backend (Port 3001, intern)
   - Vue.js Frontend (gebaut und als statische Dateien bereitgestellt)
   - Express.js API Server
   - SQLite Datenbank

2. **nginx** - Reverse Proxy (Ports 80 und 443, öffentlich)
   - HTTP auf Port 80
   - HTTPS auf Port 443 mit SSL/TLS
   - Gzip-Kompression
   - Caching für statische Dateien
   - Rate Limiting
   - Security Headers

## Produktions-Deployment

### SSL-Zertifikate für Produktion

Für Produktionsumgebungen sollten Sie echte SSL-Zertifikate verwenden:

#### Option 1: Let's Encrypt (Empfohlen)

```bash
# Certbot installieren
sudo apt-get update
sudo apt-get install certbot

# Zertifikat generieren
sudo certbot certonly --standalone -d ihre-domain.de

# Zertifikate kopieren
sudo cp /etc/letsencrypt/live/ihre-domain.de/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/ihre-domain.de/privkey.pem ./ssl/key.pem
sudo chmod 600 ./ssl/key.pem
sudo chmod 644 ./ssl/cert.pem
```

#### Option 2: Eigene Zertifikate

Platzieren Sie Ihre Zertifikate in:
- `ssl/cert.pem` - SSL-Zertifikat
- `ssl/key.pem` - Privater Schlüssel

### Domain-Name konfigurieren

Bearbeiten Sie `nginx.conf` und ändern Sie `server_name`:

```nginx
server {
    listen 443 ssl http2;
    server_name ihre-domain.de;  # Hier Ihre Domain eintragen
    ...
}
```

### Container neu starten

```bash
docker-compose restart nginx
```

## Verwaltung

### Container-Status prüfen

```bash
docker-compose ps
```

### Logs anzeigen

```bash
# Alle Logs
docker-compose logs -f

# Nur UpDesk App
docker-compose logs -f updesk

# Nur Nginx
docker-compose logs -f nginx
```

### Container stoppen

```bash
docker-compose down
```

### Container neu bauen

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Datenbank-Backup

```bash
docker-compose exec updesk cp /app/data/database.db /app/data/database.db.backup
```

## Volumes

Die Konfiguration verwendet folgende Volumes:

- `updesk_data` - SQLite Datenbank (persistent)
- `./public/wallpapers` - Benutzerdefinierte Hintergrundbilder
- `./public/icons` - Benutzerdefinierte Icons
- `./ssl` - SSL-Zertifikate

## Ports

- **80** - HTTP (öffentlich)
- **443** - HTTPS (öffentlich)
- **3001** - Node.js Backend (nur intern, nicht von außen erreichbar)

## Sicherheit

Die Nginx-Konfiguration enthält:

- ✅ TLS 1.2 und 1.3
- ✅ Starke Cipher Suites
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ Security Headers (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ Rate Limiting für API-Endpunkte
- ✅ Gzip-Kompression
- ✅ Caching für statische Dateien

## Fehlerbehebung

### Port bereits belegt

Wenn Port 80 oder 443 bereits verwendet wird:

```bash
# Prüfen, welcher Prozess den Port verwendet
sudo lsof -i :80
sudo lsof -i :443

# Apache/Nginx stoppen (falls installiert)
sudo systemctl stop apache2
sudo systemctl stop nginx
```

### SSL-Zertifikat-Fehler

```bash
# Zertifikate neu generieren
rm -rf ssl/*.pem
./generate-ssl-certs.sh

# Container neu starten
docker-compose restart nginx
```

### Nginx startet nicht

```bash
# Nginx-Konfiguration testen
docker-compose exec nginx nginx -t

# Logs prüfen
docker-compose logs nginx
```

## Performance-Optimierung

Die Konfiguration ist bereits für Produktion optimiert:

- Gzip-Kompression für Text-Dateien
- Browser-Caching für statische Assets (1 Jahr)
- HTTP/2 Support
- Keepalive-Verbindungen
- Connection Pooling zum Backend

## Monitoring

### Health Check

```bash
# HTTP
curl http://localhost/health

# HTTPS
curl -k https://localhost/health
```

### Nginx-Status

```bash
docker-compose exec nginx nginx -s reload  # Konfiguration neu laden
docker-compose exec nginx nginx -t         # Konfiguration testen
```

## Weitere Informationen

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)