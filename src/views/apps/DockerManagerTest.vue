<template>
  <DesktopWindow
    title="Docker Manager Test"
    icon="🐳"
    :initial-width="800"
    :initial-height="600"
    @close="$emit('close')"
  >
    <div style="padding: 20px; background: white; height: 100%;">
      <h1>Docker Manager Test</h1>
      <p>Wenn Sie das sehen, funktioniert die DesktopWindow-Komponente!</p>
    </div>
  </DesktopWindow>
</template>

<script setup>
import DesktopWindow from '../../components/DesktopWindow.vue'

const emit = defineEmits(['close'])
</script>