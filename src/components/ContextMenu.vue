<template>
  <div 
    class="context-menu"
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
  >
    <button @click="addProgram" class="context-menu-item">
      <svg class="context-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
      Programm hinzufügen
    </button>
    
    <div class="context-menu-separator"></div>
    
    <button @click="openSettings" class="context-menu-item">
      <svg class="context-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5A3.5 3.5 0 0 1 15.5 12A3.5 3.5 0 0 1 12 15.5M19.43 12.98C19.47 12.66 19.5 12.34 19.5 12C19.5 11.66 19.47 11.34 19.43 11.02L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.22 8.95 2.27 9.22 2.46 9.37L4.57 11.02C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.66 4.57 12.98L2.46 14.63C2.27 14.78 2.22 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.94C7.96 18.34 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.98Z"/>
      </svg>
      Einstellungen
    </button>
    
    <button @click="refreshDesktop" class="context-menu-item">
      <svg class="context-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
      </svg>
      Desktop aktualisieren
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['add-program', 'settings', 'close'])

const addProgram = () => {
  emit('add-program')
}

const openSettings = () => {
  emit('settings')
}

const refreshDesktop = () => {
  window.location.reload()
}
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 2001;
  min-width: 180px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
}

.context-menu-item:hover {
  background: var(--bg-tertiary);
}

.context-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.context-menu-separator {
  height: 1px;
  background: var(--border-color);
  margin: 4px 0;
}
</style>