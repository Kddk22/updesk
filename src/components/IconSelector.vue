<template>
  <div class="icon-selector">
    <h3>Icon auswählen</h3>
    
    <!-- Category Tabs -->
    <div class="category-tabs">
      <button
        v-for="category in categories"
        :key="category.key"
        class="category-tab"
        :class="{ active: activeCategory === category.key }"
        @click="activeCategory = category.key"
      >
        {{ category.name }}
      </button>
    </div>
    
    <div class="icon-grid">
      <div
        v-for="icon in filteredIcons"
        :key="icon.name"
        class="icon-item"
        :class="{ selected: selectedIcon === icon.path }"
        @click="selectIcon(icon.path)"
      >
        <img :src="icon.path" :alt="icon.name" class="icon-preview" />
        <span class="icon-name">{{ icon.name }}</span>
      </div>
    </div>
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
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const customIconUrl = ref('')
const activeCategory = ref('all')

const selectedIcon = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const categories = ref([
  { key: 'all', name: 'Alle' },
  { key: 'system', name: 'System' },
  { key: 'selfhosting', name: 'Self-Hosting' },
  { key: 'storage', name: 'Storage' },
  { key: 'monitoring', name: 'Monitoring' },
  { key: 'security', name: 'Security' }
])

const availableIcons = ref([
  // System Icons
  { name: 'Dateien', path: '/icons/files.svg', category: 'system' },
  { name: 'Standard App', path: '/icons/default-app.svg', category: 'system' },
  
  // Self-Hosting & Server Icons
  { name: 'Docker', path: '/icons/docker.svg', category: 'selfhosting' },
  { name: 'Portainer', path: '/icons/portainer.svg', category: 'selfhosting' },
  { name: 'Proxmox', path: '/icons/proxmox.svg', category: 'selfhosting' },
  { name: 'Home Assistant', path: '/icons/homeassistant.svg', category: 'selfhosting' },
  { name: 'Nginx', path: '/icons/nginx.svg', category: 'selfhosting' },
  
  // Storage
  { name: 'TrueNAS', path: '/icons/truenas.svg', category: 'storage' },
  { name: 'Nextcloud', path: '/icons/nextcloud.svg', category: 'storage' },
  { name: 'Synology', path: '/icons/synology.svg', category: 'storage' },
  { name: 'Unraid', path: '/icons/unraid.svg', category: 'storage' },
  
  // Media & Entertainment
  { name: 'Plex', path: '/icons/plex.svg', category: 'selfhosting' },
  { name: 'Jellyfin', path: '/icons/jellyfin.svg', category: 'selfhosting' },
  
  // Monitoring
  { name: 'Grafana', path: '/icons/grafana.svg', category: 'monitoring' },
  { name: 'Prometheus', path: '/icons/prometheus.svg', category: 'monitoring' },
  
  // Security & Network
  { name: 'Pi-hole', path: '/icons/pihole.svg', category: 'security' },
  { name: 'Bitwarden', path: '/icons/bitwarden.svg', category: 'security' },
])

const filteredIcons = computed(() => {
  if (activeCategory.value === 'all') {
    return availableIcons.value
  }
  return availableIcons.value.filter(icon => icon.category === activeCategory.value)
})

const selectIcon = (iconPath) => {
  selectedIcon.value = iconPath
}
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

.category-tabs {
  display: flex;
  margin-bottom: 1rem;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.category-tab {
  flex: 1;
  padding: 6px 8px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-tab:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.category-tab.active {
  background: var(--accent-color);
  color: white;
}

.category-tab:not(:last-child) {
  border-right: 1px solid var(--border-color);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  max-height: 300px;
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
}

.icon-name {
  font-size: 0.7rem;
  text-align: center;
  color: var(--text-secondary);
  line-height: 1.2;
}

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
}

.custom-icon-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px var(--accent-color-light);
}

/* Dark theme adjustments */
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

.dark .custom-icon-input:focus {
  border-color: var(--accent-color);
}
</style>