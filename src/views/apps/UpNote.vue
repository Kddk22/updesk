<template>
  <div class="upnote-app">
    <div class="app-header">
      <h1>UpNote - Notizen</h1>
      <p>Ihre persönliche Notiz-Anwendung</p>
    </div>
    
    <div class="app-content">
      <div class="toolbar">
        <button @click="createNewNote" class="btn btn-primary">
          📝 Neue Notiz
        </button>
        <button @click="saveCurrentNote" class="btn btn-success" :disabled="!hasUnsavedChanges">
          💾 Speichern
        </button>
        <button @click="deleteCurrentNote" class="btn btn-danger" :disabled="!currentNote.id">
          🗑️ Löschen
        </button>
      </div>
      
      <div class="notes-container">
        <div class="notes-sidebar">
          <h3>Notizen</h3>
          <div class="notes-list">
            <div 
              v-for="note in notes" 
              :key="note.id"
              @click="selectNote(note)"
              class="note-item"
              :class="{ 'active': currentNote.id === note.id }"
            >
              <div class="note-title">{{ note.title || 'Unbenannte Notiz' }}</div>
              <div class="note-date">{{ formatDate(note.updatedAt) }}</div>
              <div class="note-preview">{{ getPreview(note.content) }}</div>
            </div>
          </div>
          
          <div v-if="notes.length === 0" class="empty-state">
            <p>Noch keine Notizen vorhanden.</p>
            <p>Erstellen Sie Ihre erste Notiz!</p>
          </div>
        </div>
        
        <div class="note-editor">
          <div class="editor-header">
            <input 
              v-model="currentNote.title" 
              placeholder="Titel der Notiz..."
              class="title-input"
              @input="markAsChanged"
            />
          </div>
          
          <textarea 
            v-model="currentNote.content"
            placeholder="Schreiben Sie hier Ihre Notiz..."
            class="content-textarea"
            @input="markAsChanged"
          ></textarea>
          
          <div class="editor-footer">
            <span class="word-count">
              {{ getWordCount(currentNote.content) }} Wörter
            </span>
            <span v-if="hasUnsavedChanges" class="unsaved-indicator">
              • Ungespeicherte Änderungen
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UpNote',
  data() {
    return {
      notes: [],
      currentNote: {
        id: null,
        title: '',
        content: '',
        createdAt: null,
        updatedAt: null
      },
      hasUnsavedChanges: false,
      nextId: 1
    }
  },
  mounted() {
    this.loadNotes()
    if (this.notes.length === 0) {
      this.createNewNote()
    }
  },
  methods: {
    createNewNote() {
      if (this.hasUnsavedChanges) {
        if (!confirm('Sie haben ungespeicherte Änderungen. Möchten Sie trotzdem eine neue Notiz erstellen?')) {
          return
        }
      }
      
      const now = new Date().toISOString()
      this.currentNote = {
        id: null,
        title: '',
        content: '',
        createdAt: now,
        updatedAt: now
      }
      this.hasUnsavedChanges = false
    },
    
    selectNote(note) {
      if (this.hasUnsavedChanges) {
        if (!confirm('Sie haben ungespeicherte Änderungen. Möchten Sie trotzdem die Notiz wechseln?')) {
          return
        }
      }
      
      this.currentNote = { ...note }
      this.hasUnsavedChanges = false
    },
    
    saveCurrentNote() {
      if (!this.currentNote.title && !this.currentNote.content) {
        alert('Bitte geben Sie einen Titel oder Inhalt ein.')
        return
      }
      
      const now = new Date().toISOString()
      
      if (this.currentNote.id) {
        // Bestehende Notiz aktualisieren
        const index = this.notes.findIndex(note => note.id === this.currentNote.id)
        if (index !== -1) {
          this.notes[index] = {
            ...this.currentNote,
            updatedAt: now
          }
        }
      } else {
        // Neue Notiz erstellen
        this.currentNote.id = this.nextId++
        this.currentNote.updatedAt = now
        this.notes.unshift({ ...this.currentNote })
      }
      
      this.saveNotes()
      this.hasUnsavedChanges = false
    },
    
    deleteCurrentNote() {
      if (!this.currentNote.id) return
      
      if (confirm('Möchten Sie diese Notiz wirklich löschen?')) {
        this.notes = this.notes.filter(note => note.id !== this.currentNote.id)
        this.saveNotes()
        
        if (this.notes.length > 0) {
          this.selectNote(this.notes[0])
        } else {
          this.createNewNote()
        }
      }
    },
    
    markAsChanged() {
      this.hasUnsavedChanges = true
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    getPreview(content) {
      if (!content) return 'Keine Vorschau verfügbar'
      return content.substring(0, 100) + (content.length > 100 ? '...' : '')
    },
    
    getWordCount(text) {
      if (!text) return 0
      return text.trim().split(/\s+/).filter(word => word.length > 0).length
    },
    
    loadNotes() {
      const saved = localStorage.getItem('upnote-notes')
      if (saved) {
        this.notes = JSON.parse(saved)
        this.nextId = Math.max(...this.notes.map(note => note.id), 0) + 1
      }
    },
    
    saveNotes() {
      localStorage.setItem('upnote-notes', JSON.stringify(this.notes))
    }
  }
}
</script>

<style scoped>
.upnote-app {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-radius: 12px;
}

.app-header h1 {
  margin: 0 0 10px 0;
  font-size: 2rem;
  font-weight: 300;
}

.app-header p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.notes-container {
  display: flex;
  flex: 1;
  gap: 20px;
  min-height: 0;
}

.notes-sidebar {
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-y: auto;
}

.notes-sidebar h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2rem;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.note-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.note-item:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.note-item.active {
  background: #e3f2fd;
  border-color: #007bff;
}

.note-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.note-date {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 8px;
}

.note-preview {
  font-size: 0.9rem;
  color: #888;
  line-height: 1.4;
}

.empty-state {
  text-align: center;
  color: #666;
  padding: 40px 20px;
}

.note-editor {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.editor-header {
  padding: 20px 20px 0 20px;
}

.title-input {
  width: 100%;
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
  outline: none;
  padding: 10px 0;
  border-bottom: 2px solid #e0e0e0;
  background: transparent;
}

.title-input:focus {
  border-bottom-color: #007bff;
}

.content-textarea {
  flex: 1;
  margin: 20px;
  border: none;
  outline: none;
  resize: none;
  font-size: 1rem;
  line-height: 1.6;
  font-family: inherit;
}

.editor-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
}

.unsaved-indicator {
  color: #dc3545;
  font-weight: 500;
}

.word-count {
  color: #888;
}
</style>