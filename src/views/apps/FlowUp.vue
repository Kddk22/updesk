<template>
  <DesktopWindow
    title="FlowUp"
    :initial-width="900"
    :initial-height="700"
    :initial-x="150"
    :initial-y="100"
    @close="closeApp"
    @minimize="minimizeApp"
    @maximize="maximizeApp"
  >
    <div class="flowup-app">
      <!-- Sidebar Navigation -->
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="app-logo">
            <span class="logo-icon">⚡</span>
            <span class="logo-text">FlowUp</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <button
            v-for="item in navigationItems"
            :key="item.key"
            class="nav-item"
            :class="{ active: activeView === item.key }"
            @click="activeView = item.key"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.label }}</span>
          </button>
        </nav>
      </div>
      
      <!-- Main Content -->
      <div class="main-content">
        <!-- Overview -->
        <div v-if="activeView === 'overview'" class="view-content">
          <div class="view-header">
            <h2>Übersicht</h2>
            <p>Aktuelle Zählerstände und Verbrauchsanalyse</p>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">⚡</div>
              <div class="stat-info">
                <h3>Strom</h3>
                <p class="stat-value">{{ latestReadings.strom?.stand || 'Keine Daten' }}</p>
                <p class="stat-label">kWh</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">💧</div>
              <div class="stat-info">
                <h3>Wasser</h3>
                <p class="stat-value">{{ latestReadings.wasser?.stand || 'Keine Daten' }}</p>
                <p class="stat-label">m³</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <h3>Zähler</h3>
                <p class="stat-value">{{ meters.length }}</p>
                <p class="stat-label">Registriert</p>
              </div>
            </div>
          </div>
          
          <!-- Recent Readings -->
          <div class="recent-readings">
            <h3>Letzte Ablesungen</h3>
            <div class="readings-list">
              <div
                v-for="reading in recentReadings"
                :key="reading.id"
                class="reading-item"
              >
                <div class="reading-info">
                  <span class="reading-meter">{{ reading.zaehler_nummer }}</span>
                  <span class="reading-type">{{ reading.kategorie }}</span>
                </div>
                <div class="reading-value">
                  <span class="value">{{ reading.stand }}</span>
                  <span class="unit">{{ reading.kategorie === 'strom' ? 'kWh' : 'm³' }}</span>
                </div>
                <div class="reading-date">
                  {{ formatDate(reading.datum) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Add Reading -->
        <div v-if="activeView === 'add-reading'" class="view-content">
          <div class="view-header">
            <h2>Zählerstand einpflegen</h2>
            <p>Neuen Zählerstand erfassen</p>
          </div>
          
          <div class="form-container">
            <form @submit.prevent="addReading" class="reading-form">
              <div class="form-group">
                <label for="meter-select">Zähler auswählen</label>
                <select
                  id="meter-select"
                  v-model="newReading.zaehler_id"
                  class="form-control"
                  required
                >
                  <option value="">Bitte wählen...</option>
                  <option
                    v-for="meter in meters"
                    :key="meter.id"
                    :value="meter.id"
                  >
                    {{ meter.zaehlernummer }} ({{ meter.zaehlertyp }})
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="reading-date">Datum</label>
                <input
                  id="reading-date"
                  v-model="newReading.datum"
                  type="date"
                  class="form-control"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="reading-value">Aktueller Zählerstand</label>
                <input
                  id="reading-value"
                  v-model.number="newReading.stand"
                  type="number"
                  step="0.01"
                  class="form-control"
                  placeholder="z.B. 1234.56"
                  required
                />
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="isLoading">
                  <span v-if="isLoading">Speichern...</span>
                  <span v-else>Zählerstand speichern</span>
                </button>
                <button type="button" class="btn btn-secondary" @click="resetReadingForm">
                  Zurücksetzen
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Settings -->
        <div v-if="activeView === 'settings'" class="view-content">
          <div class="view-header">
            <h2>Einstellungen</h2>
            <p>Zähler verwalten und konfigurieren</p>
          </div>
          
          <!-- Add New Meter -->
          <div class="settings-section">
            <h3>Neuen Zähler hinzufügen</h3>
            <form @submit.prevent="addMeter" class="meter-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="meter-number">Zählernummer</label>
                  <input
                    id="meter-number"
                    v-model="newMeter.zaehlernummer"
                    type="text"
                    class="form-control"
                    placeholder="z.B. 12345678"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label for="meter-category">Kategorie</label>
                  <select
                    id="meter-category"
                    v-model="newMeter.zaehlertyp"
                    class="form-control"
                    required
                  >
                    <option value="">Bitte wählen...</option>
                    <option value="strom">Strom</option>
                    <option value="wasser">Wasser</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="meter-name">Name/Bezeichnung</label>
                  <input
                    id="meter-name"
                    v-model="newMeter.name"
                    type="text"
                    class="form-control"
                    placeholder="z.B. Hauptzähler Strom"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label for="initial-reading">Startzählerstand</label>
                  <input
                    id="initial-reading"
                    v-model="newMeter.initialReading"
                    type="number"
                    step="0.01"
                    class="form-control"
                    placeholder="z.B. 12345.67"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label for="initial-date">Datum des Startzählerstands</label>
                  <input
                    id="initial-date"
                    v-model="newMeter.initialDate"
                    type="date"
                    class="form-control"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <button type="submit" class="btn btn-primary" :disabled="isLoading">
                    <span v-if="isLoading">Hinzufügen...</span>
                    <span v-else>Zähler hinzufügen</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          <!-- Existing Meters -->
          <div class="settings-section">
            <h3>Vorhandene Zähler</h3>
            <div class="meters-table">
              <div class="table-header">
                <div class="table-cell">Zählernummer</div>
                <div class="table-cell">Name</div>
                <div class="table-cell">Kategorie</div>
                <div class="table-cell">Aktionen</div>
              </div>
              
              <div
                v-for="meter in meters"
                :key="meter.id"
                class="table-row"
              >
                <div class="table-cell">{{ meter.zaehlernummer }}</div>
                <div class="table-cell">{{ meter.name }}</div>
                <div class="table-cell">
                  <span class="category-badge" :class="meter.zaehlertyp">
                    {{ meter.zaehlertyp }}
                  </span>
                </div>
                <div class="table-cell">
                  <button
                    class="btn btn-danger btn-sm"
                    @click="deleteMeter(meter)"
                    :disabled="isLoading"
                  >
                    Löschen
                  </button>
                </div>
              </div>
              
              <div v-if="meters.length === 0" class="table-empty">
                Keine Zähler vorhanden. Fügen Sie oben einen neuen Zähler hinzu.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DesktopWindow>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import DesktopWindow from '@/components/DesktopWindow.vue'

const router = useRouter()

// State
const activeView = ref('overview')
const isLoading = ref(false)
const meters = ref([])
const readings = ref([])

// Navigation
const navigationItems = [
  { key: 'overview', label: 'Übersicht', icon: '📊' },
  { key: 'add-reading', label: 'Zählerstand einpflegen', icon: '📝' },
  { key: 'settings', label: 'Einstellungen', icon: '⚙️' }
]

// Forms
const newReading = ref({
  zaehler_id: '',
  datum: new Date().toISOString().split('T')[0],
  stand: ''
})

const newMeter = ref({
  zaehlertyp: '',
  zaehlernummer: '',
  name: '',
  initialReading: '',
  initialDate: new Date().toISOString().split('T')[0]
})

// Computed
const latestReadings = computed(() => {
  const latest = {}
  
  for (const reading of readings.value) {
    const meter = meters.value.find(m => m.id === reading.zaehler_id)
    const category = meter?.zaehlertyp
    if (category && (!latest[category] || new Date(reading.datum) > new Date(latest[category].datum))) {
      latest[category] = { ...reading, stand: reading.stand }
    }
  }
  
  return latest
})

const recentReadings = computed(() => {
  return readings.value
    .map(reading => {
      const meter = meters.value.find(m => m.id === reading.zaehler_id)
      return {
        ...reading,
        zaehler_nummer: meter?.zaehlernummer || 'Unbekannt',
        kategorie: meter?.zaehlertyp || 'unbekannt'
      }
    })
    .sort((a, b) => new Date(b.datum) - new Date(a.datum))
    .slice(0, 5)
})

// API Functions
const fetchMeters = async () => {
  try {
    const response = await fetch('/api/zaehler')
    if (response.ok) {
      meters.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching meters:', error)
  }
}

const fetchReadings = async () => {
  try {
    const response = await fetch('/api/zaehlerstaende')
    if (response.ok) {
      readings.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching readings:', error)
  }
}

const addMeter = async () => {
  if (!newMeter.value.zaehlernummer || !newMeter.value.zaehlertyp || !newMeter.value.name || !newMeter.value.initialReading || !newMeter.value.initialDate) {
    alert('Bitte füllen Sie alle Pflichtfelder aus')
    return
  }
  
  isLoading.value = true
  try {
    console.log('Sending meter data:', newMeter.value)
    
    // Zuerst den Zähler erstellen
    const meterData = {
      zaehlertyp: newMeter.value.zaehlertyp,
      zaehlernummer: newMeter.value.zaehlernummer,
      name: newMeter.value.name
    }
    
    const meterResponse = await fetch('/api/zaehler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meterData)
    })
    
    if (meterResponse.ok) {
      const meterResult = await meterResponse.json()
      console.log('Meter added successfully:', meterResult)
      
      // Dann den ersten Zählerstand hinzufügen
      const readingData = {
        zaehler_id: meterResult.id,
        datum: newMeter.value.initialDate,
        stand: parseFloat(newMeter.value.initialReading),
        bemerkung: 'Startzählerstand'
      }
      
      const readingResponse = await fetch('/api/zaehlerstaende', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(readingData)
      })
      
      if (readingResponse.ok) {
        console.log('Initial reading added successfully')
        await fetchMeters()
        await fetchReadings()
        resetMeterForm()
        alert('Zähler und Startzählerstand erfolgreich hinzugefügt!')
      } else {
        const readingError = await readingResponse.json()
        console.error('Error adding initial reading:', readingError)
        alert(`Zähler wurde erstellt, aber Fehler beim Startzählerstand: ${readingError.error}`)
      }
    } else {
      const errorData = await meterResponse.json()
      console.error('Server error:', errorData)
      alert(`Fehler: ${errorData.error}`)
    }
  } catch (error) {
    console.error('Error adding meter:', error)
    alert('Fehler beim Hinzufügen des Zählers: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

const deleteMeter = async (meter) => {
  if (!confirm(`Möchten Sie den Zähler "${meter.zaehler_nummer}" wirklich löschen?`)) return
  
  isLoading.value = true
  try {
    const response = await fetch(`/api/zaehler/${meter.id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      await fetchMeters()
      await fetchReadings()
    }
  } catch (error) {
    console.error('Error deleting meter:', error)
  } finally {
    isLoading.value = false
  }
}

const addReading = async () => {
  if (!newReading.value.zaehler_id || !newReading.value.stand) return
  
  isLoading.value = true
  try {
    const response = await fetch('/api/zaehlerstaende', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newReading.value)
    })
    
    if (response.ok) {
      await fetchReadings()
      resetReadingForm()
      activeView.value = 'overview' // Switch to overview after adding
    } else {
      const errorData = await response.json()
      alert(`Fehler: ${errorData.error}`)
    }
  } catch (error) {
    console.error('Error adding reading:', error)
    alert('Fehler beim Hinzufügen des Zählerstands')
  } finally {
    isLoading.value = false
  }
}

// Helper Functions
const resetMeterForm = () => {
  newMeter.value = {
    zaehlertyp: '',
    zaehlernummer: '',
    name: '',
    initialReading: '',
    initialDate: new Date().toISOString().split('T')[0]
  }
}

const resetReadingForm = () => {
  newReading.value = {
    zaehler_id: '',
    datum: new Date().toISOString().split('T')[0],
    stand: ''
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('de-DE')
}

// Window Controls
const closeApp = () => {
  router.push('/')
}

const minimizeApp = () => {
  // Window component handles minimization
}

const maximizeApp = (isMaximized) => {
  // Window component handles maximization
}

// Lifecycle
onMounted(async () => {
  await fetchMeters()
  await fetchReadings()
})
</script>

<style scoped>
.flowup-app {
  display: flex;
  height: 100%;
  background: var(--bg-primary);
}

/* Sidebar */
.sidebar {
  width: 200px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 20px;
}

.logo-text {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 8px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  text-align: left;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-color);
  color: white;
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

/* Main Content */
.main-content {
  flex: 1;
  overflow: auto;
}

.view-content {
  padding: 24px;
  max-width: 1000px;
}

.view-header {
  margin-bottom: 24px;
}

.view-header h2 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
}

.view-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color-light);
  border-radius: 8px;
}

.stat-info h3 {
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.stat-value {
  margin: 0 0 2px 0;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
}

.stat-label {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
}

/* Recent Readings */
.recent-readings {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
}

.recent-readings h3 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}

.readings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reading-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.reading-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reading-meter {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.reading-type {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: capitalize;
}

.reading-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.value {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 16px;
}

.unit {
  font-size: 12px;
  color: var(--text-secondary);
}

.reading-date {
  font-size: 12px;
  color: var(--text-secondary);
}

/* Forms */
.form-container {
  max-width: 600px;
}

.reading-form,
.meter-form {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 16px;
  align-items: end;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px var(--accent-color-light);
}

.form-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-color-dark);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-hover);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

/* Settings */
.settings-section {
  margin-bottom: 32px;
}

.settings-section h3 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

/* Table */
.meters-table {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 120px 100px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 120px 100px;
  border-bottom: 1px solid var(--border-color);
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  color: var(--text-primary);
  font-size: 14px;
}

.table-header .table-cell {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 12px;
  text-transform: uppercase;
}

.table-empty {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
}

.category-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.category-badge.strom {
  background: #fff3cd;
  color: #856404;
}

.category-badge.wasser {
  background: #d1ecf1;
  color: #0c5460;
}

/* Dark theme adjustments */
.dark .category-badge.strom {
  background: #856404;
  color: #fff3cd;
}

.dark .category-badge.wasser {
  background: #0c5460;
  color: #d1ecf1;
}

/* Responsive */
@media (max-width: 768px) {
  .flowup-app {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .sidebar-nav {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding: 8px;
  }
  
  .nav-item {
    white-space: nowrap;
    margin-right: 8px;
    margin-bottom: 0;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
  }
  
  .table-cell {
    border-bottom: 1px solid var(--border-color);
    padding: 8px 16px;
  }
  
  .table-cell:last-child {
    border-bottom: none;
  }
}
</style>