# Fix: URL-Feld für integrierte Apps

## Problem
Beim Bearbeiten von integrierten Apps (UpFlow, UpSum, UpNote, Port Dokumentation) konnte das URL-Feld geändert werden, was zu Problemen führen würde, da diese Apps feste Pfade haben.

## Lösung
Das URL-Feld wird jetzt automatisch deaktiviert, wenn eine integrierte App bearbeitet wird.

## Änderungen

### ProgramModal.vue

#### 1. Template-Änderungen
- URL-Input-Feld wird mit `:disabled="isIntegratedApp"` deaktiviert
- Zusätzliche CSS-Klasse `:class="{ 'input-disabled': isIntegratedApp }"` für visuelles Feedback
- Info-Nachricht wird angezeigt, wenn es sich um eine integrierte App handelt

#### 2. Script-Änderungen
- Neue computed property `isIntegratedApp` hinzugefügt
- Prüft, ob die URL mit `/apps/` beginnt (kennzeichnet integrierte Apps)

#### 3. Style-Änderungen
- `.form-input:disabled` und `.input-disabled` Styles für deaktivierte Felder
- `.info-message` Style für die Hinweis-Box
- `.info-icon` Style für das Info-Icon

## Integrierte Apps

Die folgenden Apps werden als integriert erkannt (URL beginnt mit `/apps/`):

1. **UpFlow** - `/apps/upflow`
2. **UpSum** - `/apps/upsum`
3. **UpNote** - `/apps/upnote`
4. **Port Dokumentation** - `/apps/portdocumentation`

## Verhalten

### Beim Bearbeiten einer integrierten App:
- ✅ Name kann geändert werden
- ✅ Icon kann geändert werden
- ✅ Position kann geändert werden
- ❌ URL kann NICHT geändert werden (Feld ist deaktiviert)
- ℹ️ Info-Nachricht wird angezeigt: "Dies ist eine integrierte App. Die URL kann nicht geändert werden."

### Beim Bearbeiten einer externen App:
- ✅ Alle Felder können normal bearbeitet werden
- ✅ URL-Feld ist aktiv und kann geändert werden

### Beim Hinzufügen einer neuen App:
- ✅ Alle Felder sind aktiv
- ✅ URL-Feld kann frei eingegeben werden

## Visuelles Feedback

- **Deaktiviertes URL-Feld:**
  - Grauer Hintergrund (`var(--bg-tertiary)`)
  - Reduzierte Deckkraft (0.7)
  - "Not-allowed" Cursor
  - Sekundäre Textfarbe

- **Info-Nachricht:**
  - Gelber Hintergrund (rgba(255, 193, 7, 0.1))
  - Gelber Rahmen (rgba(255, 193, 7, 0.3))
  - Info-Icon in Gelb
  - Klarer, informativer Text

## Technische Details

### Erkennung integrierter Apps
```javascript
const isIntegratedApp = computed(() => {
  return formData.value.url.startsWith('/apps/')
})
```

### Bedingte Deaktivierung
```vue
<input
  id="url"
  v-model="formData.url"
  type="url"
  required
  :disabled="isIntegratedApp"
  :class="{ 'input-disabled': isIntegratedApp }"
/>
```

### Bedingte Info-Nachricht
```vue
<div v-if="isIntegratedApp" class="info-message">
  <svg>...</svg>
  <span>Dies ist eine integrierte App. Die URL kann nicht geändert werden.</span>
</div>
```

## Testing

### Testfälle:

1. **Integrierte App bearbeiten (z.B. UpFlow)**
   - Rechtsklick auf UpFlow Icon → "Bearbeiten"
   - URL-Feld sollte deaktiviert sein
   - Info-Nachricht sollte sichtbar sein
   - Name und Icon können geändert werden

2. **Externe App bearbeiten (z.B. Google)**
   - Rechtsklick auf Google Icon → "Bearbeiten"
   - URL-Feld sollte aktiv sein
   - Keine Info-Nachricht
   - Alle Felder können geändert werden

3. **Neue App hinzufügen**
   - Rechtsklick auf Desktop → "Programm hinzufügen"
   - Alle Felder sollten aktiv sein
   - URL kann frei eingegeben werden

## Vorteile

✅ Verhindert versehentliche Änderungen an integrierten App-URLs
✅ Klares visuelles Feedback für Benutzer
✅ Informative Nachricht erklärt, warum das Feld deaktiviert ist
✅ Keine Auswirkungen auf externe Apps oder neue Apps
✅ Konsistente Benutzererfahrung

## Dateien geändert

- `src/components/ProgramModal.vue`
  - Template: URL-Input mit bedingter Deaktivierung
  - Script: `isIntegratedApp` computed property
  - Style: Styles für deaktivierte Felder und Info-Nachricht