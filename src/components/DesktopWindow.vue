<template>
  <div 
    v-if="!isMinimized"
    class="desktop-window"
    :class="{ maximized: isMaximized }"
    :style="windowStyle"
    ref="windowRef"
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
          <span class="control-icon">{{ isMaximized ? '⧉' : '□' }}</span>
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
  
  <!-- Taskbar Entry when minimized -->
  <div 
    v-if="isMinimized"
    class="taskbar-entry"
    @click="restoreWindow"
    :title="`${title} wiederherstellen`"
  >
    <span class="taskbar-icon">📱</span>
    <span class="taskbar-title">{{ title }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Fenster'
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

const emit = defineEmits(['close', 'minimize', 'maximize'])

// Window state
const windowRef = ref(null)
const headerRef = ref(null)
const isMinimized = ref(false)
const isMaximized = ref(false)
const isDragging = ref(false)

// Window position and size
const windowX = ref(props.initialX)
const windowY = ref(props.initialY)
const windowWidth = ref(props.initialWidth)
const windowHeight = ref(props.initialHeight)

// Store original size for restore
const originalX = ref(props.initialX)
const originalY = ref(props.initialY)
const originalWidth = ref(props.initialWidth)
const originalHeight = ref(props.initialHeight)

// Drag state
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartWindowX = ref(0)
const dragStartWindowY = ref(0)

const windowStyle = computed(() => {
  if (isMaximized.value) {
    return {
      position: 'fixed',
      top: '0px',
      left: '0px',
      width: '100vw',
      height: '100vh',
      zIndex: 1000
    }
  }
  
  return {
    position: 'fixed',
    top: `${windowY.value}px`,
    left: `${windowX.value}px`,
    width: `${windowWidth.value}px`,
    height: `${windowHeight.value}px`,
    zIndex: 1000
  }
})

// Window controls
const closeWindow = () => {
  emit('close')
}

const minimizeWindow = () => {
  isMinimized.value = true
  emit('minimize')
}

const restoreWindow = () => {
  isMinimized.value = false
}

const toggleMaximize = () => {
  if (isMaximized.value) {
    // Restore
    isMaximized.value = false
    windowX.value = originalX.value
    windowY.value = originalY.value
    windowWidth.value = originalWidth.value
    windowHeight.value = originalHeight.value
  } else {
    // Store current position/size
    originalX.value = windowX.value
    originalY.value = windowY.value
    originalWidth.value = windowWidth.value
    originalHeight.value = windowHeight.value
    
    // Maximize
    isMaximized.value = true
  }
  emit('maximize', isMaximized.value)
}

// Drag functionality
const startDrag = (event) => {
  if (isMaximized.value) return
  
  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragStartWindowX.value = windowX.value
  dragStartWindowY.value = windowY.value
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  
  // Prevent text selection
  event.preventDefault()
}

const onDrag = (event) => {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - dragStartX.value
  const deltaY = event.clientY - dragStartY.value
  
  windowX.value = Math.max(0, dragStartWindowX.value + deltaX)
  windowY.value = Math.max(0, dragStartWindowY.value + deltaY)
  
  // Keep window within viewport
  const maxX = window.innerWidth - windowWidth.value
  const maxY = window.innerHeight - windowHeight.value
  
  windowX.value = Math.min(windowX.value, maxX)
  windowY.value = Math.min(windowY.value, maxY)
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

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

.desktop-window.maximized {
  border-radius: 0;
  transition: all 0.2s ease;
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

/* Taskbar Entry */
.taskbar-entry {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  z-index: 999;
}

.taskbar-entry:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
}

.taskbar-icon {
  font-size: 16px;
}

.taskbar-title {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 500;
}

/* Dark theme adjustments */
.dark .desktop-window {
  background: var(--bg-primary);
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 4px 10px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.dark .window-header {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border-bottom-color: var(--border-color-dark);
}

.dark .taskbar-entry {
  background: var(--bg-secondary);
  border-color: var(--border-color-dark);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .desktop-window {
    width: 100vw !important;
    height: 100vh !important;
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