import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDisplayPaneStore = defineStore('displayPane', () => {
  const items = ref([])

  function addItem(item) {
    console.log('Adding item to display pane:', item)
    items.value.push(item)
  }

  function updateItem(updatedItem) {
    const index = items.value.findIndex((item) => item.id === updatedItem.id)
    if (index !== -1) {
      items.value[index] = updatedItem
    }
  }

  function getItemByQueryBlockId(queryBlockId, vizId) {
    return items.value.find(
      (item) => item.queryBlockId === queryBlockId && item.vizId === vizId
    )
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

  return {
    items,
    addItem,
    updateItem,
    getItemByQueryBlockId,
    removeItem,
    clearItems,
  }
})
