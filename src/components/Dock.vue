<template>
  <div 
    class="dock"
    :class="[
      `dock-${position}`,
      { 'dock-auto-hide': autoHide && !isVisible }
    ]"
    @mouseenter="showDock"
    @mouseleave="hideDock"
  >
    <div class="dock-container">
      <div class="dock-items">
        <!-- Favorite Programs -->
        <div 
          v-for="program in favoritePrograms"
          :key="program.id"
          class="dock-item"
          @click="openProgram(program)"
          :title="program.name"
        >
          <img 
            :src="program.icon" 
            :alt="program.name"
            class="dock-icon"
            @error="handleImageError"
          />
          <div class="dock-tooltip">{{ program.name }}</div>
        </div>
        
        <!-- Separator -->
        <div class="dock-separator" v-if="favoritePrograms.length > 0"></div>
        
        <!-- System Items -->
        <div 
          class="dock-item"
          @click="showApplications"
          title="Anwendungen"
        >
          <svg class="dock-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4H10V10H4V4ZM14 4H20V10H14V4ZM4 14H10V20H4V14ZM14 14H20V20H14V14Z"/>
          </svg>
          <div class="dock-tooltip">Anwendungen</div>
        </div>
        
        <div 
          class="dock-item"
          @click="showSettings"
          title="Einstellungen"
        >
          <svg class="dock-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5A3.5 3.5 0 0 1 15.5 12A3.5 3.5 0 0 1 12 15.5M19.43 12.98C19.47 12.66 19.5 12.34 19.5 12C19.5 11.66 19.47 11.34 19.43 11.02L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.22 8.95 2.27 9.22 2.46 9.37L4.57 11.02C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.66 4.57 12.98L2.46 14.63C2.27 14.78 2.22 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.94C7.96 18.34 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.98Z"/>
          </svg>
          <div class="dock-tooltip">Einstellungen</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProgramsStore } from '../stores/programs'
import { useSettingsStore } from '../stores/settings'

const programsStore = useProgramsStore()
const settingsStore = useSettingsStore()

const emit = defineEmits(['show-applications', 'show-settings'])

const isVisible = ref(true)
const hoverTimeout = ref(null)

const position = computed(() => settingsStore.dockPosition)
const autoHide = computed(() => settingsStore.autoHideDock)

// Get first 6 programs as favorites
const favoritePrograms = computed(() => 
  programsStore.programs.slice(0, 6)
)

const openProgram = (program) => {
  window.open(program.url, '_blank')
}

const showApplications = () => {
  emit('show-applications')
}

const showSettings = () => {
  emit('show-settings')
}

const handleImageError = (event) => {
  event.target.src = '/icons/default-app.svg'
}

const showDock = () => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value)
    hoverTimeout.value = null
  }
  isVisible.value = true
}

const hideDock = () => {
  if (autoHide.value) {
    hoverTimeout.value = setTimeout(() => {
      isVisible.value = false
    }, 1000)
  }
}

onMounted(() => {
  if (autoHide.value) {
    setTimeout(() => {
      isVisible.value = false
    }, 3000)
  }
})
</script>

<style scoped>
.dock {
  position: fixed;
  z-index: 999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dock-left {
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.dock-right {
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.dock-bottom {
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
}

.dock-auto-hide.dock-left {
  transform: translateY(-50%) translateX(-90%);
}

.dock-auto-hide.dock-right {
  transform: translateY(-50%) translateX(90%);
}

.dock-auto-hide.dock-bottom {
  transform: translateX(-50%) translateY(90%);
}

.dock-container {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.dock-items {
  display: flex;
  gap: 4px;
}

.dock-left .dock-items,
.dock-right .dock-items {
  flex-direction: column;
}

.dock-bottom .dock-items {
  flex-direction: row;
}

.dock-item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
}

.dock-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.dock-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  color: white;
}

.dock-separator {
  width: 2px;
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
  margin: 8px 0;
  align-self: center;
}

.dock-bottom .dock-separator {
  width: 32px;
  height: 2px;
  margin: 0 8px;
}

.dock-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 1000;
}

.dock-left .dock-tooltip {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
}

.dock-right .dock-tooltip {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 8px;
}

.dock-bottom .dock-tooltip {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
}

.dock-item:hover .dock-tooltip {
  opacity: 1;
}

@media (max-width: 768px) {
  .dock {
    display: none;
  }
}
</style>