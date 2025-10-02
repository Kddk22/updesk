<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <div class="logo">
        <img src="/icons/updesk-logo.svg" alt="UpDesk" class="logo-icon" />
        <span class="logo-text">UpDesk</span>
      </div>
    </div>
    
    <div class="top-bar-center">
      <div class="clock">{{ currentTime }}</div>
    </div>
    
    <div class="top-bar-right">
      <!-- Update Status Indicator -->
      <div class="update-status-container">
        <!-- Loading State -->
        <button 
          v-if="updateCheckState === 'checking'"
          class="update-button checking"
          title="Prüfe auf Updates..."
        >
          <div class="loading-spinner"></div>
        </button>

        <!-- Up-to-date State (shows for 5 seconds) -->
        <button 
          v-if="updateCheckState === 'uptodate'"
          class="update-button uptodate"
          title="Version ist aktuell"
        >
          <svg class="icon check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>

        <!-- Update Available State -->
        <button 
          v-if="updateCheckState === 'available'"
          class="update-button available"
          @click="showUpdateModal"
          title="Update verfügbar"
        >
          <svg class="icon update-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="update-badge">1</span>
        </button>
      </div>

      <button 
        class="theme-toggle"
        @click="toggleTheme"
        :title="isDarkMode ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'"
      >
        <svg v-if="isDarkMode" class="icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
        </svg>
        <svg v-else class="icon" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd"/>
        </svg>
      </button>
      
      <div class="system-info">
        <span class="time">{{ currentDate }}</span>
      </div>
    </div>
  </div>

  <!-- Update Modal -->
  <UpdateModal 
    :show="isUpdateModalVisible"
    :updateInfo="updateInfo"
    @close="isUpdateModalVisible = false"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '../stores/settings'
import UpdateModal from './UpdateModal.vue'

const settingsStore = useSettingsStore()

const currentTime = ref('')
const currentDate = ref('')
const updateCheckState = ref('checking') // 'checking', 'uptodate', 'available', 'hidden'
const updateInfo = ref({
  currentVersion: '0.0.0',
  latestVersion: '0.0.0',
  releaseInfo: null
})
const isUpdateModalVisible = ref(false)

const isDarkMode = computed(() => settingsStore.theme === 'dark')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  })
}

const toggleTheme = () => {
  settingsStore.toggleTheme()
}

const showUpdateModal = () => {
  isUpdateModalVisible.value = true
}

const checkForUpdates = async () => {
  try {
    updateCheckState.value = 'checking'
    
    const response = await fetch('/api/updates/check')
    const data = await response.json()
    
    if (!response.ok) {
      console.error('Update check failed:', data)
      updateCheckState.value = 'hidden'
      return
    }
    
    updateInfo.value = data
    
    if (data.updateAvailable) {
      // Update available - show update icon permanently
      updateCheckState.value = 'available'
    } else {
      // Up to date - show checkmark for 5 seconds
      updateCheckState.value = 'uptodate'
      setTimeout(() => {
        updateCheckState.value = 'hidden'
      }, 5000)
    }
  } catch (error) {
    console.error('Error checking for updates:', error)
    updateCheckState.value = 'hidden'
  }
}

let timeInterval

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // Check for updates on mount
  checkForUpdates()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.top-bar {
  height: 32px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 3px var(--shadow);
  position: relative;
  z-index: 1000;
}

.top-bar-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 20px;
  height: 20px;
}

.logo-text {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.top-bar-center {
  display: flex;
  align-items: center;
}

.clock {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.icon {
  width: 16px;
  height: 16px;
}

.system-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time {
  font-size: 12px;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.update-status-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
}

.update-button {
  position: relative;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
}

.update-button.checking {
  cursor: default;
}

.update-button.uptodate {
  cursor: default;
  color: #10b981;
  animation: fadeIn 0.3s ease;
}

.update-button.available:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--bg-tertiary);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { 
    transform: rotate(360deg); 
  }
}

.check-icon {
  color: #10b981;
  stroke-width: 3;
  animation: checkmark 0.5s ease;
}

@keyframes checkmark {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.update-icon {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.update-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 10px;
  min-width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

@media (max-width: 768px) {
  .top-bar {
    padding: 0 12px;
  }
  
  .logo-text {
    display: none;
  }
  
  .system-info {
    display: none;
  }
}
</style>