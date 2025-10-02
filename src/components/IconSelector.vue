<template>
  <div class="icon-selector">
    <h3>Icon auswählen</h3>
    
    <!-- Search Bar -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Icons durchsuchen..."
        class="search-input"
      />
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <span>Icons werden geladen...</span>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span>{{ error }}</span>
      <button @click="loadIcons" class="retry-button">Erneut versuchen</button>
    </div>
    
    <!-- Icon Grid -->
    <div v-else class="icon-grid">
      <div
        v-for="icon in filteredIcons"
        :key="icon.filename"
        class="icon-item"
        :class="{ selected: selectedIcon === icon.path }"
        @click="selectIcon(icon.path)"
      >
        <img :src="icon.path" :alt="icon.name" class="icon-preview" />
        <span class="icon-name">{{ icon.name }}</span>
      </div>
      
      <!-- No Results -->
      <div v-if="filteredIcons.length === 0" class="no-results">
        <span>Keine Icons gefunden</span>
      </div>
    </div>
    
    <!-- Custom Icon Section -->
    <div class="custom-icon-section">
      <h4>Oder eigene URL eingeben:</h4>
      <input
        v-model="customIconUrl"
        type="url"
        placeholder="https://example.com/icon.svg"
        class="custom-icon-input"
        @input="selectIcon(customIconUrl)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const customIconUrl = ref('')
const searchQuery = ref('')
const availableIcons = ref([])
const loading = ref(false)
const error = ref(null)

const selectedIcon = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const filteredIcons = computed(() => {
  if (!searchQuery.value) {
    return availableIcons.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return availableIcons.value.filter(icon => 
    icon.name.toLowerCase().includes(query) ||
    icon.filename.toLowerCase().includes(query)
  )
})

const loadIcons = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('/api/icons')
    
    if (!response.ok) {
      throw new Error('Fehler beim Laden der Icons')
    }
    
    const icons = await response.json()
    availableIcons.value = icons
  } catch (err) {
    console.error('Error loading icons:', err)
    error.value = 'Icons konnten nicht geladen werden'
  } finally {
    loading.value = false
  }
}

const selectIcon = (iconPath) => {
  selectedIcon.value = iconPath
}

onMounted(() => {
  loadIcons()
})
</script>

<style scoped>
.icon-selector {
  padding: 1rem;
}

.icon-selector h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.2rem;
}

/* Search Bar */
.search-bar {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px var(--accent-color-light);
}

.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

/* Loading and Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  min-height: 200px;
}

.error-state {
  color: #e74c3c;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: var(--accent-color-dark);
  transform: translateY(-1px);
}

/* Icon Grid */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  max-height: 350px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.icon-item:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
}

.icon-item.selected {
  border-color: var(--accent-color);
  background: var(--accent-color-light);
}

.icon-preview {
  width: 32px;
  height: 32px;
  margin-bottom: 0.25rem;
  border-radius: 4px;
  object-fit: contain;
}

.icon-name {
  font-size: 0.7rem;
  text-align: center;
  color: var(--text-secondary);
  line-height: 1.2;
  word-break: break-word;
}

/* No Results */
.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

/* Custom Icon Section */
.custom-icon-section {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.custom-icon-section h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.custom-icon-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.custom-icon-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px var(--accent-color-light);
}

/* Dark theme adjustments */
.dark .search-input {
  background: var(--bg-secondary);
  border-color: var(--border-color-dark);
}

.dark .icon-grid {
  background: var(--bg-tertiary);
}

.dark .icon-item:hover {
  background: var(--bg-hover);
}

.dark .custom-icon-input {
  background: var(--bg-secondary);
  border-color: var(--border-color-dark);
}

.dark .custom-icon-input:focus,
.dark .search-input:focus {
  border-color: var(--accent-color);
}
</style>