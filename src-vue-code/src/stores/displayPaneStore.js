import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDisplayPaneStore = defineStore('displayPane', () => {
  const visualizations = ref([])

  function addVisualization(visualization) {
    visualizations.value.push(visualization)
  }

  function removeVisualization(id) {
    const index = visualizations.value.findIndex(v => v.id === id)
    if (index !== -1) {
      visualizations.value.splice(index, 1)
    }
  }

  return { visualizations, addVisualization, removeVisualization }
})