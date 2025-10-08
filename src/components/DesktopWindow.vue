<template>
  <div 
    class="desktop-window"
    :class="{ 
      maximized: windowData?.isMaximized,
      active: isActive,
      minimized: windowData?.isMinimized
    }"
    :style="windowStyle"
    ref="windowRef"
    @mousedown="bringToFront"
  >
    <!-- Window Header -->
    <div 
      class="window-header"
      @mousedown="startDrag"
      ref="headerRef"
    >
      <!-- Window Controls (macOS style - left side) -->
      <div class="window-controls">
        <button 
          class="control-btn close-btn"
          @click="closeWindow"
          title="Schließen"
        >
          <span class="control-icon">×</span>
        </button>
        <button 
          class="control-btn minimize-btn"
          @click="minimizeWindow"
          title="Minimieren"
        >
          <span class="control-icon">−</span>
        </button>
        <button 
          class="control-btn maximize-btn"
          @click="toggleMaximize"
          title="Maximieren"
        >
          <span class="control-icon">{{ windowData?.isMaximized ? '⧉' : '□' }}</span>
        </button>
      </div>
      
      <!-- Window Title -->
      <div class="window-title">
        {{ title }}
      </div>
      
      <!-- Empty space for balance -->
      <div class="window-spacer"></div>
    </div>
    
    <!-- Window Content -->
    <div class="window-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useWindowManagerStore } from '../stores/windowManager'

const props = defineProps({
  title: {
    type: String,
    default: 'Fenster'
  },
  icon: {
    type: String,
    default: '📱'
  },
  initialWidth: {
    type: Number,
    default: 800
  },
  initialHeight: {
    type: Number,
    default: 600
  },
  initialX: {
    type: Number,
    default: 100
  },
  initialY: {
    type: Number,
    default: 100
  },
  minWidth: {
    type: Number,
    default: 400
  },
  minHeight: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['close'])

// Window Manager Store
const windowManager = useWindowManagerStore()

// Window state
const windowRef = ref(null)
const headerRef = ref(null)
const windowId = ref(null)
const isDragging = ref(false)

// Local position and size for dragging
const localX = ref(props.initialX)
const localY = ref(props.initialY)
const localWidth = ref(props.initialWidth)
const localHeight = ref(props.initialHeight)

// Drag state
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartWindowX = ref(0)
const dragStartWindowY = ref(0)

// Computed
const windowData = computed(() => windowManager.getWindow(windowId.value))

const isActive = computed(() => windowManager.isWindowActive(windowId.value))

const windowStyle = computed(() => {
  if (windowData.value?.isMaximized) {
    return {
      position: 'fixed',
      top: '0px',
      left: '0px',
      width: '100vw',
      height: 'calc(100vh - 48px)', // Account for taskbar
      zIndex: isActive.value ? 1001 : 1000
    }
  }
  
  return {
    position: 'fixed',
    top: `${localY.value}px`,
    left: `${localX.value}px`,
    width: `${localWidth.value}px`,
    height: `${localHeight.value}px`,
    zIndex: windowId.value ? (isActive.value ? 1001 : 1000) : 1001
  }
})

// Window controls
const closeWindow = () => {
  windowManager.unregisterWindow(windowId.value)
  emit('close')
}

const minimizeWindow = () => {
  windowManager.minimizeWindow(windowId.value)
}

const toggleMaximize = () => {
  windowManager.maximizeWindow(windowId.value)
}

const bringToFront = () => {
  if (!isActive.value) {
    windowManager.setActiveWindow(windowId.value)
  }
}

// Drag functionality
const startDrag = (event) => {
  if (windowData.value?.isMaximized) return
  
  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragStartWindowX.value = localX.value
  dragStartWindowY.value = localY.value
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  
  // Prevent text selection
  event.preventDefault()
}

const onDrag = (event) => {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - dragStartX.value
  const deltaY = event.clientY - dragStartY.value
  
  localX.value = Math.max(0, dragStartWindowX.value + deltaX)
  localY.value = Math.max(0, dragStartWindowY.value + deltaY)
  
  // Keep window within viewport (account for taskbar)
  const maxX = window.innerWidth - localWidth.value
  const maxY = window.innerHeight - localHeight.value - 48 // 48px for taskbar
  
  localX.value = Math.min(localX.value, maxX)
  localY.value = Math.min(localY.value, maxY)
  
  // Update store
  windowManager.updateWindowPosition(windowId.value, {
    x: localX.value,
    y: localY.value
  })
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// Watch for window data changes from store
watch(() => windowData.value?.position, (newPos) => {
  if (newPos && !isDragging.value) {
    localX.value = newPos.x
    localY.value = newPos.y
  }
}, { deep: true })

watch(() => windowData.value?.size, (newSize) => {
  if (newSize) {
    localWidth.value = newSize.width
    localHeight.value = newSize.height
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  // Register window with the window manager
  windowId.value = windowManager.registerWindow({
    name: props.title,
    title: props.title,
    icon: props.icon,
    initialX: props.initialX,
    initialY: props.initialY,
    initialWidth: props.initialWidth,
    initialHeight: props.initialHeight
  })
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.desktop-window {
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.15),
    0 4px 10px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
}

.desktop-window.active {
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.2),
    0 5px 15px rgba(0, 0, 0, 0.15),
    0 0 0 2px rgba(233, 84, 32, 0.3);
}

.desktop-window.maximized {
  border-radius: 0;
  transition: all 0.2s ease;
}

.desktop-window.minimized {
  display: none;
}

.window-header {
  height: 40px;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 16px;
  cursor: move;
  user-select: none;
  position: relative;
}

.window-controls {
  display: flex;
  gap: 8px;
  z-index: 10;
}

.control-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: bold;
  transition: all 0.2s ease;
  position: relative;
}

.control-icon {
  opacity: 0;
  transition: opacity 0.2s ease;
  font-size: 10px;
  line-height: 1;
}

.control-btn:hover .control-icon {
  opacity: 1;
}

.close-btn {
  background: #ff5f57;
}

.close-btn:hover {
  background: #ff3b30;
}

.minimize-btn {
  background: #ffbd2e;
}

.minimize-btn:hover {
  background: #ff9500;
}

.maximize-btn {
  background: #28ca42;
}

.maximize-btn:hover {
  background: #30d158;
}

.window-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  pointer-events: none;
}

.window-spacer {
  width: 76px; /* Same width as controls for balance */
}

.window-content {
  height: calc(100% - 40px);
  overflow: auto;
  background: var(--bg-primary);
}

/* Dark theme adjustments */
.dark .desktop-window {
  background: var(--bg-primary);
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 4px 10px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.dark .desktop-window.active {
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.4),
    0 5px 15px rgba(0, 0, 0, 0.3),
    0 0 0 2px rgba(233, 84, 32, 0.5);
}

.dark .window-header {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border-bottom-color: var(--border-color-dark);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .desktop-window {
    width: 100vw !important;
    height: calc(100vh - 56px) !important;
    top: 0 !important;
    left: 0 !important;
    border-radius: 0;
  }
  
  .window-header {
    height: 44px;
  }
  
  .window-content {
    height: calc(100% - 44px);
  }
}
</style>