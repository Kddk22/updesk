<template>
  <DesktopWindow
    title="Port Dokumentation"
    :initial-width="900"
    :initial-height="700"
    :initial-x="150"
    :initial-y="100"
    @close="closeApp"
    @minimize="minimizeApp"
    @maximize="maximizeApp"
  >
    <div class="port-doc-app">
      <!-- Sidebar Navigation -->
      <div class="sidebar">
        <nav class="sidebar-nav">
          <button
            v-for="item in navigationItems"
            :key="item.key"
            class="nav-item"
            :class="{ active: activeView === item.key }"
            @click="activeView = item.key"
          >
            <span class="nav-text">{{ item.label }}</span>
          </button>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Übersicht/Status -->
        <div v-if="activeView === 'overview'" class="view-content">
          <h2>Übersicht</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <h3>Gesamt Ports</h3>
                <p class="stat-value">1000</p>
                <p class="stat-label">5000 - 5999</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔗</div>
              <div class="stat-info">
                <h3>Belegte Ports</h3>
                <p class="stat-value">{{ ports.length }}</p>
                <p class="stat-label">Dokumentiert</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🆓</div>
              <div class="stat-info">
                <h3>Freie Ports</h3>
                <p class="stat-value">{{ 1000 - ports.length }}</p>
                <p class="stat-label">Verfügbar</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Port Liste -->
        <div v-if="activeView === 'list'" class="view-content">
          <h2>Port Liste</h2>
          <table class="ports-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Name</th>
                <th>HTTP Port</th>
                <th>HTTPS Port</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="port in ports" :key="port.httpPort">
                <td><img :src="port.icon" :alt="port.name" class="port-icon" /></td>
                <td>{{ port.name }}</td>
                <td>{{ port.httpPort }}</td>
                <td>{{ port.httpsPort || '-' }}</td>
                <td>
                  <button @click="editPort(port)" class="btn btn-edit">Bearbeiten</button>
                  <button @click="deletePort(port)" class="btn btn-delete">Löschen</button>
                </td>
              </tr>
              <tr v-if="ports.length === 0">
                <td colspan="5" class="empty-state">Keine Ports dokumentiert.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Port hinzufügen -->
        <div v-if="activeView === 'add'" class="view-content">
          <h2>{{ editingPort ? 'Port bearbeiten' : 'Port hinzufügen' }}</h2>
          <form @submit.prevent="savePort" class="port-form">
            <div class="form-group">
              <label for="service-name">Name des Dienstes</label>
              <input
                id="service-name"
                v-model="form.name"
                type="text"
                required
                placeholder="z.B. Nginx Webserver"
              />
            </div>

            <div class="form-group">
              <label for="http-port">HTTP Port</label>
              <input
                id="http-port"
                v-model.number="form.httpPort"
                type="number"
                min="5000"
                max="5999"
                required
                :class="{ invalid: !isValidPort(form.httpPort) }"
              />
              <span v-if="!isValidPort(form.httpPort)" class="error">Port muss zwischen 5000 und 5999 liegen und nicht bereits belegt sein.</span>
            </div>

            <div class="form-group">
              <label for="https-port">HTTPS Port (optional)</label>
              <input
                id="https-port"
                v-model.number="form.httpsPort"
                type="number"
                min="5000"
                max="5999"
                :class="{ invalid: form.httpsPort && !isValidPort(form.httpsPort) }"
              />
              <span v-if="form.httpsPort && !isValidPort(form.httpsPort)" class="error">Port muss zwischen 5000 und 5999 liegen und nicht bereits belegt sein.</span>
            </div>

            <div class="form-group">
              <label>Icon auswählen</label>
              <IconSelector v-model="form.icon" />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="!isFormValid">Speichern</button>
              <button type="button" class="btn btn-secondary" @click="cancelEdit">Abbrechen</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DesktopWindow>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DesktopWindow from '@/components/DesktopWindow.vue'
import IconSelector from '@/components/IconSelector.vue'

// State
const activeView = ref('overview')
const ports = ref([])
const editingPort = ref(null)

const form = ref({
  name: '',
  httpPort: '',
  httpsPort: '',
  icon: '/icons/default-app.svg'
})

// Navigation
const navigationItems = [
  { key: 'overview', label: 'Übersicht/Status' },
  { key: 'list', label: 'Port Liste' },
  { key: 'add', label: 'Port hinzufügen' }
]

// Computed
const isFormValid = computed(() => {
  return form.value.name &&
         isValidPort(form.value.httpPort) &&
         (!form.value.httpsPort || isValidPort(form.value.httpsPort))
})

// Methods
const isValidPort = (port) => {
  if (!port || port < 5000 || port > 5999) return false
  const existing = ports.value.find(p =>
    (editingPort.value ? p.httpPort !== editingPort.value.httpPort : true) &&
    (p.httpPort === port || p.httpsPort === port)
  )
  return !existing
}

const loadPorts = () => {
  const stored = localStorage.getItem('portDocumentation')
  if (stored) {
    ports.value = JSON.parse(stored)
  }
}

const savePorts = () => {
  localStorage.setItem('portDocumentation', JSON.stringify(ports.value))
}

const savePort = () => {
  if (!isFormValid.value) return

  if (editingPort.value) {
    // Edit
    const index = ports.value.findIndex(p => p.httpPort === editingPort.value.httpPort)
    ports.value[index] = { ...form.value }
  } else {
    // Add
    ports.value.push({ ...form.value })
  }

  savePorts()
  resetForm()
  activeView.value = 'list'
}

const editPort = (port) => {
  editingPort.value = port
  form.value = { ...port }
  activeView.value = 'add'
}

const deletePort = (port) => {
  if (confirm(`Port ${port.httpPort} wirklich löschen?`)) {
    ports.value = ports.value.filter(p => p.httpPort !== port.httpPort)
    savePorts()
  }
}

const cancelEdit = () => {
  editingPort.value = null
  resetForm()
  activeView.value = 'list'
}

const resetForm = () => {
  form.value = {
    name: '',
    httpPort: '',
    httpsPort: '',
    icon: '/icons/default-app.svg'
  }
}

// App control methods
const closeApp = () => {
  // Emit close to parent
}

const minimizeApp = () => {
  // Handled by DesktopWindow
}

const maximizeApp = () => {
  // Handled by DesktopWindow
}

// Lifecycle
onMounted(() => {
  loadPorts()
})
</script>

<style scoped>
.port-doc-app {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 200px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  padding: 1rem 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-color);
  color: white;
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.view-content h2 {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
}

.ports-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.ports-table th,
.ports-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.ports-table th {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.port-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.btn:hover {
  background: var(--bg-hover);
}

.btn-edit {
  margin-right: 0.5rem;
}

.btn-delete {
  background: #ff5f57;
  color: white;
  border-color: #ff5f57;
}

.btn-delete:hover {
  background: #ff3b30;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.btn-primary:hover {
  background: var(--accent-color-dark, var(--accent-color));
}

.btn-secondary {
  background: var(--bg-secondary);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  padding: 2rem;
}

.port-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.form-group input.invalid {
  border-color: #ff5f57;
}

.error {
  color: #ff5f57;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
}

/* Dark theme adjustments */
.dark .sidebar {
  background: var(--bg-tertiary);
}

.dark .stat-card {
  background: var(--bg-secondary);
}

.dark .ports-table {
  background: var(--bg-secondary);
}

.dark .ports-table th {
  background: var(--bg-tertiary);
}

.dark .btn {
  background: var(--bg-secondary);
  border-color: var(--border-color-dark);
}

.dark .btn-primary {
  background: var(--accent-color);
}

.dark .btn-delete {
  background: #ff5f57;
}

.dark .form-group input {
  background: var(--bg-secondary);
  border-color: var(--border-color-dark);
}
</style>