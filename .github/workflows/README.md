# GitHub Actions Workflows

## 🚀 docker.yml - Automatischer Docker Build bei Releases

### Trigger
Dieser Workflow wird **nur bei neuen GitHub Releases** ausgeführt:
- Wenn ein Release mit dem Status `published` erstellt wird

### Was macht der Workflow?

1. **Multi-Platform Build**
   - Baut Docker Images für `linux/amd64` und `linux/arm64`
   - Nutzt QEMU für Cross-Platform Builds

2. **Docker Hub Push**
   - Pusht das Image zu Docker Hub: `uptecps/updesk`
   - Verwendet GitHub Secrets für Authentifizierung

3. **Zwei Tags**
   - Release-Tag: `uptecps/updesk:v2.0.0` (Beispiel)
   - Latest-Tag: `uptecps/updesk:latest`

4. **Metadata**
   - Fügt OCI-konforme Labels hinzu
   - Aktualisiert die Docker Hub Beschreibung

5. **Build Summary**
   - Erstellt eine übersichtliche Zusammenfassung im GitHub Actions Tab

### Benötigte GitHub Secrets

Stelle sicher, dass folgende Secrets in deinem Repository konfiguriert sind:

| Secret | Beschreibung |
|--------|--------------|
| `DOCKER_USERNAME` | Docker Hub Benutzername (z.B. `uptecps`) |
| `DOCKER_PASSWORD` | Docker Hub Access Token oder Passwort |

**Secrets konfigurieren:**
1. Gehe zu: `Settings` → `Secrets and variables` → `Actions`
2. Klicke auf `New repository secret`
3. Füge `DOCKER_USERNAME` und `DOCKER_PASSWORD` hinzu

### Verwendung

#### 1. Neues Release erstellen

```bash
# Tag erstellen
git tag -a v2.0.0 -m "Release v2.0.0 - Apache-Only"

# Tag pushen
git push origin v2.0.0
```

#### 2. Release auf GitHub veröffentlichen

1. Gehe zu: `Releases` → `Draft a new release`
2. Wähle den Tag: `v2.0.0`
3. Titel: `v2.0.0 - Apache-Only Release`
4. Beschreibung hinzufügen
5. Klicke auf `Publish release`

#### 3. Workflow läuft automatisch

Der Workflow startet automatisch und:
- Baut das Docker Image
- Pusht zu Docker Hub mit Tags `v2.0.0` und `latest`
- Aktualisiert die Docker Hub Beschreibung

### Workflow-Status überprüfen

- Gehe zu: `Actions` → `Docker Release Build`
- Sieh dir die Build-Logs an
- Überprüfe die Build Summary

### Docker Image verwenden

Nach erfolgreichem Build:

```bash
# Mit Release-Tag
docker pull uptecps/updesk:v2.0.0

# Mit latest-Tag
docker pull uptecps/updesk:latest

# Starten
docker-compose up -d
```

### Features

✅ **Multi-Platform Support** - AMD64 und ARM64  
✅ **Automatische Builds** - Bei jedem Release  
✅ **Zwei Tags** - Release-Version und latest  
✅ **Build Cache** - Schnellere Builds durch GitHub Actions Cache  
✅ **OCI Labels** - Standardisierte Metadaten  
✅ **Docker Hub Sync** - Automatische Beschreibungsaktualisierung  
✅ **Build Summary** - Übersichtliche Zusammenfassung  

### Troubleshooting

#### Workflow schlägt fehl: "Error: Cannot connect to Docker daemon"
- Dies ist normal bei GitHub Actions - der Workflow nutzt Docker Buildx

#### Workflow schlägt fehl: "Error: denied: requested access to the resource is denied"
- Überprüfe die GitHub Secrets `DOCKER_USERNAME` und `DOCKER_PASSWORD`
- Stelle sicher, dass das Docker Hub Access Token gültig ist

#### Image wird nicht gepusht
- Überprüfe, ob der Release-Status `published` ist (nicht `draft`)
- Sieh dir die Workflow-Logs an für Details

#### ARM64 Build dauert lange
- ARM64 Builds nutzen QEMU-Emulation und sind langsamer
- Dies ist normal und kann 10-20 Minuten dauern

### Workflow anpassen

Um den Workflow anzupassen, bearbeite `.github/workflows/docker.yml`:

```yaml
# Andere Plattformen hinzufügen
platforms: linux/amd64,linux/arm64,linux/arm/v7

# Andere Tags hinzufügen
tags: |
  ${{ env.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}:${{ github.event.release.tag_name }}
  ${{ env.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}:latest
  ${{ env.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}:stable
```

### Weitere Informationen

- **GitHub Actions Dokumentation**: https://docs.github.com/en/actions
- **Docker Build Push Action**: https://github.com/docker/build-push-action
- **Docker Hub**: https://hub.docker.com/r/uptecps/updesk

---

**Automatisierte Docker-Builds für UpDesk! 🚀**