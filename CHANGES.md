# Änderungen für HTTP/HTTPS Support

## Zusammenfassung

Die Docker-Konfiguration wurde angepasst, damit UpDesk auf Port 80 (HTTP) und Port 443 (HTTPS) läuft.

## Durchgeführte Änderungen

### 1. docker-compose.yml
- ✅ Nginx-Service aktiviert (vorher war er mit `profiles: production` deaktiviert)
- ✅ Ports 80 und 443 werden jetzt standardmäßig exponiert
- ✅ Nginx fungiert als Reverse Proxy vor der Node.js-Anwendung

### 2. nginx.conf
- ✅ HTTPS-Server-Block aktiviert (Port 443)
- ✅ SSL/TLS-Konfiguration mit modernen Protokollen (TLS 1.2, 1.3)
- ✅ Starke Cipher Suites konfiguriert
- ✅ Security Headers hinzugefügt (HSTS, X-Frame-Options, etc.)
- ✅ Identische Routing-Regeln für HTTP und HTTPS

### 3. SSL-Zertifikate
- ✅ `generate-ssl-certs.sh` - Skript zum Generieren selbstsignierter Zertifikate
- ✅ `ssl/` - Verzeichnis für SSL-Zertifikate erstellt
- ✅ Selbstsignierte Zertifikate für Entwicklung/Testing generiert
- ✅ `ssl/README.md` - Anleitung für Produktions-Zertifikate

### 4. .gitignore
- ✅ SSL-Zertifikate und private Schlüssel werden nicht ins Repository committed

### 5. Dokumentation
- ✅ `DOCKER-SETUP.md` - Vollständige Anleitung für Docker-Deployment
- ✅ Anweisungen für Entwicklung und Produktion
- ✅ Fehlerbehebung und Performance-Tipps

## Architektur

```
Internet
    ↓
Port 80 (HTTP) ──┐
Port 443 (HTTPS) ┘
    ↓
Nginx Reverse Proxy
    ↓
Port 3001 (intern)
    ↓
Node.js + Express
    ↓
Vue.js Frontend + API
```

## Verwendung

### Entwicklung/Testing

```bash
# 1. SSL-Zertifikate generieren
./generate-ssl-certs.sh

# 2. Container starten
docker-compose up -d

# 3. Anwendung aufrufen
# HTTP:  http://localhost
# HTTPS: https://localhost
```

### Produktion

```bash
# 1. Echte SSL-Zertifikate installieren
# Siehe DOCKER-SETUP.md für Details

# 2. Domain in nginx.conf konfigurieren
# server_name ihre-domain.de;

# 3. Container starten
docker-compose up -d
```

## Sicherheitsfeatures

- ✅ TLS 1.2 und 1.3
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ Security Headers
- ✅ Rate Limiting
- ✅ Gzip-Kompression
- ✅ Caching für statische Dateien
- ✅ Non-root User im Container

## Nächste Schritte

1. **Für Entwicklung:**
   - `./generate-ssl-certs.sh` ausführen
   - `docker-compose up -d` starten
   - Browser-Warnung für selbstsignierte Zertifikate akzeptieren

2. **Für Produktion:**
   - Let's Encrypt Zertifikate installieren
   - Domain-Name in nginx.conf konfigurieren
   - Firewall-Regeln für Ports 80 und 443 öffnen
   - Container mit `docker-compose up -d` starten

## Dateien

Neue/Geänderte Dateien:
- `docker-compose.yml` (geändert)
- `nginx.conf` (geändert)
- `generate-ssl-certs.sh` (neu)
- `ssl/README.md` (neu)
- `ssl/cert.pem` (generiert)
- `ssl/key.pem` (generiert)
- `.gitignore` (geändert)
- `DOCKER-SETUP.md` (neu)
- `CHANGES.md` (neu)

## Support

Bei Problemen siehe:
- `DOCKER-SETUP.md` - Vollständige Dokumentation
- `ssl/README.md` - SSL-Zertifikat-Anleitung
- Docker Logs: `docker-compose logs -f`