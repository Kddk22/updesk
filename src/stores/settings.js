import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../utils/api'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Computed getters for common settings
  const theme = computed(() => settings.value.theme || 'dark')
  const wallpaper = computed(() => settings.value.wallpaper || '/wallpapers/updesk.png')
  const dockPosition = computed(() => settings.value.dock_position || 'lright')
  const showDock = computed(() => settings.value.show_dock === 'false')
  const autoHideDock = computed(() => settings.value.auto_hide_dock === 'true')
  const tileSize = computed(() => parseInt(settings.value.tile_size) || 100)

  const loadSettings = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/settings')
      settings.value = response.data
    } catch (err) {
      error.value = 'Fehler beim Laden der Einstellungen'
      console.error('Error loading settings:', err)
    } finally {
      loading.value = false
    }
  }

  const updateSetting = async (key, value) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/settings/${key}`, { value })
      settings.value[key] = value
      return response.data
    } catch (err) {
      error.value = 'Fehler beim Aktualisieren der Einstellung'
      console.error('Error updating setting:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (newSettings) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.patch('/settings', newSettings)
      Object.assign(settings.value, newSettings)
      return response.data
    } catch (err) {
      error.value = 'Fehler beim Aktualisieren der Einstellungen'
      console.error('Error updating settings:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleTheme = async () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'dark'
    await updateSetting('theme', newTheme)
  }

  const setWallpaper = async (wallpaperPath) => {
    await updateSetting('wallpaper', wallpaperPath)
  }

  const setDockPosition = async (position) => {
    await updateSetting('dock_position', position)
  }

  const toggleDock = async () => {
    const newValue = showDock.value ? 'false' : 'true'
    await updateSetting('show_dock', newValue)
  }

  const toggleAutoHideDock = async () => {
    const newValue = autoHideDock.value ? 'false' : 'true'
    await updateSetting('auto_hide_dock', newValue)
  }

  const setTileSize = async (size) => {
    await updateSetting('tile_size', size.toString())
  }

  const getSetting = (key, defaultValue = null) => {
    return settings.value[key] || defaultValue
  }

  const resetSettings = async () => {
    const defaultSettings = {
      theme: 'dark',
      wallpaper: '/wallpapers/updesk.png',
      dock_position: 'left',
      show_dock: 'true',
      auto_hide_dock: 'false',
      tile_size: '100'
    }
    
    await updateSettings(defaultSettings)
  }

  return {
    settings,
    loading,
    error,
    theme,
    wallpaper,
    dockPosition,
    showDock,
    autoHideDock,
    tileSize,
    loadSettings,
    updateSetting,
    updateSettings,
    toggleTheme,
    setWallpaper,
    setDockPosition,
    toggleDock,
    toggleAutoHideDock,
    setTileSize,
    getSetting,
    resetSettings
  }
})