<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">
              <svg class="icon-update" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Update verfügbar
            </h2>
            <button class="close-button" @click="closeModal" :disabled="isUpdating">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="!isUpdating && !updateComplete" class="update-info">
              <div class="version-comparison">
                <div class="version-box current">
                  <span class="version-label">Aktuelle Version</span>
                  <span class="version-number">v{{ updateInfo.currentVersion }}</span>
                </div>
                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div class="version-box latest">
                  <span class="version-label">Neue Version</span>
                  <span class="version-number">v{{ updateInfo.latestVersion }}</span>
                </div>
              </div>

              <div v-if="updateInfo.releaseInfo" class="release-info">
                <h3 class="release-title">{{ updateInfo.releaseInfo.name }}</h3>
                <div class="release-date">
                  Veröffentlicht am {{ formatDate(updateInfo.releaseInfo.publishedAt) }}
                </div>
                <div class="release-notes" v-html="formatReleaseNotes(updateInfo.releaseInfo.body)"></div>
              </div>

              <div v-else class="release-info-placeholder">
                <p class="info-text">
                  <svg class="info-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
                  </svg>
                  Eine neue Version ist verfügbar. Klicken Sie auf "Jetzt aktualisieren", um die neueste Version zu installieren.
                </p>
              </div>

              <div class="warning-box">
                <svg class="warning-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
                </svg>
                <div class="warning-text">
                  <strong>Wichtig:</strong> Die Anwendung wird während des Updates neu gestartet. 
                  Bitte speichern Sie alle offenen Arbeiten.
                </div>
              </div>
            </div>

            <div v-if="isUpdating" class="updating-state">
              <div class="spinner"></div>
              <h3>Update wird installiert...</h3>
              <p>Bitte warten Sie, während das Update heruntergeladen und installiert wird.</p>
              <p class="update-note">Die Anwendung wird automatisch neu gestartet.</p>
            </div>

            <div v-if="updateComplete" class="update-complete">
              <svg class="success-icon" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
              </svg>
              <h3>Update erfolgreich!</h3>
              <p>Die Anwendung wird in wenigen Sekunden neu geladen...</p>
            </div>

            <div v-if="updateError" class="error-state">
              <svg class="error-icon" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
              </svg>
              <h3>Update fehlgeschlagen</h3>
              <p>{{ updateError }}</p>
              <p class="error-note">Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.</p>
            </div>
          </div>

          <div class="modal-footer" v-if="!isUpdating && !updateComplete">
            <button class="btn btn-secondary" @click="closeModal">
              Später
            </button>
            <button class="btn btn-primary" @click="startUpdate">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Jetzt aktualisieren
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  updateInfo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'update'])

const isUpdating = ref(false)
const updateComplete = ref(false)
const updateError = ref(null)

const closeModal = () => {
  if (!isUpdating.value) {
    emit('close')
  }
}

const startUpdate = async () => {
  isUpdating.value = true
  updateError.value = null

  try {
    const response = await fetch('/api/updates/install', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Update fehlgeschlagen')
    }

    updateComplete.value = true
    
    // Reload page after 5 seconds
    setTimeout(() => {
      window.location.reload()
    }, 5000)

  } catch (error) {
    console.error('Update error:', error)
    updateError.value = error.message
    isUpdating.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatReleaseNotes = (markdown) => {
  if (!markdown) return ''
  
  // Simple markdown to HTML conversion
  return markdown
    .replace(/### (.*)/g, '<h4>$1</h4>')
    .replace(/## (.*)/g, '<h3>$1</h3>')
    .replace(/# (.*)/g, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n- (.*)/g, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n/g, '<br>')
}

// Handle modal state changes
watch(() => props.show, (newVal) => {
  if (newVal) {
    // Debug: Log updateInfo when modal is opened
    console.log('UpdateModal opened with data:', props.updateInfo)
  } else {
    // Reset state when modal is closed
    setTimeout(() => {
      isUpdating.value = false
      updateComplete.value = false
      updateError.value = null
    }, 300)
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-container {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.icon-update {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
}

.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.version-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 32px;
}

.version-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 24px;
  border-radius: 8px;
  min-width: 140px;
}

.version-box.current {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
}

.version-box.latest {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border: 2px solid var(--primary-color);
}

.version-label {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  opacity: 0.8;
}

.version-box.current .version-label {
  color: var(--text-secondary);
}

.version-box.latest .version-label {
  color: rgba(255, 255, 255, 0.9);
}

.version-number {
  font-size: 24px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.version-box.current .version-number {
  color: var(--text-primary);
}

.version-box.latest .version-number {
  color: white;
}

.arrow-icon {
  width: 32px;
  height: 32px;
  color: var(--primary-color);
  flex-shrink: 0;
}

.release-info {
  margin-bottom: 24px;
}

.release-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.release-date {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.release-notes {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid var(--primary-color);
  max-height: 200px;
  overflow-y: auto;
}

.release-notes :deep(h2),
.release-notes :deep(h3),
.release-notes :deep(h4) {
  margin: 12px 0 8px 0;
  color: var(--text-primary);
}

.release-notes :deep(ul) {
  margin: 8px 0;
  padding-left: 20px;
}

.release-notes :deep(li) {
  margin: 4px 0;
}

.release-info-placeholder {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border-left: 3px solid var(--primary-color);
}

.info-text {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
}

.info-icon {
  width: 20px;
  height: 20px;
  color: var(--primary-color);
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
  margin-top: 24px;
}

.warning-icon {
  width: 24px;
  height: 24px;
  color: #f59e0b;
  flex-shrink: 0;
}

.warning-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
}

.updating-state,
.update-complete,
.error-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--bg-tertiary);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-icon,
.error-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 24px;
}

.success-icon {
  color: #10b981;
}

.error-icon {
  color: #ef4444;
}

.updating-state h3,
.update-complete h3,
.error-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.updating-state p,
.update-complete p,
.error-state p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 8px 0;
}

.update-note,
.error-note {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 16px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--bg-quaternary);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

@media (max-width: 640px) {
  .version-comparison {
    flex-direction: column;
    gap: 12px;
  }

  .arrow-icon {
    transform: rotate(90deg);
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>