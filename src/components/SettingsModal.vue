<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Einstellungen</h2>
        <button class="close-button" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="settings-section">
          <h3>Erscheinungsbild</h3>
          
          <div class="setting-item">
            <label>Design</label>
            <div class="theme-selector">
              <button 
                :class="['theme-option', { active: theme === 'light' }]"
                @click="setTheme('light')"
              >
                <svg class="theme-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                </svg>
                Hell
              </button>
              <button 
                :class="['theme-option', { active: theme === 'dark' }]"
                @click="setTheme('dark')"
              >
                <svg class="theme-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd"/>
                </svg>
                Dunkel
              </button>
            </div>
          </div>
          
          <div class="setting-item">
            <label>Hintergrundbild</label>
            <div class="wallpaper-selector">
              <div 
                v-for="wallpaper in wallpapers"
                :key="wallpaper.path"
                :class="['wallpaper-option', { active: currentWallpaper === wallpaper.path }]"
                @click="setWallpaper(wallpaper.path)"
              >
                <img :src="wallpaper.thumbnail" :alt="wallpaper.name" />
                <span>{{ wallpaper.name }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Desktop</h3>
          
          <div class="setting-item">
            <label>Kachelgröße</label>
            <div class="tile-size-selector">
              <input 
                type="range" 
                min="60" 
                max="150" 
                step="10" 
                :value="tileSize" 
                @input="setTileSize($event.target.value)"
                class="tile-size-slider"
              />
              <div class="tile-size-display">{{ tileSize }}px</div>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Dock</h3>
          
          <div class="setting-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                :checked="showDock" 
                @change="toggleDock"
              />
              <span class="checkbox-custom"></span>
              Dock anzeigen
            </label>
          </div>
          
          <div class="setting-item" v-if="showDock">
            <label>Dock-Position</label>
            <div class="position-selector">
              <button 
                :class="['position-option', { active: dockPosition === 'left' }]"
                @click="setDockPosition('left')"
              >
                Links
              </button>
              <button 
                :class="['position-option', { active: dockPosition === 'right' }]"
                @click="setDockPosition('right')"
              >
                Rechts
              </button>
              <button 
                :class="['position-option', { active: dockPosition === 'bottom' }]"
                @click="setDockPosition('bottom')"
              >
                Unten
              </button>
            </div>
          </div>
          
          <div class="setting-item" v-if="showDock">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                :checked="autoHideDock" 
                @change="toggleAutoHideDock"
              />
              <span class="checkbox-custom"></span>
              Dock automatisch ausblenden
            </label>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Erweitert</h3>
          
          <div class="setting-item">
            <button @click="resetSettings" class="button button-danger">
              Einstellungen zurücksetzen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()

const emit = defineEmits(['close'])

const theme = computed(() => settingsStore.theme)
const currentWallpaper = computed(() => settingsStore.wallpaper)
const showDock = computed(() => settingsStore.showDock)
const dockPosition = computed(() => settingsStore.dockPosition)
const autoHideDock = computed(() => settingsStore.autoHideDock)
const tileSize = computed(() => settingsStore.tileSize)

const wallpapers = [
  {
    name: 'UpDesk Standard',
    path: '/wallpapers/updesk.png',
    thumbnail: '/wallpapers/updesk.png'
  },
  {
    name: 'Ubuntu Standard',
    path: '/wallpapers/ubuntu_standard.png',
    thumbnail: '/wallpapers/ubuntu_standard.png'
  },
  {
    name: 'Ubuntu Pet',
    path: '/wallpapers/ubuntu_4.jpg',
    thumbnail: '/wallpapers/ubuntu_4.jpg'
  },
  {
    name: 'Ubuntu myle',
    path: '/wallpapers/ubuntu_3.jpg',
    thumbnail: '/wallpapers/ubuntu_3.jpg'
  },
  {
    name: 'Ubuntu Stone',
    path: '/wallpapers/ubuntu_2.jpg',
    thumbnail: '/wallpapers/ubuntu_2.jpg'
  },
  {
    name: 'Windows XP',
    path: '/wallpapers/windows_xp.jpg',
    thumbnail: '/wallpapers/windows_xp.jpg'
  },
  {
    name: 'Windows 12',
    path: '/wallpapers/windows.png',
    thumbnail: '/wallpapers/windows.png'
  }
]

const setTheme = (newTheme) => {
  settingsStore.updateSetting('theme', newTheme)
}

const setWallpaper = (wallpaperPath) => {
  settingsStore.setWallpaper(wallpaperPath)
}

const toggleDock = () => {
  settingsStore.toggleDock()
}

const setDockPosition = (position) => {
  settingsStore.setDockPosition(position)
}

const toggleAutoHideDock = () => {
  settingsStore.toggleAutoHideDock()
}

const setTileSize = (size) => {
  settingsStore.setTileSize(parseInt(size))
}

const resetSettings = async () => {
  if (confirm('Möchten Sie wirklich alle Einstellungen zurücksetzen?')) {
    await settingsStore.resetSettings()
  }
}

const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

.close-button {
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

.close-button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h3 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item > label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

.theme-selector {
  display: flex;
  gap: 8px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  background: var(--bg-tertiary);
}

.theme-option.active {
  border-color: var(--accent);
  background: rgba(255, 107, 53, 0.1);
  color: var(--accent);
}

.theme-icon {
  width: 16px;
  height: 16px;
}

.wallpaper-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.wallpaper-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.wallpaper-option:hover {
  border-color: var(--accent);
}

.wallpaper-option.active {
  border-color: var(--accent);
  background: rgba(255, 107, 53, 0.1);
}

.wallpaper-option img {
  width: 100%;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.wallpaper-option span {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 0 !important;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 3px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
  background: var(--accent);
  border-color: var(--accent);
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.position-selector {
  display: flex;
  gap: 8px;
}

.position-option {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.position-option:hover {
  background: var(--bg-tertiary);
}

.position-option.active {
  border-color: var(--accent);
  background: rgba(255, 107, 53, 0.1);
  color: var(--accent);
}

.tile-size-selector {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tile-size-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-tertiary);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.tile-size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tile-size-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tile-size-display {
  min-width: 50px;
  text-align: center;
  font-weight: 500;
  color: var(--text-primary);
  background: var(--bg-tertiary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-danger {
  background: #ef4444;
  color: white;
}

.button-danger:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .modal {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header,
  .modal-body {
    padding: 16px;
  }
  
  .wallpaper-selector {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .theme-selector,
  .position-selector {
    flex-wrap: wrap;
  }
}
</style>