# 🚀 Portainer Quick Fix

## Problem: Container starten nicht, keine Logs sichtbar

---

## ✅ Lösung 1: Optimierte YAML-Dateien verwenden

Ich habe die YAML-Dateien für maximale Portainer-Kompatibilität optimiert:

### Änderungen:
- ✅ Version `3.8` → `3.3` (bessere Kompatibilität)
- ✅ Environment-Variablen: `- KEY=value` → `KEY: value`
- ✅ Healthchecks entfernt (können Probleme verursachen)
- ✅ Labels entfernt (nicht essentiell)
- ✅ Command-Syntax vereinfacht (multi-line → array)

---

## 📋 Schritt-für-Schritt Anleitung

### **Variante 1: Ultra-Simple (zum Testen)**

Verwende: `docker-compose.portainer-simple.yml`

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
3. Kopiere YAML oben
4. Deploy
5. Warte 30 Sekunden
6. Öffne: `http://DEINE-IP:5002/api/health`

**Erwartetes Ergebnis:** `{"status":"ok"}`

---

### **Variante 2: Backend Only (empfohlen für Start)**

Verwende: `docker-compose.portainer.yml`

**Vorteile:**
- ✅ Einfach
- ✅ Persistente Datenbank
- ✅ Netzwerk-Isolation
- ✅ Port 5002

**In Portainer:**
1. Stacks → Add Stack
2. Name: `updesk`
3. Kopiere Inhalt von `docker-compose.portainer.yml`
4. Deploy

---

### **Variante 3: Full mit Apache (für Produktion)**

Verwende: `docker-compose.portainer-full.yml`

**Vorteile:**
- ✅ Apache Reverse Proxy
- ✅ Port 80 (Standard HTTP)
- ✅ Optimierte Caching
- ✅ Gzip-Kompression
- ✅ Security Headers

**In Portainer:**
1. Stacks → Add Stack
2. Name: `updesk-full`
3. Kopiere Inhalt von `docker-compose.portainer-full.yml`
4. Deploy
5. Warte 60 Sekunden (Apache braucht länger)
6. Öffne: `http://DEINE-IP`

---

## 🔍 Logs richtig anzeigen

### In Portainer:
1. **Containers** (nicht Stacks!)
2. Klicke auf Container-Namen (z.B. `updesk-backend`)
3. **Logs** Tab
4. **NICHT** den Filter verwenden!
5. Scrolle nach unten

### Über Terminal/SSH:
```bash
# Backend-Logs
docker logs updesk-backend

# Apache-Logs (falls vorhanden)
docker logs updesk-app

# Live-Logs
docker logs -f updesk-backend
```

---

## ⚠️ Häufige Probleme

### Problem: "No log line matching the '' filter"
**Ursache:** Portainer-Log-Filter ist aktiv
**Lösung:** Logs über Container-Ansicht öffnen (siehe oben)

### Problem: Container startet nicht
**Diagnose:**
```bash
docker ps -a
# Zeigt alle Container mit Status
```

**Status-Bedeutung:**
- `Up` = Läuft ✅
- `Restarting` = Fehler im Container ⚠️
- `Exited` = Gestoppt ❌

### Problem: Port bereits belegt
**Lösung:** Ändere Port in YAML:
```yaml
ports:
  - "5003:5002"  # Statt 5002
```

### Problem: Image nicht gefunden
**Lösung:** Überprüfe Docker Hub oder baue selbst:
```bash
git clone https://github.com/uptec-ps/updesk.git
cd updesk
docker build -t uptecps/updesk:latest .
```

---

## ✅ Erfolgs-Check

### Backend läuft:
```bash
curl http://localhost:5002/api/health
# Erwartet: {"status":"ok"}
```

### Apache läuft (Full-Version):
```bash
curl http://localhost/api/health
# Erwartet: {"status":"ok"}
```

### Frontend läuft (Full-Version):
```bash
curl http://localhost/
# Erwartet: HTML-Seite
```

---

## 📚 Weitere Dokumentation

- **Detaillierte Anleitung:** `PORTAINER-INSTALL.md`
- **Troubleshooting:** `PORTAINER-TROUBLESHOOTING.md`
- **Varianten-Vergleich:** `DOCKER-COMPOSE-VARIANTS.md`

---

## 🆘 Immer noch Probleme?

**Sammle diese Informationen:**
```bash
# Docker-Version
docker --version

# Container-Status
docker ps -a

# Logs
docker logs updesk-backend > backend.log 2>&1
docker logs updesk-app > apache.log 2>&1

# Portainer-Version
# (In Portainer UI: Settings → About)
```

Dann erstelle ein GitHub Issue mit diesen Informationen.