<template>
  <div v-if="hasOpenWindows" class="taskbar">
    <div class="taskbar-container">
      <div
        v-for="window in openWindows"
        :key="window.id"
        class="taskbar-item"
        :class="{ 
          active: isActive(window.id),
          minimized: window.isMinimized 
        }"
        @click="handleWindowClick(window.id)"
        :title="window.isMinimized ? `${window.title} wiederherstellen` : window.title"
      >
        <div class="taskbar-item-content">
          <span class="taskbar-icon">{{ window.icon }}</span>
          <span class="taskbar-title">{{ window.title }}</span>
        </div>
        <div v-if="isActive(window.id)" class="active-indicator"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWindowManagerStore } from '../stores/windowManager'

const windowManager = useWindowManagerStore()

// Computed
const openWindows = computed(() => windowManager.openWindows)
const hasOpenWindows = computed(() => openWindows.value.length > 0)

// Methods
const isActive = (windowId) => {
  return windowManager.isWindowActive(windowId)
}

const handleWindowClick = (windowId) => {
  const window = windowManager.getWindow(windowId)
  
  if (window.isMinimized) {
    // Restore minimized window
    windowManager.restoreWindow(windowId)
  } else if (isActive(windowId)) {
    // If already active, minimize it
    windowManager.minimizeWindow(windowId)
  } else {
    // Bring to front
    windowManager.setActiveWindow(windowId)
  }
}
</script>

<style scoped>
.taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 998;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
}

.taskbar-container {
  display: flex;
  gap: 4px;
  padding: 0 12px;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.taskbar-container::-webkit-scrollbar {
  height: 4px;
}

.taskbar-container::-webkit-scrollbar-track {
  background: transparent;
}

.taskbar-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.taskbar-item {
  position: relative;
  min-width: 140px;
  max-width: 200px;
  height: 36px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border: 1px solid transparent;
}

.taskbar-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.taskbar-item.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.taskbar-item.minimized {
  opacity: 0.7;
}

.taskbar-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  width: 100%;
}

.taskbar-icon {
  font-size: 18px;
  flex-shrink: 0;
  line-height: 1;
}

.taskbar-title {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-indicator {
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: linear-gradient(90deg, #e95420, #ff6b35);
  border-radius: 2px 2px 0 0;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 24px;
    opacity: 1;
  }
}

/* Light theme */
:global(.light) .taskbar {
  background: rgba(245, 245, 245, 0.95);
  border-top-color: rgba(0, 0, 0, 0.1);
}

:global(.light) .taskbar-item {
  background: rgba(0, 0, 0, 0.05);
}

:global(.light) .taskbar-item:hover {
  background: rgba(0, 0, 0, 0.1);
}

:global(.light) .taskbar-item.active {
  background: rgba(0, 0, 0, 0.15);
  border-color: rgba(0, 0, 0, 0.2);
}

:global(.light) .taskbar-title {
  color: rgba(0, 0, 0, 0.9);
}

/* Responsive */
@media (max-width: 768px) {
  .taskbar {
    height: 56px;
  }
  
  .taskbar-item {
    min-width: 60px;
    max-width: 80px;
    padding: 0 8px;
  }
  
  .taskbar-title {
    display: none;
  }
  
  .taskbar-icon {
    font-size: 24px;
  }
}
</style>