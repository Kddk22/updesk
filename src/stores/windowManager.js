import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWindowManagerStore = defineStore('windowManager', () => {
  const windows = ref([])
  const activeWindowId = ref(null)
  let windowIdCounter = 0

  // Computed
  const openWindows = computed(() => windows.value)
  
  const minimizedWindows = computed(() => 
    windows.value.filter(w => w.isMinimized)
  )
  
  const visibleWindows = computed(() => 
    windows.value.filter(w => !w.isMinimized)
  )
  
  const activeWindow = computed(() => 
    windows.value.find(w => w.id === activeWindowId.value)
  )

  // Methods
  const registerWindow = (windowData) => {
    const windowId = ++windowIdCounter
    const newWindow = {
      id: windowId,
      name: windowData.name,
      title: windowData.title,
      icon: windowData.icon || '📱',
      component: windowData.component,
      isMinimized: false,
      isMaximized: false,
      position: {
        x: windowData.initialX || 100,
        y: windowData.initialY || 100
      },
      size: {
        width: windowData.initialWidth || 800,
        height: windowData.initialHeight || 600
      },
      savedPosition: null, // For restoring after maximize
      savedSize: null
    }
    
    windows.value.push(newWindow)
    activeWindowId.value = windowId
    
    return windowId
  }

  const unregisterWindow = (windowId) => {
    const index = windows.value.findIndex(w => w.id === windowId)
    if (index !== -1) {
      windows.value.splice(index, 1)
      
      // Set new active window if the closed one was active
      if (activeWindowId.value === windowId) {
        if (windows.value.length > 0) {
          // Set the last visible window as active
          const lastVisible = visibleWindows.value[visibleWindows.value.length - 1]
          activeWindowId.value = lastVisible ? lastVisible.id : null
        } else {
          activeWindowId.value = null
        }
      }
    }
  }

  const minimizeWindow = (windowId) => {
    const window = windows.value.find(w => w.id === windowId)
    if (window) {
      window.isMinimized = true
      
      // Set new active window if the minimized one was active
      if (activeWindowId.value === windowId) {
        const lastVisible = visibleWindows.value[visibleWindows.value.length - 1]
        activeWindowId.value = lastVisible ? lastVisible.id : null
      }
    }
  }

  const restoreWindow = (windowId) => {
    const window = windows.value.find(w => w.id === windowId)
    if (window) {
      window.isMinimized = false
      activeWindowId.value = windowId
    }
  }

  const maximizeWindow = (windowId) => {
    const window = windows.value.find(w => w.id === windowId)
    if (window) {
      if (!window.isMaximized) {
        // Save current position and size
        window.savedPosition = { ...window.position }
        window.savedSize = { ...window.size }
        window.isMaximized = true
      } else {
        // Restore previous position and size
        if (window.savedPosition && window.savedSize) {
          window.position = { ...window.savedPosition }
          window.size = { ...window.savedSize }
        }
        window.isMaximized = false
      }
    }
  }

  const setActiveWindow = (windowId) => {
    const window = windows.value.find(w => w.id === windowId)
    if (window && !window.isMinimized) {
      activeWindowId.value = windowId
    }
  }

  const updateWindowPosition = (windowId, position) => {
    const window = windows.value.find(w => w.id === windowId)
    if (window) {
      window.position = { ...position }
    }
  }

  const updateWindowSize = (windowId, size) => {
    const window = windows.value.find(w => w.id === windowId)
    if (window) {
      window.size = { ...size }
    }
  }

  const getWindow = (windowId) => {
    return windows.value.find(w => w.id === windowId)
  }

  const isWindowActive = (windowId) => {
    return activeWindowId.value === windowId
  }

  return {
    windows,
    activeWindowId,
    openWindows,
    minimizedWindows,
    visibleWindows,
    activeWindow,
    registerWindow,
    unregisterWindow,
    minimizeWindow,
    restoreWindow,
    maximizeWindow,
    setActiveWindow,
    updateWindowPosition,
    updateWindowSize,
    getWindow,
    isWindowActive
  }
})