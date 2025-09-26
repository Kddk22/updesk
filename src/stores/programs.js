import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../utils/api'

export const useProgramsStore = defineStore('programs', () => {
  const programs = ref([])
  const loading = ref(false)
  const error = ref(null)

  const loadPrograms = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/programs')
      programs.value = response.data
    } catch (err) {
      error.value = 'Fehler beim Laden der Programme'
      console.error('Error loading programs:', err)
    } finally {
      loading.value = false
    }
  }

  const createProgram = async (programData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/programs', programData)
      programs.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = 'Fehler beim Erstellen des Programms'
      console.error('Error creating program:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProgram = async (id, programData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/programs/${id}`, programData)
      const index = programs.value.findIndex(p => p.id === id)
      if (index !== -1) {
        programs.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = 'Fehler beim Aktualisieren des Programms'
      console.error('Error updating program:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProgram = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      await api.delete(`/programs/${id}`)
      programs.value = programs.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = 'Fehler beim Löschen des Programms'
      console.error('Error deleting program:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProgramPositions = async (programPositions) => {
    try {
      await api.patch('/programs/positions', { programs: programPositions })
      // Update local state
      programPositions.forEach(updatedProgram => {
        const index = programs.value.findIndex(p => p.id === updatedProgram.id)
        if (index !== -1) {
          programs.value[index].position_x = updatedProgram.position_x
          programs.value[index].position_y = updatedProgram.position_y
        }
      })
    } catch (err) {
      error.value = 'Fehler beim Aktualisieren der Positionen'
      console.error('Error updating positions:', err)
      throw err
    }
  }

  const getProgramById = (id) => {
    return programs.value.find(p => p.id === id)
  }

  const getProgramsByPosition = () => {
    return programs.value.sort((a, b) => {
      if (a.position_y !== b.position_y) {
        return a.position_y - b.position_y
      }
      return a.position_x - b.position_x
    })
  }

  return {
    programs,
    loading,
    error,
    loadPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    updateProgramPositions,
    getProgramById,
    getProgramsByPosition
  }
})