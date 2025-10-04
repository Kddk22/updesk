# UpDesk Installation via Portainer

Diese Anleitung erklärt, wie du UpDesk über Portainer installierst.

## 🎯 Übersicht

Es gibt **zwei Varianten** für die Installation:

1. **Einfache Variante** (nur Backend) - Port 5002
2. **Vollständige Variante** (Backend + Nginx Proxy) - Port 80

## 📋 Voraussetzungen

- Portainer installiert und laufend
- Docker auf dem Host-System
- Freie Ports: 5002 (einfach) oder 80 (vollständig)

---

## ✅ Variante 1: Einfache Installation (nur Backend)

Diese Variante startet nur den UpDesk-Backend-Container auf Port 5002.

### Installation

1. **Portainer öffnen** → Stacks → Add Stack
2. **Name eingeben**: `updesk`
3. **Web editor auswählen**
4. **Folgende YAML einfügen**:

```yaml
version: '3.8'

services:
  updesk:
    image: uptecps/updesk:latest
    container_name: updesk-backend
    ports:
      - "5002:5002"
    environment:
      - NODE_ENV=production
      - PORT=5002
    volumes:
      - updesk_data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5002/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "com.updesk.description=UpDesk Virtual Desktop Launcher"
      - "com.updesk.version=1.0.0"
    networks:
      - updesk_network

volumes:
  updesk_data:
    driver: local
    labels:
      - "com.updesk.description=UpDesk SQLite database storage"

networks:
  updesk_network:
    driver: bridge
    labels:
      - "com.updesk.description=UpDesk application network"
```

5. **Deploy the stack** klicken

### Zugriff

- **URL**: `http://DEINE-SERVER-IP:5002`
- **Beispiel**: `http://192.168.1.100:5002`

### Vorteile

✅ Einfach und schnell  
✅ Nur ein Container  
✅ Weniger Ressourcen  

### Nachteile

❌ Kein Standard-HTTP-Port (80)  
❌ Keine Reverse-Proxy-Features  

---

## 🚀 Variante 2: Vollständige Installation (Backend + Apache)

Diese Variante startet UpDesk mit Apache Reverse Proxy auf Port 80.

### Installation

1. **Portainer öffnen** → Stacks → Add Stack
2. **Name eingeben**: `updesk-full`
3. **Web editor auswählen**
4. **Folgende YAML einfügen**:

```yaml
version: '3.8'

services:
  updesk:
    image: uptecps/updesk:latest
    container_name: updesk-backend
    expose:
      - "5002"
    environment:
      - NODE_ENV=production
      - PORT=5002
    volumes:
      - updesk_data:/app/data
      - updesk_static:/app/dist
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5002/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "com.updesk.description=UpDesk Virtual Desktop Launcher"
      - "com.updesk.version=1.0.0"
    networks:
      - updesk_network

  apache:
    image: httpd:2.4-alpine
    container_name: updesk-app
    ports:
      - "80:80"
    volumes:
      - updesk_static:/usr/local/apache2/htdocs:ro
    depends_on:
      - updesk
    restart: unless-stopped
    networks:
      - updesk_network
    labels:
      - "com.updesk.description=Apache reverse proxy for UpDesk"
    command: >
      sh -c "
      cat > /usr/local/apache2/conf/httpd.conf << 'HTTPD_EOF'
      ServerRoot \"/usr/local/apache2\"
      Listen 80
      LoadModule mpm_event_module modules/mod_mpm_event.so
      LoadModule authn_core_module modules/mod_authn_core.so
      LoadModule authz_core_module modules/mod_authz_core.so
      LoadModule mime_module modules/mod_mime.so
      LoadModule log_config_module modules/mod_log_config.so
      LoadModule headers_module modules/mod_headers.so
      LoadModule setenvif_module modules/mod_setenvif.so
      LoadModule unixd_module modules/mod_unixd.so
      LoadModule dir_module modules/mod_dir.so
      LoadModule rewrite_module modules/mod_rewrite.so
      LoadModule proxy_module modules/mod_proxy.so
      LoadModule proxy_http_module modules/mod_proxy_http.so
      LoadModule deflate_module modules/mod_deflate.so
      LoadModule expires_module modules/mod_expires.so
      <IfModule unixd_module>
        User daemon
        Group daemon
      </IfModule>
      ServerAdmin admin@localhost
      ServerName localhost
      ServerTokens Prod
      ServerSignature Off
      TraceEnable Off
      <Directory />
        AllowOverride none
        Require all denied
      </Directory>
      DocumentRoot \"/usr/local/apache2/htdocs\"
      <Directory \"/usr/local/apache2/htdocs\">
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
      </Directory>
      <IfModule dir_module>
        DirectoryIndex index.html
      </IfModule>
      <Files \".ht*\">
        Require all denied
      </Files>
      ErrorLog /proc/self/fd/2
      LogLevel warn
      <IfModule log_config_module>
        LogFormat \"%h %l %u %t \\\"%r\\\" %>s %b \\\"%{Referer}i\\\" \\\"%{User-Agent}i\\\"\" combined
        CustomLog /proc/self/fd/1 combined
      </IfModule>
      <IfModule mime_module>
        TypesConfig conf/mime.types
        AddType application/javascript .js .mjs
        AddType application/json .json
        AddType text/css .css
        AddType image/svg+xml .svg .svgz
        AddType image/webp .webp
        AddType font/woff .woff
        AddType font/woff2 .woff2
        AddType font/ttf .ttf
        AddType font/otf .otf
        AddType font/eot .eot
      </IfModule>
      Timeout 60
      KeepAlive On
      MaxKeepAliveRequests 100
      KeepAliveTimeout 5
      ProxyTimeout 300
      Header always set X-Content-Type-Options \"nosniff\"
      Header always set X-Frame-Options \"SAMEORIGIN\"
      Header always set X-XSS-Protection \"1; mode=block\"
      Header always set Referrer-Policy \"strict-origin-when-cross-origin\"
      <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript
        AddOutputFilterByType DEFLATE application/javascript application/json application/xml
        AddOutputFilterByType DEFLATE image/svg+xml
        SetEnvIfNoCase Request_URI \\.(?:gif|jpe?g|png|webp|ico|mp4|webm|woff2?)$$ no-gzip
      </IfModule>
      <Location /api>
        ProxyPreserveHost On
        ProxyPass http://updesk:5002/api
        ProxyPassReverse http://updesk:5002/api
        Header set Cache-Control \"no-cache, no-store, must-revalidate\"
        Header set Pragma \"no-cache\"
        Header set Expires \"0\"
      </Location>
      <LocationMatch \"^/assets/.*\\\\.(js|css|woff2?|ttf|eot|otf|svg|png|jpg|jpeg|gif|webp|ico)$$\">
        <IfModule mod_expires.c>
          ExpiresActive On
          ExpiresDefault \"access plus 1 year\"
        </IfModule>
        Header set Cache-Control \"public, immutable, max-age=31536000\"
        Header set Access-Control-Allow-Origin \"*\"
        FileETag None
      </LocationMatch>
      <Directory \"/usr/local/apache2/htdocs/assets\">
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
        <IfModule mod_expires.c>
          ExpiresActive On
          ExpiresDefault \"access plus 1 year\"
        </IfModule>
        Header set Cache-Control \"public, immutable, max-age=31536000\"
      </Directory>
      <Directory \"/usr/local/apache2/htdocs\">
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} -f
        RewriteRule ^ - [L]
        RewriteCond %{REQUEST_FILENAME} -d
        RewriteRule ^ - [L]
        RewriteCond %{REQUEST_URI} ^/api
        RewriteRule ^ - [L]
        RewriteRule ^ /index.html [L]
      </Directory>
      <Files \"index.html\">
        <IfModule mod_expires.c>
          ExpiresActive On
          ExpiresDefault \"access plus 5 minutes\"
        </IfModule>
        Header set Cache-Control \"public, max-age=300, must-revalidate\"
      </Files>
      <FilesMatch \"\\\\.(env|log|sql|sqlite|db)$$\">
        Require all denied
      </FilesMatch>
      HTTPD_EOF
      httpd-foreground
      "

volumes:
  updesk_data:
    driver: local
    labels:
      - "com.updesk.description=UpDesk SQLite database storage"
  updesk_static:
    driver: local
    labels:
      - "com.updesk.description=UpDesk static files (frontend build)"

networks:
  updesk_network:
    driver: bridge
    labels:
      - "com.updesk.description=UpDesk application network"
```

5. **Deploy the stack** klicken

### Zugriff

- **URL**: `http://DEINE-SERVER-IP`
- **Beispiel**: `http://192.168.1.100`

### Vorteile

✅ Standard-HTTP-Port (80)  
✅ Apache Reverse Proxy (wie im Original)  
✅ Bessere Performance  
✅ Caching für statische Dateien  
✅ Security Headers  
✅ Gzip Compression  

### Nachteile

❌ Zwei Container (mehr Ressourcen)  
❌ Komplexere Konfiguration  

---

## 🔍 Überprüfung der Installation

### Container-Status prüfen

1. **Portainer** → Containers
2. Suche nach `updesk-backend` (und `updesk-app` bei Variante 2)
3. Status sollte **running** sein (grün)

### Health Check

**Variante 1** (Port 5002):
```bash
curl http://DEINE-SERVER-IP:5002/api/health
```

**Variante 2** (Port 80):
```bash
curl http://DEINE-SERVER-IP/api/health
```

Erwartete Antwort:
```json
{"status":"ok"}
```

### Logs anzeigen

1. **Portainer** → Containers
2. Container auswählen (`updesk-backend` oder `updesk-app`)
3. **Logs** klicken

---

## 🔧 Fehlerbehebung

### Problem: Port bereits belegt

**Fehler**: `Bind for 0.0.0.0:80 failed: port is already allocated`

**Lösung**:
1. Anderen Port verwenden (z.B. `8080:80` statt `80:80`)
2. Oder bestehenden Service auf Port 80 stoppen

### Problem: Container startet nicht

**Lösung**:
1. Logs prüfen (siehe oben)
2. Health Check deaktivieren (Zeilen mit `healthcheck:` entfernen)
3. Stack neu deployen

### Problem: Apache zeigt "502 Bad Gateway" oder "Service Unavailable"

**Ursache**: Backend ist noch nicht bereit

**Lösung**:
1. Warte 30-60 Sekunden (Backend braucht Zeit zum Starten)
2. Prüfe Backend-Logs: `docker logs updesk-backend`
3. Prüfe ob Backend-Container läuft: `docker ps | grep updesk`
4. Prüfe Health Check: `curl http://localhost:5002/api/health` (im Backend-Container)

### Problem: Datenbank-Fehler

**Lösung**:
1. Volume löschen und neu erstellen:
   ```bash
   docker volume rm updesk_data
   ```
2. Stack neu deployen

---

## 🔄 Updates

### Update auf neue Version

1. **Portainer** → Stacks → Dein Stack auswählen
2. **Editor** klicken
3. **Pull and redeploy** aktivieren
4. **Update the stack** klicken

Oder via CLI:
```bash
docker pull uptecps/updesk:latest
docker-compose up -d
```

---

## 📊 Ressourcen-Anforderungen

### Variante 1 (nur Backend)
- **RAM**: ~150-200 MB
- **CPU**: Minimal
- **Disk**: ~100 MB + Datenbank

### Variante 2 (Backend + Nginx)
- **RAM**: ~200-300 MB
- **CPU**: Minimal
- **Disk**: ~150 MB + Datenbank

---

## 🔐 Sicherheit

### Empfohlene Einstellungen

1. **Firewall konfigurieren**:
   ```bash
   # Nur Port 80 öffnen (Variante 2)
   sudo ufw allow 80/tcp
   
   # Oder Port 5002 (Variante 1)
   sudo ufw allow 5002/tcp
   ```

2. **HTTPS einrichten** (optional):
   - Verwende einen externen Reverse Proxy (z.B. Traefik, Nginx Proxy Manager)
   - Oder Let's Encrypt Zertifikate

3. **Zugriff beschränken**:
   - Verwende VPN oder Firewall-Regeln
   - Oder setze Authentifizierung vor UpDesk

---

## 📚 Weitere Informationen

- **GitHub**: https://github.com/uptec-ps/updesk
- **Docker Hub**: https://hub.docker.com/r/uptecps/updesk
- **Dokumentation**: Siehe Repository

---

## ❓ Häufige Fragen

### Kann ich beide Varianten gleichzeitig laufen lassen?

Nein, sie würden sich gegenseitig stören. Wähle eine Variante.

### Wie ändere ich den Port?

Ändere in der YAML-Datei die Zeile:
```yaml
ports:
  - "DEIN-PORT:80"  # z.B. "8080:80"
```

### Wo werden die Daten gespeichert?

In Docker Volumes:
- `updesk_data` - SQLite Datenbank
- `updesk_static` - Frontend-Dateien (nur Variante 2)

### Wie sichere ich die Datenbank?

```bash
# Backup erstellen
docker cp updesk-backend:/app/data/updesk.db ./backup-$(date +%Y%m%d).db

# Backup wiederherstellen
docker cp ./backup-20240101.db updesk-backend:/app/data/updesk.db
docker restart updesk-backend
```

---

**Viel Erfolg mit UpDesk! 🚀**