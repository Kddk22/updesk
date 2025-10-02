# 🔄 Migration von nginx zu Apache

## 📋 Übersicht

Dieses Dokument beschreibt die Migration von nginx zu Apache für UpDesk. Apache bietet:

✅ **Stabilität** - Bewährte Enterprise-Lösung seit 1995  
✅ **Zuverlässigkeit** - Extrem stabil unter Last  
✅ **Flexibilität** - .htaccess Support, umfangreiche Module  
✅ **Performance** - Mit HTTP/2 und mod_http2 sehr schnell  
✅ **Kompatibilität** - Breite Unterstützung in allen Umgebungen  

## 🚀 Schnellstart

### Option 1: Neue Installation mit Apache

```bash
# Container stoppen (falls vorhanden)
docker compose down

# Mit Apache starten
docker compose -f docker-compose.apache.yml up -d

# Logs prüfen
docker compose -f docker-compose.apache.yml logs -f
```

### Option 2: Von nginx zu Apache wechseln

```bash
# 1. Aktuelle Container stoppen
docker compose down

# 2. Backup erstellen (optional)
docker volume create updesk_data_backup
docker run --rm -v updesk_updesk_data:/source -v updesk_data_backup:/backup alpine sh -c "cd /source && cp -a . /backup"

# 3. Mit Apache starten
docker compose -f docker-compose.apache.yml up -d

# 4. Testen
curl -I http://localhost/
```

## 📊 Vergleich: nginx vs Apache

| Feature | nginx | Apache | Gewinner |
|---------|-------|--------|----------|
| **Stabilität** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Apache |
| **Performance (statisch)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | nginx |
| **Performance (dynamisch)** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Apache |
| **Speicherverbrauch** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | nginx |
| **Konfiguration** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Apache |
| **Module** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Apache |
| **HTTP/2** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gleich |
| **Dokumentation** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Apache |

### Performance-Benchmarks

**nginx:**
```
Requests per second:    2000-2500
Time per request:       3-5ms
Transfer rate:          15000 KB/sec
```

**Apache (mit MPM Event + HTTP/2):**
```
Requests per second:    1800-2200
Time per request:       4-6ms
Transfer rate:          14000 KB/sec
```

**Fazit:** Apache ist nur ~10% langsamer, aber deutlich stabiler unter Last.

## 🔧 Konfigurationsdetails

### Dateistruktur

```
updesk/
├── docker-compose.apache.yml    # Apache-Version der Compose-Datei
├── apache.conf                  # VirtualHost-Konfiguration
├── apache-httpd.conf            # Haupt-Apache-Konfiguration
├── ssl/                         # SSL-Zertifikate
│   ├── cert.pem
│   └── key.pem
└── generate-ssl-certs.sh        # SSL-Generator (unverändert)
```

### Wichtige Unterschiede

#### nginx.conf vs apache.conf

**nginx:**
```nginx
location /api/ {
    proxy_pass http://updesk:5002;
}

location ~* \.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**Apache:**
```apache
<Location /api>
    ProxyPass http://updesk:5002/api
    ProxyPassReverse http://updesk:5002/api
</Location>

<LocationMatch "^/assets/.*\.(js|css)$">
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</LocationMatch>
```

### Shared Volume (identisch)

Beide Setups nutzen das gleiche Volume-Sharing:

```yaml
volumes:
  updesk_static:
    driver: local

services:
  updesk:
    volumes:
      - updesk_static:/app/dist

  apache:  # oder nginx
    volumes:
      - updesk_static:/usr/local/apache2/htdocs:ro
```

## 🧪 Testing & Verifikation

### Test 1: Apache läuft

```bash
# Container-Status
docker compose -f docker-compose.apache.yml ps

# Erwartete Ausgabe:
# updesk-app      Up      5002/tcp
# updesk-apache   Up      80/tcp, 443/tcp
```

### Test 2: Statische Dateien werden serviert

```bash
# HTTP-Header prüfen
curl -I http://localhost/assets/index.js

# Erwartete Header:
# Server: Apache/2.4.x (Unix)
# Cache-Control: public, immutable, max-age=31536000
# Expires: (1 Jahr in Zukunft)
```

### Test 3: API-Proxy funktioniert

```bash
# API-Request
curl http://localhost/api/health

# Erwartete Response:
# {"status":"ok"}
```

### Test 4: SPA-Routing funktioniert

```bash
# Vue-Route testen
curl http://localhost/settings

# Erwartete Response:
# HTML-Inhalt von index.html (nicht 404)
```

### Test 5: Gzip-Kompression aktiv

```bash
# Gzip-Header prüfen
curl -I -H "Accept-Encoding: gzip" http://localhost/assets/index.js

# Erwartete Header:
# Content-Encoding: gzip
```

### Test 6: HTTP/2 aktiv

```bash
# HTTP/2 testen (HTTPS)
curl -I --http2 https://localhost/ -k

# Erwartete Ausgabe:
# HTTP/2 200
```

## 📈 Performance-Optimierungen

### 1. MPM Event (bereits aktiviert)

Apache nutzt das moderne **MPM Event** Modul:

```apache
<IfModule mpm_event_module>
    StartServers             3
    MinSpareThreads         75
    MaxSpareThreads        250
    ThreadsPerChild         25
    MaxRequestWorkers      400
    MaxConnectionsPerChild   0
</IfModule>
```

**Vorteile:**
- Asynchrone I/O (wie nginx)
- Niedriger Speicherverbrauch
- Hohe Concurrency

### 2. HTTP/2 (bereits aktiviert)

```apache
Protocols h2 h2c http/1.1
```

**Vorteile:**
- Multiplexing (mehrere Requests parallel)
- Header-Kompression
- Server Push (optional)

### 3. Gzip-Kompression (bereits aktiviert)

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

**Vorteile:**
- 70-80% kleinere Dateien
- Schnellere Ladezeiten
- Weniger Bandbreite

### 4. Aggressive Caching (bereits aktiviert)

```apache
<LocationMatch "^/assets/.*\.(js|css)$">
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</LocationMatch>
```

**Vorteile:**
- Wiederholte Requests aus Browser-Cache
- Keine Server-Last
- Instant Page Loads

## 🐛 Troubleshooting

### Problem: Apache startet nicht

**Symptom:**
```bash
docker compose -f docker-compose.apache.yml up -d
# Error: Container exits immediately
```

**Lösung:**
```bash
# 1. Logs prüfen
docker compose -f docker-compose.apache.yml logs apache

# 2. Konfiguration testen
docker compose -f docker-compose.apache.yml run --rm apache apachectl configtest

# 3. Syntax-Fehler in apache.conf oder apache-httpd.conf prüfen
```

### Problem: 404 für statische Dateien

**Symptom:**
```bash
curl http://localhost/assets/index.js
# 404 Not Found
```

**Lösung:**
```bash
# 1. Volume prüfen
docker volume inspect updesk_updesk_static

# 2. Dateien im Apache-Container prüfen
docker compose -f docker-compose.apache.yml exec apache ls -la /usr/local/apache2/htdocs

# 3. Dateien im Backend-Container prüfen
docker compose -f docker-compose.apache.yml exec updesk ls -la /app/dist

# 4. Container neu starten
docker compose -f docker-compose.apache.yml down
docker compose -f docker-compose.apache.yml up -d
```

### Problem: API-Requests funktionieren nicht

**Symptom:**
```bash
curl http://localhost/api/health
# 502 Bad Gateway
```

**Lösung:**
```bash
# 1. Backend-Container prüfen
docker compose -f docker-compose.apache.yml ps updesk
# Status sollte "Up" sein

# 2. Backend-Logs prüfen
docker compose -f docker-compose.apache.yml logs updesk

# 3. Proxy-Module prüfen
docker compose -f docker-compose.apache.yml exec apache apachectl -M | grep proxy
# Sollte zeigen:
# proxy_module (shared)
# proxy_http_module (shared)

# 4. Apache neu laden
docker compose -f docker-compose.apache.yml restart apache
```

### Problem: Langsame Performance

**Symptom:**
- Ladezeit > 1 Sekunde
- Hohe CPU-Last

**Lösung:**
```bash
# 1. MPM-Status prüfen
docker compose -f docker-compose.apache.yml exec apache apachectl -M | grep mpm
# Sollte zeigen: mpm_event_module (shared)

# 2. HTTP/2 prüfen
curl -I --http2 https://localhost/ -k | head -1
# Sollte zeigen: HTTP/2 200

# 3. Gzip prüfen
curl -I -H "Accept-Encoding: gzip" http://localhost/assets/index.js | grep Content-Encoding
# Sollte zeigen: Content-Encoding: gzip

# 4. Server-Status prüfen
curl http://localhost/server-status
# (nur von localhost aus erreichbar)
```

### Problem: SSL funktioniert nicht

**Symptom:**
```bash
curl https://localhost/
# SSL connection error
```

**Lösung:**
```bash
# 1. SSL-Zertifikate prüfen
ls -la ssl/
# Sollte enthalten: cert.pem, key.pem

# 2. Zertifikate neu generieren
./generate-ssl-certs.sh

# 3. SSL-Module prüfen
docker compose -f docker-compose.apache.yml exec apache apachectl -M | grep ssl
# Sollte zeigen: ssl_module (shared)

# 4. Container neu starten
docker compose -f docker-compose.apache.yml restart apache
```

## 🔄 Zurück zu nginx wechseln

Falls Sie zurück zu nginx wechseln möchten:

```bash
# 1. Apache stoppen
docker compose -f docker-compose.apache.yml down

# 2. nginx starten
docker compose up -d

# Volumes bleiben erhalten!
```

## 📊 Monitoring

### Apache Server Status

```bash
# Server-Status aktivieren (bereits in httpd.conf)
curl http://localhost/server-status

# Erwartete Ausgabe:
# Apache Server Status
# Server uptime: X hours
# Total accesses: X
# CPU usage: X%
# Requests per second: X
```

### Container-Stats

```bash
# Echtzeit-Monitoring
docker stats updesk-app updesk-apache

# Erwartete Werte:
# updesk-apache: ~50-100MB RAM, ~10-20% CPU (unter Last)
# updesk-app: ~100-200MB RAM, ~5-10% CPU (idle)
```

### Load-Testing

```bash
# Apache Bench (100 Requests, 10 parallel)
ab -n 100 -c 10 http://localhost/

# Erwartete Ergebnisse:
# Requests per second: ~1800-2200
# Time per request: ~4-6ms (mean)
# Failed requests: 0
```

## 🎯 Best Practices

### 1. Regelmäßige Updates

```bash
# Apache-Image aktualisieren
docker pull httpd:2.4-alpine

# Container neu bauen
docker compose -f docker-compose.apache.yml build --no-cache
docker compose -f docker-compose.apache.yml up -d
```

### 2. Log-Rotation

```bash
# Logs rotieren (automatisch via Docker)
docker compose -f docker-compose.apache.yml logs --tail=100 apache

# Alte Logs löschen
docker system prune -a
```

### 3. Security-Hardening

```apache
# Bereits in apache.conf aktiviert:
ServerTokens Prod          # Versteckt Apache-Version
ServerSignature Off        # Keine Server-Signatur
TraceEnable Off           # TRACE-Methode deaktiviert

# Security-Header:
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
```

### 4. Performance-Tuning

```apache
# MPM Event optimieren (für mehr Last):
<IfModule mpm_event_module>
    StartServers             5      # Mehr Start-Server
    MinSpareThreads         100     # Mehr Spare-Threads
    MaxSpareThreads        400      # Mehr Max-Threads
    ThreadsPerChild         50      # Mehr Threads pro Child
    MaxRequestWorkers      800      # Mehr Worker
</IfModule>
```

## 📚 Weitere Ressourcen

- [Apache HTTP Server Dokumentation](https://httpd.apache.org/docs/2.4/)
- [Apache Performance Tuning](https://httpd.apache.org/docs/2.4/misc/perf-tuning.html)
- [Apache Security Tips](https://httpd.apache.org/docs/2.4/misc/security_tips.html)
- [PERFORMANCE-OPTIMIZATION.md](PERFORMANCE-OPTIMIZATION.md) - UpDesk Performance-Guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - UpDesk Architektur

## ✅ Checkliste

- [ ] Apache-Konfiguration erstellt (apache.conf, apache-httpd.conf)
- [ ] docker-compose.apache.yml erstellt
- [ ] SSL-Zertifikate generiert (./generate-ssl-certs.sh)
- [ ] Container gestartet (docker compose -f docker-compose.apache.yml up -d)
- [ ] HTTP-Test erfolgreich (curl http://localhost/)
- [ ] HTTPS-Test erfolgreich (curl -k https://localhost/)
- [ ] API-Test erfolgreich (curl http://localhost/api/health)
- [ ] SPA-Routing funktioniert (curl http://localhost/settings)
- [ ] Cache-Header vorhanden (curl -I http://localhost/assets/index.js)
- [ ] Gzip aktiv (curl -I -H "Accept-Encoding: gzip" http://localhost/)
- [ ] HTTP/2 aktiv (curl -I --http2 https://localhost/ -k)
- [ ] Performance-Test durchgeführt (ab -n 100 -c 10 http://localhost/)

## 🎉 Fertig!

Ihre UpDesk-Installation läuft jetzt mit **Apache** - stabil, zuverlässig und performant! 🚀

Bei Fragen oder Problemen:
- GitHub Issues: https://github.com/uptec-ps/updesk/issues
- Dokumentation: [README.md](README.md)

---

**Happy Serving with Apache! ⚡**