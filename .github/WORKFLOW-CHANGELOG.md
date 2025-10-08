# 📝 Workflow Changelog

## Version 2.0 - Dual-Trigger Strategie

**Datum:** 2024

### 🎉 Neue Features

#### 1. Automatisches `latest` Tag Update bei Push
- **Trigger:** Jeder Push auf den `main` Branch
- **Aktion:** Baut und pusht automatisch das `latest` Tag zu Docker Hub
- **Vorteil:** Kontinuierliche Bereitstellung der neuesten Entwicklungsversion

#### 2. Separate Build-Logik für Push vs. Release
- **Push auf main:**
  - Nur `latest` Tag wird erstellt
  - Keine Docker Hub Beschreibungsaktualisierung
  - Schnellere Builds durch fokussierte Aufgaben
  
- **GitHub Release:**
  - Release-Tag (z.B. `v2.0.0`) + `latest` Tag
  - Docker Hub Beschreibungsaktualisierung
  - Detaillierte Build Summary mit Release-Informationen

#### 3. Verbesserte Build Summaries
- **Push-Builds:** Zeigt Branch, Commit und `latest` Tag
- **Release-Builds:** Zeigt Release-Version, beide Tags und Pull-Commands

#### 4. Intelligente Metadaten
- **Push-Builds:** Version als `dev-{commit-sha}`
- **Release-Builds:** Version als Release-Tag (z.B. `v2.0.0`)

---

## Migration von Version 1.0

### Was hat sich geändert?

#### Vorher (v1.0)
```yaml
on:
  release:
    types: [published]
```
- Nur bei Releases ausgeführt
- Immer beide Tags (`version` + `latest`)
- Immer Docker Hub Beschreibungsaktualisierung

#### Nachher (v2.0)
```yaml
on:
  push:
    branches:
      - main
  release:
    types: [published]
```
- Bei Push **und** bei Releases ausgeführt
- Intelligente Tag-Verwaltung je nach Trigger
- Bedingte Docker Hub Beschreibungsaktualisierung

---

## Workflow-Vergleich

| Feature | v1.0 (Nur Releases) | v2.0 (Push + Releases) |
|---------|---------------------|------------------------|
| **Trigger** | Nur Releases | Push auf main + Releases |
| **`latest` Update** | Nur bei Releases | Bei jedem Push + Release |
| **Versionierte Tags** | Bei Releases | Bei Releases |
| **Docker Hub Sync** | Immer | Nur bei Releases |
| **Build Frequency** | Manuell (Release) | Automatisch (Push) |
| **Entwicklungs-Builds** | ❌ Nicht verfügbar | ✅ Automatisch |
| **Produktions-Builds** | ✅ Verfügbar | ✅ Verfügbar |

---

## Vorteile der neuen Strategie

### 🚀 Continuous Deployment
- Jeder Commit auf `main` ist automatisch als Docker Image verfügbar
- Keine manuelle Intervention nötig
- Schnelleres Feedback für Entwickler

### 🔄 Flexibilität
- Entwickler können `latest` für Testing nutzen
- Produktionsumgebungen können versionierte Tags nutzen
- Beide Workflows koexistieren harmonisch

### 📦 Effizienz
- Push-Builds sind fokussiert (nur `latest`)
- Release-Builds sind umfassend (Tags + Beschreibung)
- Optimale Nutzung von Build-Ressourcen

### 🎯 Klarheit
- Klare Trennung zwischen Entwicklung und Produktion
- Separate Build Summaries für bessere Übersicht
- Nachvollziehbare Versionshistorie

---

## Breaking Changes

### ⚠️ Keine Breaking Changes!

Die neue Version ist **vollständig rückwärtskompatibel**:
- Bestehende Release-Workflows funktionieren weiterhin
- Versionierte Tags werden wie gewohnt erstellt
- Docker Hub Beschreibung wird bei Releases aktualisiert

### ✅ Nur Erweiterungen

Die neuen Features sind **additive**:
- Push-Trigger ist zusätzlich zu Release-Trigger
- Keine Änderungen an bestehenden Funktionen
- Keine Änderungen an Tag-Namen oder -Struktur

---

## Empfohlene Nutzung

### Für Entwicklung
```bash
# Code ändern und pushen
git push origin main

# Warten auf Build (~15 Min)
# Dann testen mit:
docker pull uptecps/updesk:latest
docker-compose up -d
```

### Für Produktion
```bash
# Release erstellen
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin v2.0.0
# GitHub Release veröffentlichen

# In Produktion deployen mit:
docker pull uptecps/updesk:v2.0.0
docker-compose up -d
```

---

## Technische Details

### Neue Workflow-Steps

#### 1. Extract Metadata
```yaml
- name: Extract metadata
  id: meta
  run: |
    if [ "${{ github.event_name }}" == "release" ]; then
      echo "IS_RELEASE=true" >> $GITHUB_OUTPUT
      echo "VERSION=${{ github.event.release.tag_name }}" >> $GITHUB_OUTPUT
    else
      echo "IS_RELEASE=false" >> $GITHUB_OUTPUT
      echo "VERSION=dev-${GITHUB_SHA::7}" >> $GITHUB_OUTPUT
    fi
```

#### 2. Conditional Builds
```yaml
- name: Build and push Docker image (Release)
  if: github.event_name == 'release'
  # ... Release-spezifische Konfiguration

- name: Build and push Docker image (Push to main)
  if: github.event_name == 'push'
  # ... Push-spezifische Konfiguration
```

#### 3. Conditional Docker Hub Sync
```yaml
- name: Update Docker Hub description
  if: github.event_name == 'release'
  # Nur bei Releases ausführen
```

---

## Testing

### Workflow wurde getestet mit:
- ✅ Push auf `main` Branch
- ✅ GitHub Release Erstellung
- ✅ Multi-Platform Builds (AMD64 + ARM64)
- ✅ Docker Hub Push
- ✅ Build Summaries
- ✅ Cache-Funktionalität

---

## Zukünftige Erweiterungen

### Mögliche Features für v3.0:
- 🔄 Automatische Rollback-Funktionalität
- 🏷️ Zusätzliche Tags (z.B. `stable`, `beta`)
- 📊 Build-Metriken und Statistiken
- 🔔 Slack/Discord Benachrichtigungen
- 🧪 Automatische Tests vor Push
- 📦 Artifact-Uploads für Debugging

---

## Support

Bei Fragen oder Problemen:
1. Siehe `.github/workflows/README.md` für Details
2. Siehe `.github/DOCKER-WORKFLOW.md` für Strategie
3. Öffne ein Issue auf GitHub

---

**Workflow v2.0 - Continuous Deployment für UpDesk! 🚀**