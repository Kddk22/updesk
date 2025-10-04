# UpDesk für Portainer - Schnellstart

## 🎯 Zwei Varianten verfügbar

### ⚡ Einfach (nur Backend)
- **Datei**: `docker-compose.portainer.yml`
- **Port**: 5002
- **Container**: 1 (Backend)
- **Zugriff**: `http://DEINE-IP:5002`

### 🚀 Vollständig (Backend + Apache)
- **Datei**: `docker-compose.portainer-full.yml`
- **Port**: 80
- **Container**: 2 (Backend + Apache)
- **Zugriff**: `http://DEINE-IP`

---

## 📋 Installation in Portainer

### Schritt 1: Stack erstellen
1. Portainer öffnen
2. **Stacks** → **Add Stack**
3. Name eingeben (z.B. `updesk` oder `updesk-full`)

### Schritt 2: YAML einfügen
Wähle eine Variante und kopiere den Inhalt:

**Einfach**: Inhalt von `docker-compose.portainer.yml`  
**Vollständig**: Inhalt von `docker-compose.portainer-full.yml`

### Schritt 3: Deployen
1. **Deploy the stack** klicken
2. Warten bis beide Container laufen (ca. 30-60 Sekunden)
3. Im Browser öffnen

---

## ✅ Überprüfung

### Container-Status
Portainer → Containers → Suche nach `updesk-backend` (und `updesk-app`)

Status sollte **running** (grün) sein.

### Health Check
**Einfach**:
```bash
curl http://DEINE-IP:5002/api/health
```

**Vollständig**:
```bash
curl http://DEINE-IP/api/health
```

Erwartete Antwort: `{"status":"ok"}`

---

## 🔧 Häufige Probleme

### Port bereits belegt
Ändere in der YAML den Port:
```yaml
ports:
  - "8080:80"  # Statt "80:80"
```

### Apache zeigt 502 Bad Gateway
- **Ursache**: Backend startet noch
- **Lösung**: 30-60 Sekunden warten

### Container startet nicht
1. Logs prüfen: Portainer → Container → Logs
2. Stack neu deployen

---

## 📚 Vollständige Dokumentation

- **Detaillierte Anleitung**: `PORTAINER-INSTALL.md`
- **Varianten-Vergleich**: `DOCKER-COMPOSE-VARIANTS.md`
- **Docker Allgemein**: `DOCKER-README.md`

---

## 🆘 Support

- **GitHub**: https://github.com/uptec-ps/updesk
- **Issues**: https://github.com/uptec-ps/updesk/issues

---

**Viel Erfolg! 🚀**