<template>
  <div 
    class="program-icon"
    :class="{ 'dragging': isDragging }"
    @click="handleClick"
    @contextmenu="handleContextMenu"
    @mousedown="startDrag"
    :style="{ 
      gridColumn: program.position_x + 1,
      gridRow: program.position_y + 1,
      ...iconStyle
    }"
  >
    <div class="icon-container">
      <img 
        :src="program.icon" 
        :alt="program.name"
        class="icon-image"
        @error="handleImageError"
      />
    </div>
    <div class="icon-label">{{ program.name }}</div>
    
    <!-- Context Menu -->
    <div 
      v-if="showContextMenu"
      class="context-menu"
      :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
      @click.stop
    >
      <button @click="openProgram" class="context-menu-item">
        <svg class="context-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6V8H5V19H16V14H18V20A1 1 0 0 1 17 21H4A1 1 0 0 1 3 20V7A1 1 0 0 1 4 6H10ZM21 3V11H19V6.413L11.207 14.207L9.793 12.793L17.585 5H13V3H21Z"/>
        </svg>
        Öffnen
      </button>
      <button @click="editProgram" class="context-menu-item">
        <svg class="context-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z"/>
        </svg>
        Bearbeiten
      </button>
      <button @click="deleteProgram" class="context-menu-item danger">
        <svg class="context-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11V17H11V11H9ZM13 11V17H15V11H13ZM9 4V6H15V4H9Z"/>
        </svg>
        Löschen
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '../stores/settings'

const props = defineProps({
  program: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'edit', 'delete', 'position-change'])

const settingsStore = useSettingsStore()
const tileSize = computed(() => settingsStore.tileSize)

const iconStyle = computed(() => {
  const size = tileSize.value
  const iconSize = Math.max(32, Math.floor(size * 0.5)) // Icon size proportional to tile size, minimum 32px
  const fontSize = Math.max(10, Math.floor(size * 0.12)) // Font size proportional to tile size, minimum 10px
  
  return {
    '--icon-size': `${iconSize}px`,
    '--font-size': `${fontSize}px`
  }
})

const isDragging = ref(false)
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartTime = ref(0)

const handleClick = (event) => {
  event.stopPropagation()
  
  // Only emit click if it wasn't a drag operation
  const timeDiff = Date.now() - dragStartTime.value
  if (timeDiff < 200 && !isDragging.value) {
    emit('click', props.program)
  }
  
  closeContextMenu()
}

const handleContextMenu = (event) => {
  event.preventDefault()
  event.stopPropagation()
  
  const rect = event.currentTarget.getBoundingClientRect()
  contextMenuX.value = event.clientX - rect.left
  contextMenuY.value = event.clientY - rect.top
  showContextMenu.value = true
}

const closeContextMenu = () => {
  showContextMenu.value = false
}

const openProgram = () => {
  emit('click', props.program)
  closeContextMenu()
}

const editProgram = () => {
  emit('edit', props.program)
  closeContextMenu()
}

const deleteProgram = () => {
  emit('delete', props.program)
  closeContextMenu()
}

const handleImageError = (event) => {
  event.target.src = '/icons/default-app.svg'
}

const startDrag = (event) => {
  if (event.button !== 0) return // Only left mouse button
  
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragStartTime.value = Date.now()
  isDragging.value = false
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', endDrag)
}

const handleDrag = (event) => {
  const deltaX = Math.abs(event.clientX - dragStartX.value)
  const deltaY = Math.abs(event.clientY - dragStartY.value)
  
  if (deltaX > 5 || deltaY > 5) {
    isDragging.value = true
  }
}

const endDrag = (event) => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  
  if (isDragging.value) {
    // Calculate new grid position based on mouse position
    const desktopGrid = document.querySelector('.desktop-grid')
    if (desktopGrid) {
      const rect = desktopGrid.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // Calculate grid position based on current tile size and gap
      const gap = Math.max(15, Math.floor(tileSize.value * 0.2))
      const cellSize = tileSize.value + gap
      const newX = Math.max(0, Math.floor(x / cellSize))
      const newY = Math.max(0, Math.floor(y / cellSize))
      
      if (newX !== props.program.position_x || newY !== props.program.position_y) {
        emit('position-change', props.program, { x: newX, y: newY })
      }
    }
  }
  
  // Reset drag state after a short delay to prevent click event
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

const handleDocumentClick = (event) => {
  if (showContextMenu.value && !event.target.closest('.program-icon')) {
    closeContextMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
})
</script>

<style scoped>
.program-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
  background: transparent;
}

.program-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.program-icon.dragging {
  opacity: 0.7;
  transform: scale(1.05);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.icon-container {
  width: var(--icon-size, 48px);
  height: var(--icon-size, 48px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.icon-label {
  font-size: var(--font-size, 12px);
  color: white;
  text-align: center;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.context-menu {
  position: absolute;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px var(--shadow);
  z-index: 1001;
  min-width: 120px;
  overflow: hidden;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.context-menu-item:hover {
  background: var(--bg-tertiary);
}

.context-menu-item.danger {
  color: #ef4444;
}

.context-menu-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.context-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .program-icon {
    padding: 6px;
  }
  
  .icon-container {
    width: 40px;
    height: 40px;
  }
  
  .icon-label {
    font-size: 11px;
  }
}
</style>