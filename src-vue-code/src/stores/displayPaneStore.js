import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDisplayPaneStore = defineStore('displayPane', () => {
  const items = ref([])

  function addItem(item) {
    items.value.push(item)
  }

  function removeItem(id) {
    const index = items.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  function clearItems() {
    items.value = []
  }

  return { items, addItem, removeItem, clearItems }
})
