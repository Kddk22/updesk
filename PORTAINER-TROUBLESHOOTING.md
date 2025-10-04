# Portainer Troubleshooting Guide

## Problem: "No log line matching the '' filter"

Diese Fehlermeldung bedeutet, dass die Container nicht starten oder keine Logs produzieren.

---

## Schritt-für-Schritt Diagnose

### 1️⃣ **Test mit Ultra-Simple Version**

Verwende zuerst `docker-compose.portainer-simple.yml`:

```yaml
version: '3.3'

services:
  updesk:
    image: uptecps/updesk:latest
    ports:
      - "5002:5002"
    environment:
      NODE_ENV: production
    restart: unless-stopped
```

**In Portainer:**
1. Stacks → Add Stack
2. Name: `updesk-test`
3. Kopiere den Inhalt von `docker-compose.portainer-simple.yml`
4. Deploy

**Wenn das funktioniert:** Das Problem liegt an der komplexeren YAML-Syntax
**Wenn das nicht funktioniert:** Das Problem liegt am Docker Image oder Portainer-Setup

---

### 2️⃣ **Container Status überprüfen**

Nach dem Deployment in Portainer:

1. Gehe zu **Containers**
2. Suche nach `updesk-backend` oder `updesk-app`
3. Überprüfe den Status:
   - ✅ **Running** = Container läuft
   - ⚠️ **Restarting** = Container startet immer wieder neu (Fehler im Container)
   - ❌ **Exited** = Container ist gestoppt (Fehler beim Start)

---

### 3️⃣ **Logs manuell abrufen**

**In Portainer:**
1. Gehe zu **Containers**
2. Klicke auf den Container-Namen
3. Klicke auf **Logs** (nicht den Filter verwenden!)
4. Scrolle nach unten

**Über SSH/Terminal:**
```bash
# Alle Container anzeigen
docker ps -a

# Logs vom Backend
docker logs updesk-backend

# Logs vom Apache (falls vorhanden)
docker logs updesk-app

# Live-Logs verfolgen
docker logs -f updesk-backend
```

---

### 4️⃣ **Häufige Fehlerursachen**

#### **A) Port bereits belegt**

**Symptom:** Container startet nicht, Log zeigt "address already in use"

**Lösung:** Ändere den Port in der YAML:
```yaml
ports:
  - "5003:5002"  # Statt 5002:5002
```

#### **B) Image kann nicht heruntergeladen werden**

**Symptom:** "pull access denied" oder "manifest unknown"

**Lösung:** 
1. Überprüfe, ob `uptecps/updesk:latest` auf Docker Hub existiert
2. Versuche einen spezifischen Tag: `uptecps/updesk:v1.0.0`
3. Oder baue das Image selbst (siehe unten)

#### **C) Speicherplatz voll**

**Symptom:** "no space left on device"

**Lösung:**
```bash
# Alte Images löschen
docker system prune -a

# Speicherplatz überprüfen
df -h
```

#### **D) Portainer-Version zu alt**

**Symptom:** YAML-Syntax-Fehler

**Lösung:** Update Portainer auf die neueste Version

---

### 5️⃣ **Alternative: Image selbst bauen**

Falls das Docker Hub Image nicht verfügbar ist:

**Option A: Lokal bauen und pushen**
```bash
# Repository klonen
git clone https://github.com/uptec-ps/updesk.git
cd updesk

# Image bauen
docker build -t mein-updesk:latest .

# In Portainer verwenden
# Ändere in der YAML:
image: mein-updesk:latest
```

**Option B: Portainer Build verwenden**
```yaml
version: '3.3'

services:
  updesk:
    build:
      context: https://github.com/uptec-ps/updesk.git
    ports:
      - "5002:5002"
    environment:
      NODE_ENV: production
    restart: unless-stopped
```

⚠️ **Achtung:** Das Build-Verfahren dauert länger und benötigt mehr Ressourcen!

---

### 6️⃣ **Netzwerk-Probleme**

**Symptom:** Apache kann Backend nicht erreichen

**Test:**
```bash
# In den Apache-Container einsteigen
docker exec -it updesk-app sh

# Backend testen
wget -O- http://updesk:5002/api/health

# Sollte JSON zurückgeben
```

**Lösung:** Stelle sicher, dass beide Container im gleichen Netzwerk sind (bereits in den YAML-Dateien konfiguriert)

---

### 7️⃣ **Apache-Konfiguration testen**

Falls der Apache-Container nicht startet:

```bash
# Apache-Logs anzeigen
docker logs updesk-app

# In den Container einsteigen
docker exec -it updesk-app sh

# Konfiguration testen
httpd -t

# Sollte "Syntax OK" zeigen
```

---

## Empfohlene Reihenfolge

1. ✅ **Start:** `docker-compose.portainer-simple.yml` (nur Backend)
2. ✅ **Test:** Öffne `http://DEINE-IP:5002/api/health`
3. ✅ **Upgrade:** `docker-compose.portainer.yml` (Backend mit Volumes)
4. ✅ **Full:** `docker-compose.portainer-full.yml` (Backend + Apache)

---

## Erfolgreiche Deployment-Checks

### Backend läuft:
```bash
curl http://localhost:5002/api/health
# Sollte: {"status":"ok"} zurückgeben
```

### Apache läuft:
```bash
curl http://localhost/api/health
# Sollte: {"status":"ok"} zurückgeben (über Apache-Proxy)
```

### Frontend läuft:
```bash
curl http://localhost/
# Sollte: HTML-Seite zurückgeben
```

---

## Weitere Hilfe

**Logs sammeln:**
```bash
# Alle Logs in eine Datei
docker logs updesk-backend > backend.log 2>&1
docker logs updesk-app > apache.log 2>&1
```

**Container-Details:**
```bash
docker inspect updesk-backend
docker inspect updesk-app
```

**Netzwerk überprüfen:**
```bash
docker network ls
docker network inspect updesk_updesk_network
```

---

## Kontakt

Falls das Problem weiterhin besteht, erstelle ein GitHub Issue mit:
- Portainer-Version
- Docker-Version
- Verwendete YAML-Datei
- Komplette Logs (backend.log + apache.log)
- Container-Status (`docker ps -a`)