<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? 'Programm bearbeiten' : 'Neues Programm hinzufügen' }}</h2>
        <button class="close-button" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="name">Name *</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            placeholder="z.B. Google Chrome"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="url">URL *</label>
          <input
            id="url"
            v-model="formData.url"
            type="url"
            required
            placeholder="https://example.com"
            class="form-input"
            :disabled="isIntegratedApp"
            :class="{ 'input-disabled': isIntegratedApp }"
          />
          <div v-if="isIntegratedApp" class="info-message">
            <svg viewBox="0 0 24 24" fill="currentColor" class="info-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span>Dies ist eine integrierte App. Die URL kann nicht geändert werden.</span>
          </div>
        </div>
        
        <div class="form-group">
          <label>Icon auswählen</label>
          <div class="icon-selection-tabs">
            <button
              type="button"
              class="tab-button"
              :class="{ active: iconSelectionMode === 'gallery' }"
              @click="iconSelectionMode = 'gallery'"
            >
              Icon-Galerie
            </button>
            <button
              type="button"
              class="tab-button"
              :class="{ active: iconSelectionMode === 'url' }"
              @click="iconSelectionMode = 'url'"
            >
              Eigene URL
            </button>
          </div>
          
          <div v-if="iconSelectionMode === 'gallery'" class="icon-gallery-container">
            <IconSelector v-model="formData.icon" />
          </div>
          
          <div v-else class="url-input-container">
            <input
              id="icon"
              v-model="formData.icon"
              type="url"
              placeholder="/icons/app-icon.svg"
              class="form-input"
            />
            <div class="icon-preview" v-if="formData.icon">
              <img 
                :src="formData.icon" 
                alt="Icon Preview"
                @error="handleIconError"
                class="preview-image"
              />
            </div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="position_x">Position X</label>
            <input
              id="position_x"
              v-model.number="formData.position_x"
              type="number"
              min="0"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="position_y">Position Y</label>
            <input
              id="position_y"
              v-model.number="formData.position_y"
              type="number"
              min="0"
              class="form-input"
            />
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="button button-secondary">
            Abbrechen
          </button>
          <button type="submit" class="button button-primary" :disabled="!isFormValid">
            {{ isEditing ? 'Aktualisieren' : 'Hinzufügen' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import IconSelector from './IconSelector.vue'

const props = defineProps({
  program: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'close'])

const iconSelectionMode = ref('gallery')

const formData = ref({
  name: '',
  url: '',
  icon: '/icons/default-app.svg',
  position_x: 0,
  position_y: 0
})

const isEditing = computed(() => !!props.program?.id)

const isIntegratedApp = computed(() => {
  return formData.value.url.startsWith('/apps/')
})

const isFormValid = computed(() => {
  return formData.value.name.trim() && formData.value.url.trim()
})

const handleSubmit = () => {
  if (!isFormValid.value) return
  
  const programData = {
    ...formData.value,
    name: formData.value.name.trim(),
    url: formData.value.url.trim(),
    icon: formData.value.icon.trim() || '/icons/default-app.svg'
  }
  
  if (isEditing.value) {
    programData.id = props.program.id
  }
  
  emit('save', programData)
}

const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const handleIconError = (event) => {
  event.target.src = '/icons/default-app.svg'
}

// Watch for program prop changes to populate form
watch(() => props.program, (newProgram) => {
  if (newProgram) {
    formData.value = {
      name: newProgram.name || '',
      url: newProgram.url || '',
      icon: newProgram.icon || '/icons/default-app.svg',
      position_x: newProgram.position_x || 0,
      position_y: newProgram.position_y || 0
    }
  } else {
    // Reset form for new program
    formData.value = {
      name: '',
      url: '',
      icon: '/icons/default-app.svg',
      position_x: 0,
      position_y: 0
    }
  }
}, { immediate: true })
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
  max-width: 500px;
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

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-input:disabled,
.input-disabled {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.7;
}

.info-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
  padding: 10px 12px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.4;
}

.info-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: rgba(255, 193, 7, 0.9);
  margin-top: 1px;
}

.icon-preview {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-image {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.button-secondary:hover:not(:disabled) {
  background: var(--bg-primary);
}

.button-primary {
  background: var(--accent);
  color: white;
}

.button-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.icon-selection-tabs {
  display: flex;
  margin-bottom: 1rem;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.tab-button {
  flex: 1;
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.tab-button:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.tab-button.active {
  background: var(--accent);
  color: white;
}

.tab-button:not(:last-child) {
  border-right: 1px solid var(--border-color);
}

.icon-gallery-container {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  max-height: 400px;
  overflow: hidden;
}

.url-input-container {
  /* Existing styles for URL input */
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
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .tab-button {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>