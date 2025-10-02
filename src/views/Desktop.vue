<template>
  <div class="desktop" :style="{ backgroundImage: `url(${wallpaper})` }">
    <!-- Top Bar -->
    <TopBar />
    
    <!-- Desktop Grid -->
    <div class="desktop-content">
      <div 
        class="desktop-grid" 
        ref="desktopGrid"
        :style="desktopGridStyle"
      >
        <ProgramIcon
          v-for="program in programs"
          :key="program.id"
          :program="program"
          @click="openProgram"
          @edit="editProgram"
          @delete="deleteProgram"
          @position-change="updateProgramPosition"
        />
      </div>
    </div>
    
    <!-- Dock -->
    <Dock v-if="showDock" />
    
    <!-- Modals -->
    <ProgramModal
      v-if="showProgramModal"
      :program="selectedProgram"
      @save="saveProgram"
      @close="closeProgramModal"
    />
    
    <!-- Context Menu -->
    <ContextMenu
      v-if="showContextMenu"
      :x="contextMenuX"
      :y="contextMenuY"
      @add-program="showAddProgramModal"
      @settings="showSettingsModal"
      @close="closeContextMenu"
    />
    
    <!-- Settings Modal -->
    <SettingsModal
      v-if="showSettings"
      @close="closeSettingsModal"
    />
    
    <!-- Desktop Windows -->
    <component
      v-for="window in openWindows"
      :key="window.id"
      :is="window.component"
      @close="closeWindow(window.id)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProgramsStore } from '../stores/programs'
import { useSettingsStore } from '../stores/settings'
import TopBar from '../components/TopBar.vue'
import Dock from '../components/Dock.vue'
import ProgramIcon from '../components/ProgramIcon.vue'
import ProgramModal from '../components/ProgramModal.vue'
import ContextMenu from '../components/ContextMenu.vue'
import SettingsModal from '../components/SettingsModal.vue'
import FlowUp from './apps/FlowUp.vue'
import PortDocumentation from './apps/PortDocumentation.vue'

const router = useRouter()
const programsStore = useProgramsStore()
const settingsStore = useSettingsStore()

// Reactive data
const desktopGrid = ref(null)
const showProgramModal = ref(false)
const selectedProgram = ref(null)
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const showSettings = ref(false)
const openWindows = ref([])
let windowIdCounter = 0

// Computed properties
const programs = computed(() => programsStore.programs)
const wallpaper = computed(() => settingsStore.wallpaper)
const showDock = computed(() => settingsStore.showDock)
const tileSize = computed(() => settingsStore.tileSize)

const desktopGridStyle = computed(() => {
  const size = tileSize.value
  const gap = Math.max(15, Math.floor(size * 0.2)) // Gap proportional to tile size, minimum 15px
  return {
    gridTemplateColumns: `repeat(auto-fill, ${size}px)`,
    gridTemplateRows: `repeat(auto-fill, ${size}px)`,
    gap: `${gap}px`
  }
})

// Methods
const openProgram = (program) => {
  // Check if it's FlowUp app - open as window
  if (program.url === '/apps/upflow') {
    openWindow('FlowUp', FlowUp)
  } else if (program.url === '/apps/portdocumentation') {
    openWindow('PortDocumentation', PortDocumentation)
  } else if (program.url.startsWith('/apps/')) {
    // Navigate to other internal apps using Vue Router
    router.push(program.url)
  } else {
    // Open external URLs in new tab
    window.open(program.url, '_blank')
  }
}

const openWindow = (name, component) => {
  const windowId = ++windowIdCounter
  openWindows.value.push({
    id: windowId,
    name,
    component
  })
}

const closeWindow = (windowId) => {
  const index = openWindows.value.findIndex(w => w.id === windowId)
  if (index !== -1) {
    openWindows.value.splice(index, 1)
  }
}

const editProgram = (program) => {
  selectedProgram.value = { ...program }
  showProgramModal.value = true
}

const deleteProgram = async (program) => {
  if (confirm(`Möchten Sie "${program.name}" wirklich löschen?`)) {
    await programsStore.deleteProgram(program.id)
  }
}

const updateProgramPosition = async (program, newPosition) => {
  await programsStore.updateProgram(program.id, {
    ...program,
    position_x: newPosition.x,
    position_y: newPosition.y
  })
}

const saveProgram = async (programData) => {
  if (programData.id) {
    await programsStore.updateProgram(programData.id, programData)
  } else {
    await programsStore.createProgram(programData)
  }
  closeProgramModal()
}

const closeProgramModal = () => {
  showProgramModal.value = false
  selectedProgram.value = null
}

const showAddProgramModal = () => {
  selectedProgram.value = null
  showProgramModal.value = true
  closeContextMenu()
}

const showSettingsModal = () => {
  showSettings.value = true
  closeContextMenu()
}

const closeSettingsModal = () => {
  showSettings.value = false
}

const handleContextMenu = (event) => {
  event.preventDefault()
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  showContextMenu.value = true
}

const closeContextMenu = () => {
  showContextMenu.value = false
}

const handleClick = (event) => {
  if (showContextMenu.value) {
    closeContextMenu()
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    programsStore.loadPrograms(),
    settingsStore.loadSettings()
  ])
  document.addEventListener('contextmenu', handleContextMenu)
  document.addEventListener('click', handleClick)
})

onUnmounted(() => {
  document.removeEventListener('contextmenu', handleContextMenu)
  document.removeEventListener('click', handleClick)
})
</script>

<style scoped>
.desktop {
  height: 100vh;
  width: 100vw;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.desktop-content {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

.desktop-grid {
  display: grid;
  height: 100%;
  width: 100%;
  align-content: start;
  justify-content: start;
}

@media (max-width: 768px) {
  .desktop-content {
    padding: 15px;
  }
}
</style>