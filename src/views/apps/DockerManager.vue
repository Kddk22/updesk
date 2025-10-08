<template>
  <DesktopWindow
    title="Docker Manager"
    icon="🐳"
    :initial-width="1200"
    :initial-height="700"
    :min-width="800"
    :min-height="500"
    @close="$emit('close')"
  >
    <div class="docker-manager">
      <!-- Sidebar Navigation -->
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="app-logo">
            <span class="logo-icon">🐳</span>
            <span class="logo-text">Docker Manager</span>
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
        
        <div class="sidebar-footer">
          <button 
            @click="refreshContainers" 
            class="btn-refresh"
            :disabled="loading"
          >
            <span :class="{ 'spinning': loading }">🔄</span>
            <span>Aktualisieren</span>
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Overview -->
        <div v-if="activeView === 'overview'" class="view-content">
          <div class="view-header">
            <h2>Übersicht</h2>
            <p>Docker Container Status und Verwaltung</p>
          </div>

          <!-- Loading state -->
          <div v-if="loading && containers.length === 0" class="loading">
            <div class="spinner"></div>
            <p>Lade Container...</p>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="error-message">
            <span>⚠️</span>
            <div>
              <strong>Fehler beim Laden der Container</strong>
              <p>{{ error }}</p>
            </div>
          </div>

          <!-- Stats Grid -->
          <div v-else class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📦</div>
              <div class="stat-info">
                <h3>Gesamt</h3>
                <p class="stat-value">{{ containers.length }}</p>
                <p class="stat-label">Container</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <h3>Laufend</h3>
                <p class="stat-value">{{ runningContainers }}</p>
                <p class="stat-label">Container</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">⏸️</div>
              <div class="stat-info">
                <h3>Gestoppt</h3>
                <p class="stat-value">{{ stoppedContainers }}</p>
                <p class="stat-label">Container</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Containers List -->
        <div v-if="activeView === 'containers'" class="view-content">
          <div class="view-header">
            <h2>Container</h2>
            <p>Alle Docker Container verwalten</p>
          </div>

          <!-- Loading state -->
          <div v-if="loading && containers.length === 0" class="loading">
            <div class="spinner"></div>
            <p>Lade Container...</p>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="error-message">
            <span>⚠️</span>
            <div>
              <strong>Fehler beim Laden der Container</strong>
              <p>{{ error }}</p>
            </div>
          </div>

          <!-- Container list -->
          <div v-else class="container-list">
        <div 
          v-for="container in containers" 
          :key="container.id"
          class="container-card"
          :class="{ 
            'running': container.state === 'running',
            'stopped': container.state !== 'running',
            'has-update': container.updateAvailable
          }"
        >
          <!-- Container Header -->
          <div class="container-header">
            <div class="container-info">
              <div class="container-name">
                <span class="status-dot" :class="container.state"></span>
                <h3>{{ container.name }}</h3>
                <span v-if="container.updateAvailable" class="update-badge" title="Update verfügbar">
                  🔄 Update
                </span>
              </div>
              <div class="container-image">
                <span class="label">Image:</span>
                {{ container.image }}
              </div>
            </div>
            <div class="container-actions">
              <button 
                v-if="container.state !== 'running'"
                @click="startContainer(container.id)"
                class="btn-action btn-start"
                title="Container starten"
              >
                ▶️
              </button>
              <button 
                v-if="container.state === 'running'"
                @click="stopContainer(container.id)"
                class="btn-action btn-stop"
                title="Container stoppen"
              >
                ⏹️
              </button>
              <button 
                @click="restartContainer(container.id)"
                class="btn-action btn-restart"
                title="Container neustarten"
              >
                🔄
              </button>
              <button 
                @click="toggleDetails(container.id)"
                class="btn-action btn-details"
                :class="{ 'active': expandedContainer === container.id }"
                title="Details anzeigen"
              >
                {{ expandedContainer === container.id ? '▲' : '▼' }}
              </button>
            </div>
          </div>

          <!-- Container Status -->
          <div class="container-status">
            <div class="status-item">
              <span class="status-label">Status:</span>
              <span class="status-value" :class="container.state">
                {{ container.status }}
              </span>
            </div>
            <div class="status-item" v-if="containerStats[container.id]">
              <span class="status-label">CPU:</span>
              <span class="status-value">
                {{ containerStats[container.id].cpu?.percent || '0' }}%
              </span>
            </div>
            <div class="status-item" v-if="containerStats[container.id]">
              <span class="status-label">RAM:</span>
              <span class="status-value">
                {{ containerStats[container.id].memory?.usageMB || '0' }} MB / 
                {{ containerStats[container.id].memory?.limitMB || '0' }} MB
              </span>
            </div>
          </div>

          <!-- Expanded Details -->
          <transition name="expand">
            <div v-if="expandedContainer === container.id" class="container-details">
              <!-- Tabs -->
              <div class="tabs">
                <button 
                  @click="activeTab = 'info'"
                  :class="{ 'active': activeTab === 'info' }"
                  class="tab"
                >
                  ℹ️ Info
                </button>
                <button 
                  @click="activeTab = 'ports'"
                  :class="{ 'active': activeTab === 'ports' }"
                  class="tab"
                >
                  🔌 Ports
                </button>
                <button 
                  @click="activeTab = 'logs'; loadLogs(container.id)"
                  :class="{ 'active': activeTab === 'logs' }"
                  class="tab"
                >
                  📋 Logs
                </button>
                <button 
                  @click="activeTab = 'env'"
                  :class="{ 'active': activeTab === 'env' }"
                  class="tab"
                >
                  🔧 Umgebung
                </button>
              </div>

              <!-- Tab Content -->
              <div class="tab-content">
                <!-- Info Tab -->
                <div v-if="activeTab === 'info'" class="info-tab">
                  <div class="info-row">
                    <span class="info-label">Container ID:</span>
                    <span class="info-value">{{ container.id.substring(0, 12) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Image ID:</span>
                    <span class="info-value">{{ container.imageId.split(':')[1]?.substring(0, 12) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Erstellt:</span>
                    <span class="info-value">{{ formatDate(container.created) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Neustarts:</span>
                    <span class="info-value">{{ container.restartCount }}</span>
                  </div>
                  <div class="info-row" v-if="container.networkSettings?.ipAddress">
                    <span class="info-label">IP-Adresse:</span>
                    <span class="info-value">{{ container.networkSettings.ipAddress }}</span>
                  </div>
                  <div v-if="container.updateAvailable" class="info-row update-info">
                    <span class="info-label">Update Status:</span>
                    <span class="info-value">
                      ⚠️ Neues Image verfügbar
                    </span>
                  </div>
                </div>

                <!-- Ports Tab -->
                <div v-if="activeTab === 'ports'" class="ports-tab">
                  <div v-if="container.ports && container.ports.length > 0">
                    <div 
                      v-for="(port, index) in container.ports" 
                      :key="index"
                      class="port-item"
                    >
                      <span class="port-private">{{ port.PrivatePort }}/{{ port.Type }}</span>
                      <span v-if="port.PublicPort" class="port-arrow">→</span>
                      <span v-if="port.PublicPort" class="port-public">
                        {{ port.IP || '0.0.0.0' }}:{{ port.PublicPort }}
                      </span>
                      <span v-else class="port-none">Nicht veröffentlicht</span>
                    </div>
                  </div>
                  <div v-else class="no-data">
                    Keine Port-Mappings konfiguriert
                  </div>
                </div>

                <!-- Logs Tab -->
                <div v-if="activeTab === 'logs'" class="logs-tab">
                  <div class="logs-header">
                    <button @click="loadLogs(container.id)" class="btn-refresh-logs">
                      🔄 Logs aktualisieren
                    </button>
                    <select v-model="logTail" @change="loadLogs(container.id)" class="log-tail-select">
                      <option value="50">Letzte 50 Zeilen</option>
                      <option value="100">Letzte 100 Zeilen</option>
                      <option value="200">Letzte 200 Zeilen</option>
                      <option value="500">Letzte 500 Zeilen</option>
                    </select>
                  </div>
                  <div v-if="loadingLogs" class="loading-logs">
                    Lade Logs...
                  </div>
                  <pre v-else-if="containerLogs[container.id]" class="logs-content">{{ containerLogs[container.id] }}</pre>
                  <div v-else class="no-data">
                    Keine Logs verfügbar
                  </div>
                </div>

                <!-- Environment Tab -->
                <div v-if="activeTab === 'env'" class="env-tab">
                  <div v-if="container.config?.env && container.config.env.length > 0">
                    <div 
                      v-for="(envVar, index) in container.config.env" 
                      :key="index"
                      class="env-item"
                    >
                      <span class="env-key">{{ envVar.split('=')[0] }}</span>
                      <span class="env-value">{{ envVar.split('=').slice(1).join('=') }}</span>
                    </div>
                  </div>
                  <div v-else class="no-data">
                    Keine Umgebungsvariablen konfiguriert
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
          </div>
        </div>
      </div>
    </div>
  </DesktopWindow>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DesktopWindow from '../../components/DesktopWindow.vue'
import axios from 'axios'

const emit = defineEmits(['close'])

// State
const activeView = ref('overview')
const containers = ref([])
const loading = ref(false)
const error = ref(null)
const expandedContainer = ref(null)
const activeTab = ref('info')
const containerLogs = ref({})
const containerStats = ref({})
const loadingLogs = ref(false)
const logTail = ref(100)

// Navigation
const navigationItems = [
  { key: 'overview', label: 'Übersicht', icon: '📊' },
  { key: 'containers', label: 'Container', icon: '📦' }
]

// Computed
const runningContainers = computed(() => {
  return containers.value.filter(c => c.state === 'running').length
})

const stoppedContainers = computed(() => {
  return containers.value.filter(c => c.state !== 'running').length
})

// Auto-refresh interval
let refreshInterval = null
let statsInterval = null

// API base URL
const API_BASE = '/api/docker'

// Methods
const refreshContainers = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get(`${API_BASE}/containers`)
    containers.value = response.data
    
    // Load stats for running containers
    loadStatsForRunningContainers()
  } catch (err) {
    console.error('Error loading containers:', err)
    error.value = err.response?.data?.message || err.message || 'Unbekannter Fehler'
  } finally {
    loading.value = false
  }
}

const loadStatsForRunningContainers = async () => {
  const runningContainers = containers.value.filter(c => c.state === 'running')
  
  for (const container of runningContainers) {
    try {
      const response = await axios.get(`${API_BASE}/containers/${container.id}/stats`)
      containerStats.value[container.id] = response.data
    } catch (err) {
      console.error(`Error loading stats for ${container.name}:`, err)
    }
  }
}

const startContainer = async (id) => {
  try {
    await axios.post(`${API_BASE}/containers/${id}/start`)
    await refreshContainers()
  } catch (err) {
    console.error('Error starting container:', err)
    alert('Fehler beim Starten des Containers: ' + (err.response?.data?.message || err.message))
  }
}

const stopContainer = async (id) => {
  try {
    await axios.post(`${API_BASE}/containers/${id}/stop`)
    await refreshContainers()
  } catch (err) {
    console.error('Error stopping container:', err)
    alert('Fehler beim Stoppen des Containers: ' + (err.response?.data?.message || err.message))
  }
}

const restartContainer = async (id) => {
  try {
    await axios.post(`${API_BASE}/containers/${id}/restart`)
    await refreshContainers()
  } catch (err) {
    console.error('Error restarting container:', err)
    alert('Fehler beim Neustarten des Containers: ' + (err.response?.data?.message || err.message))
  }
}

const toggleDetails = (id) => {
  if (expandedContainer.value === id) {
    expandedContainer.value = null
  } else {
    expandedContainer.value = id
    activeTab.value = 'info'
  }
}

const loadLogs = async (id) => {
  loadingLogs.value = true
  try {
    const response = await axios.get(`${API_BASE}/containers/${id}/logs?tail=${logTail.value}`)
    containerLogs.value[id] = response.data.logs
  } catch (err) {
    console.error('Error loading logs:', err)
    containerLogs.value[id] = 'Fehler beim Laden der Logs: ' + (err.response?.data?.message || err.message)
  } finally {
    loadingLogs.value = false
  }
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('de-DE')
}

// Lifecycle
onMounted(() => {
  refreshContainers()
  
  // Auto-refresh every 30 seconds
  refreshInterval = setInterval(refreshContainers, 30000)
  
  // Update stats every 5 seconds
  statsInterval = setInterval(loadStatsForRunningContainers, 5000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (statsInterval) clearInterval(statsInterval)
})
</script>

<style scoped>
.docker-manager {
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

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.btn-refresh {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: var(--accent-color-dark);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Main Content */
.main-content {
  flex: 1;
  overflow: auto;
}

.view-content {
  padding: 24px;
  max-width: 1200px;
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

.spinning {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
}

.error-message span {
  font-size: 24px;
}

.container-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.container-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.container-card.running {
  border-left: 4px solid #28ca42;
}

.container-card.stopped {
  border-left: 4px solid #888;
}

.container-card.has-update {
  border-left: 4px solid #ff9500;
}

.container-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg-primary);
}

.container-info {
  flex: 1;
}

.container-name {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.container-name h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #888;
}

.status-dot.running {
  background: #28ca42;
  box-shadow: 0 0 8px #28ca42;
}

.update-badge {
  padding: 2px 8px;
  background: #ff9500;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.container-image {
  font-size: 13px;
  color: var(--text-secondary);
}

.label {
  font-weight: 600;
  margin-right: 5px;
}

.container-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: var(--bg-primary);
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action:hover {
  transform: scale(1.1);
}

.btn-start:hover {
  background: #28ca42;
}

.btn-stop:hover {
  background: #ff5f57;
}

.btn-restart:hover {
  background: #ff9500;
}

.btn-details.active {
  background: var(--accent-color);
}

.container-status {
  display: flex;
  gap: 20px;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.status-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.status-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.status-value {
  color: var(--text-primary);
}

.status-value.running {
  color: #28ca42;
  font-weight: 600;
}

.container-details {
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.tabs {
  display: flex;
  gap: 5px;
  padding: 15px 20px 0;
  border-bottom: 1px solid var(--border-color);
}

.tab {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

.tab-content {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.info-tab {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.info-row.update-info {
  background: #fff3cd;
  color: #856404;
}

.info-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.info-value {
  color: var(--text-primary);
  font-family: monospace;
}

.ports-tab {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.port-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
}

.port-private {
  color: var(--accent-color);
  font-weight: 600;
}

.port-arrow {
  color: var(--text-secondary);
}

.port-public {
  color: #28ca42;
  font-weight: 600;
}

.port-none {
  color: var(--text-secondary);
  font-style: italic;
}

.logs-tab {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-refresh-logs {
  padding: 6px 12px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.log-tail-select {
  padding: 6px 12px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}

.logs-content {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.loading-logs {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
}

.env-tab {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.env-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
}

.env-key {
  color: var(--accent-color);
  font-weight: 600;
  min-width: 200px;
}

.env-value {
  color: var(--text-primary);
  word-break: break-all;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-style: italic;
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Scrollbar styling */
.container-list::-webkit-scrollbar,
.tab-content::-webkit-scrollbar,
.logs-content::-webkit-scrollbar {
  width: 8px;
}

.container-list::-webkit-scrollbar-track,
.tab-content::-webkit-scrollbar-track,
.logs-content::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

.container-list::-webkit-scrollbar-thumb,
.tab-content::-webkit-scrollbar-thumb,
.logs-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.container-list::-webkit-scrollbar-thumb:hover,
.tab-content::-webkit-scrollbar-thumb:hover,
.logs-content::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .docker-manager {
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
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .container-actions {
    flex-wrap: wrap;
  }
}
</style>