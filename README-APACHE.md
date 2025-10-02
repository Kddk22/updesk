# 🔄 Apache Alternative für UpDesk

## 📋 Übersicht

UpDesk kann wahlweise mit **nginx** (Standard) oder **Apache** (Alternative) betrieben werden.

### Warum Apache?

Apache ist eine **bewährte, stabile Enterprise-Lösung**:

| Vorteil | Beschreibung |
|---------|--------------|
| ✅ **Stabilität** | Extrem stabil unter Last und Spike-Traffic |
| ✅ **Zuverlässigkeit** | Seit 1995 in Millionen Produktionsumgebungen |
| ✅ **Flexibilität** | Umfangreiche Module und Konfigurationsmöglichkeiten |
| ✅ **Performance** | Mit HTTP/2 und MPM Event sehr schnell |
| ✅ **Support** | Riesige Community und exzellente Dokumentation |

## 🚀 Schnellstart

### Installation mit Apache

```bash
# 1. Repository klonen
git clone https://github.com/uptec-ps/updesk.git
cd updesk

# 2. SSL-Zertifikate generieren
./generate-ssl-certs.sh

# 3. Mit Apache starten
docker compose -f docker-compose.apache.yml up -d

# 4. Im Browser öffnen
open http://localhost
```

**Fertig!** UpDesk läuft jetzt mit Apache.

## 📊 nginx vs Apache

### Performance-Vergleich

| Metrik | nginx | Apache | Unterschied |
|--------|-------|--------|-------------|
| **Requests/sec** | 2000-2500 | 1800-2200 | -10% |
| **Latenz** | 3-5ms | 4-6ms | +1ms |
| **Speicher** | 20-30MB | 50-100MB | +70MB |
| **Stabilität** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Apache besser |

### Automatischer Vergleich

```bash
# Performance-Vergleich durchführen
./compare-webservers.sh

# Zeigt:
# - Requests per second
# - Latenz
# - Transfer rate
# - Empfehlung
```

## 🎯 Wann welchen Webserver?

### Verwende nginx wenn:

✅ Maximale Performance für statische Dateien wichtig ist  
✅ Minimaler Speicherverbrauch gewünscht ist  
✅ Einfache Konfiguration bevorzugt wird  
✅ Standard-Setup ausreicht  

### Verwende Apache wenn:

✅ Stabilität wichtiger als maximale Performance ist  
✅ Enterprise-Umgebung mit hohen Anforderungen  
✅ Spike-Traffic erwartet wird  
✅ Lange Laufzeiten ohne Restarts  
✅ Umfangreiche Module benötigt werden  
✅ Bewährte Lösung gewünscht ist  

## 📚 Dokumentation

### Quick-Start Guides

- **[APACHE-QUICKSTART.md](APACHE-QUICKSTART.md)** - Schnellstart in 3 Schritten
- **[OPTIMIZATION-QUICKSTART.md](OPTIMIZATION-QUICKSTART.md)** - Performance-Optimierung

### Detaillierte Guides

- **[APACHE-MIGRATION.md](APACHE-MIGRATION.md)** - Migration von nginx zu Apache
- **[PERFORMANCE-OPTIMIZATION.md](PERFORMANCE-OPTIMIZATION.md)** - Performance-Analyse
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System-Architektur

### Zusammenfassungen

- **[APACHE-SUMMARY.md](APACHE-SUMMARY.md)** - Übersicht aller Änderungen

## 🔧 Konfiguration

### Wichtige Dateien

```
updesk/
├── docker-compose.yml           # nginx (Standard)
├── docker-compose.apache.yml    # Apache (Alternative)
├── nginx.conf                   # nginx-Konfiguration
├── apache.conf                  # Apache VirtualHost
├── apache-httpd.conf            # Apache Hauptkonfiguration
└── compare-webservers.sh        # Performance-Vergleich
```

### Zwischen Webservern wechseln

```bash
# Von nginx zu Apache
docker compose down
docker compose -f docker-compose.apache.yml up -d

# Von Apache zu nginx
docker compose -f docker-compose.apache.yml down
docker compose up -d

# Volumes bleiben erhalten!
```

## 🧪 Testing

### Funktionstest

```bash
# HTTP-Test
curl http://localhost/

# HTTPS-Test
curl -k https://localhost/

# API-Test
curl http://localhost/api/health

# Cache-Test
curl -I http://localhost/assets/index.js | grep Cache-Control

# Gzip-Test
curl -I -H "Accept-Encoding: gzip" http://localhost/ | grep Content-Encoding

# HTTP/2-Test
curl -I --http2 https://localhost/ -k | head -1
```

### Performance-Test

```bash
# Apache Bench installieren
# Ubuntu/Debian: sudo apt install apache2-utils
# macOS: brew install httpd

# Load-Test durchführen
ab -n 1000 -c 50 http://localhost/

# Erwartete Ergebnisse:
# nginx:  ~2000-2500 req/s
# Apache: ~1800-2200 req/s
```

## 🎯 Features (beide Webserver)

Beide Setups nutzen die **gleiche optimierte Architektur**:

✅ **Direct Static File Serving** - Statische Dateien direkt vom Webserver  
✅ **Shared Volumes** - Backend und Webserver teilen sich Dateien  
✅ **Aggressive Caching** - 1 Jahr Cache für Assets  
✅ **HTTP/2 Support** - Multiplexing und Header-Kompression  
✅ **Gzip-Kompression** - 70-80% kleinere Dateien  
✅ **SPA-Routing** - Vue Router funktioniert korrekt  
✅ **API-Proxy** - Backend-Requests werden korrekt weitergeleitet  
✅ **SSL/TLS** - HTTPS mit selbst-signierten Zertifikaten  

## 📈 Performance-Optimierungen

### nginx-spezifisch

```nginx
# Event-driven architecture
events {
    worker_connections 1024;
}

# Asynchronous I/O
aio threads;

# Sendfile optimization
sendfile on;
tcp_nopush on;
```

### Apache-spezifisch

```apache
# MPM Event (asynchronous)
<IfModule mpm_event_module>
    StartServers             3
    MinSpareThreads         75
    MaxSpareThreads        250
    ThreadsPerChild         25
    MaxRequestWorkers      400
</IfModule>

# HTTP/2
Protocols h2 h2c http/1.1

# Deflate (Gzip)
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

## 🐛 Troubleshooting

### Problem: Container startet nicht

```bash
# nginx
docker compose logs nginx

# Apache
docker compose -f docker-compose.apache.yml logs apache

# Konfiguration testen
docker compose exec nginx nginx -t
docker compose -f docker-compose.apache.yml exec apache apachectl configtest
```

### Problem: 404 für statische Dateien

```bash
# Dateien im Container prüfen
docker compose exec nginx ls -la /usr/share/nginx/html
docker compose -f docker-compose.apache.yml exec apache ls -la /usr/local/apache2/htdocs

# Container neu starten
docker compose down && docker compose up -d
docker compose -f docker-compose.apache.yml down && docker compose -f docker-compose.apache.yml up -d
```

### Problem: Langsame Performance

```bash
# Performance-Vergleich durchführen
./compare-webservers.sh

# Container-Stats prüfen
docker stats

# Load-Test durchführen
ab -n 1000 -c 50 http://localhost/
```

## 🔄 Updates

### Webserver-Image aktualisieren

```bash
# nginx
docker pull nginx:alpine
docker compose build --no-cache
docker compose up -d

# Apache
docker pull httpd:2.4-alpine
docker compose -f docker-compose.apache.yml build --no-cache
docker compose -f docker-compose.apache.yml up -d
```

## 📊 Monitoring

### Container-Stats

```bash
# Echtzeit-Monitoring
docker stats

# Erwartete Werte (nginx):
# updesk-nginx: ~20-30MB RAM, ~10-15% CPU

# Erwartete Werte (Apache):
# updesk-apache: ~50-100MB RAM, ~10-20% CPU
```

### Server-Status

```bash
# nginx
curl http://localhost/nginx_status

# Apache
docker compose -f docker-compose.apache.yml exec apache curl http://localhost/server-status
```

## ✅ Checkliste

### nginx (Standard)

- [ ] Container gestartet (`docker compose up -d`)
- [ ] HTTP funktioniert (`curl http://localhost/`)
- [ ] HTTPS funktioniert (`curl -k https://localhost/`)
- [ ] API funktioniert (`curl http://localhost/api/health`)
- [ ] Cache aktiv (`curl -I http://localhost/assets/index.js`)
- [ ] Gzip aktiv (`curl -I -H "Accept-Encoding: gzip" http://localhost/`)

### Apache (Alternative)

- [ ] Container gestartet (`docker compose -f docker-compose.apache.yml up -d`)
- [ ] HTTP funktioniert (`curl http://localhost/`)
- [ ] HTTPS funktioniert (`curl -k https://localhost/`)
- [ ] API funktioniert (`curl http://localhost/api/health`)
- [ ] Cache aktiv (`curl -I http://localhost/assets/index.js`)
- [ ] Gzip aktiv (`curl -I -H "Accept-Encoding: gzip" http://localhost/`)

## 🎉 Fazit

Beide Webserver funktionieren **hervorragend** mit UpDesk:

- **nginx**: Maximale Performance, minimaler Speicher
- **Apache**: Maximale Stabilität, bewährte Lösung

**Wählen Sie die Lösung, die am besten zu Ihren Anforderungen passt!** 🚀

## 📞 Support

Bei Fragen oder Problemen:

- **GitHub Issues**: https://github.com/uptec-ps/updesk/issues
- **Dokumentation**: [README.md](README.md)
- **Apache-Guide**: [APACHE-MIGRATION.md](APACHE-MIGRATION.md)
- **Performance-Guide**: [PERFORMANCE-OPTIMIZATION.md](PERFORMANCE-OPTIMIZATION.md)

---

**Happy Serving! ⚡**