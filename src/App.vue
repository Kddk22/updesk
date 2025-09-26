<template>
  <div id="app" :class="{ 'dark-theme': isDarkMode }">
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from './stores/settings'

const settingsStore = useSettingsStore()

const isDarkMode = computed(() => settingsStore.theme === 'dark')

// Initialize settings on app start
settingsStore.loadSettings()
</script>

<style>
#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  transition: all 0.3s ease;
}

.dark-theme {
  --bg-primary: #2c2c2c;
  --bg-secondary: #3c3c3c;
  --bg-tertiary: #4c4c4c;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --text-muted: #999999;
  --border-color: #555555;
  --shadow: rgba(0, 0, 0, 0.5);
  --accent: #ff6b35;
  --accent-hover: #ff8c69;
}

:root {
  --bg-primary: #f5f5f5;
  --bg-secondary: #ffffff;
  --bg-tertiary: #e9e9e9;
  --text-primary: #2c2c2c;
  --text-secondary: #666666;
  --text-muted: #999999;
  --border-color: #dddddd;
  --shadow: rgba(0, 0, 0, 0.1);
  --accent: #ff6b35;
  --accent-hover: #ff8c69;
}
</style>