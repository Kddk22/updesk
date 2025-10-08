# UpDesk - Datenbank-Migrationen

## 📋 Übersicht

UpDesk verwendet ein automatisches Migrations-System, das beim Start der Anwendung ausgeführt wird. Dies stellt sicher, dass bestehende Datenbanken automatisch mit neuen Features aktualisiert werden.

## 🔄 Wie funktionieren Migrationen?

### Automatische Ausführung

Beim Start der Anwendung (`npm start` oder `npm run dev`) werden automatisch folgende Schritte ausgeführt:

1. **Datenbank-Initialisierung**: Tabellen werden erstellt (falls nicht vorhanden)
2. **Standard-Daten**: Bei neuen Installationen werden Default-Programme eingefügt
3. **Migrationen**: Bestehende Datenbanken werden auf den neuesten Stand gebracht

### Migration-Logs

Im Server-Log siehst du:

```bash
🗄️  Initializing database...
🔄 Running database migrations...
📦 Adding Docker Manager to existing database...  # Nur wenn fehlend
✅ Docker Manager added successfully              # Nur wenn fehlend
✅ Database initialized successfully
```

## 📦 Aktuelle Migrationen

### Migration 1: Docker Manager (v1.1.2)

**Was wird gemacht:**
- Prüft, ob der Docker Manager bereits existiert
- Fügt ihn hinzu, falls er fehlt
- Position: (4, 0)

**Wann wird es ausgeführt:**
- Bei jedem Start der Anwendung
- Nur wenn `/apps/docker` nicht in der Datenbank existiert

**Code:**
```javascript
const dockerManager = await db.getAsync(
  'SELECT * FROM programs WHERE url = ?',
  ['/apps/docker']
);

if (!dockerManager) {
  await db.runAsync(
    'INSERT INTO programs (name, url, icon, position_x, position_y) VALUES (?, ?, ?, ?, ?)',
    ['Docker Manager', '/apps/docker', '/icons/docker.svg', 4, 0]
  );
}
```

## 🐳 Docker-Deployment

### Verhalten beim Update

Wenn du ein neues Docker-Image pullst und den Container neu startest:

```bash
docker-compose pull
docker-compose up -d
```

**Was passiert:**

1. ✅ **Neues Image** wird heruntergeladen
2. ✅ **Container** wird neu gestartet
3. ✅ **Datenbank** bleibt erhalten (im Volume `updesk_data`)
4. ✅ **Migrationen** werden automatisch ausgeführt
5. ✅ **Docker Manager** erscheint automatisch (falls fehlend)

### Volumes

Die Datenbank wird in einem Docker Volume gespeichert:

```yaml
volumes:
  - updesk_data:/app/data  # Datenbank bleibt erhalten
```

**Vorteile:**
- ✅ Daten bleiben bei Updates erhalten
- ✅ Keine manuelle Datenbank-Migration nötig
- ✅ Automatische Aktualisierung mit neuen Features

## 🛠️ Manuelle Migration (falls nötig)

Falls du die Migration manuell ausführen möchtest:

### Lokale Entwicklung

```bash
# Server neu starten (führt Migrationen aus)
npm run dev
```

### Docker

```bash
# Container neu starten (führt Migrationen aus)
docker-compose restart updesk
```

### SQL-Script (Alternative)

Falls du die Migration manuell per SQL ausführen möchtest:

```bash
# In den Container einloggen
docker exec -it updesk-backend sh

# SQLite öffnen
sqlite3 /app/data/updesk.db

# Docker Manager hinzufügen
INSERT INTO programs (name, url, icon, position_x, position_y) 
VALUES ('Docker Manager', '/apps/docker', '/icons/docker.svg', 4, 0);

# Prüfen
SELECT * FROM programs WHERE name = 'Docker Manager';

# Beenden
.exit
```

## 📝 Neue Migrationen hinzufügen

### Entwickler-Anleitung

Um eine neue Migration hinzuzufügen, bearbeite `server/database.js`:

```javascript
const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');
    
    // Migration 1: Docker Manager
    const dockerManager = await db.getAsync(
      'SELECT * FROM programs WHERE url = ?',
      ['/apps/docker']
    );
    
    if (!dockerManager) {
      console.log('📦 Adding Docker Manager...');
      await db.runAsync(
        'INSERT INTO programs (name, url, icon, position_x, position_y) VALUES (?, ?, ?, ?, ?)',
        ['Docker Manager', '/apps/docker', '/icons/docker.svg', 4, 0]
      );
      console.log('✅ Docker Manager added');
    }
    
    // Migration 2: Deine neue Migration
    const myNewFeature = await db.getAsync(
      'SELECT * FROM programs WHERE url = ?',
      ['/apps/mynewfeature']
    );
    
    if (!myNewFeature) {
      console.log('📦 Adding My New Feature...');
      await db.runAsync(
        'INSERT INTO programs (name, url, icon, position_x, position_y) VALUES (?, ?, ?, ?, ?)',
        ['My New Feature', '/apps/mynewfeature', '/icons/mynewfeature.svg', 5, 0]
      );
      console.log('✅ My New Feature added');
    }
    
  } catch (error) {
    console.error('⚠️  Migration warning:', error.message);
  }
};
```

### Best Practices

1. **Idempotent**: Migrationen sollten mehrfach ausführbar sein
2. **Fehlerbehandlung**: Fehler sollten geloggt, aber nicht geworfen werden
3. **Logging**: Klare Logs für jede Migration
4. **Rückwärtskompatibilität**: Alte Daten nicht löschen

## 🔍 Troubleshooting

### Migration wird nicht ausgeführt

**Problem**: Docker Manager erscheint nicht nach Update

**Lösung**:
```bash
# Container-Logs prüfen
docker logs updesk-backend

# Nach "Running database migrations" suchen
# Sollte "Docker Manager added" zeigen (falls fehlend)
```

### Datenbank zurücksetzen

**Warnung**: Löscht alle Daten!

```bash
# Docker Volume löschen
docker-compose down -v

# Neu starten (erstellt neue DB mit allen Features)
docker-compose up -d
```

### Datenbank-Backup

**Vor größeren Updates empfohlen:**

```bash
# Backup erstellen
docker cp updesk-backend:/app/data/updesk.db ./updesk-backup.db

# Wiederherstellen (falls nötig)
docker cp ./updesk-backup.db updesk-backend:/app/data/updesk.db
docker-compose restart updesk
```

## 📊 Migration-Historie

| Version | Migration | Beschreibung |
|---------|-----------|--------------|
| v1.1.2  | Docker Manager | Fügt Docker Manager zu bestehenden DBs hinzu |
| v1.0.0  | Initial | Erste Version mit Standard-Programmen |

## 🚀 Zusammenfassung

### Für Benutzer

- ✅ **Keine manuelle Aktion nötig**
- ✅ Migrationen laufen automatisch beim Start
- ✅ Daten bleiben bei Updates erhalten
- ✅ Neue Features erscheinen automatisch

### Für Entwickler

- ✅ Migrationen in `server/database.js` hinzufügen
- ✅ Idempotent und fehlertolerant implementieren
- ✅ Klare Logs für Debugging
- ✅ Dokumentation aktualisieren

## 📚 Weitere Informationen

- [Docker Manager Dokumentation](./DOCKER-MANAGER.md)
- [Schnellstart-Anleitung](./DOCKER-MANAGER-QUICKSTART.md)
- [Architektur-Übersicht](./DOCKER-MANAGER-ARCHITECTURE.md)