import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../duck'

export const useQueryBlockStore = defineStore('queryBlock', () => {
  const queryBlocks = ref([])

  function addQueryBlock() {
    queryBlocks.value.push({
      id: Date.now(),
      query: '',
      result: null,
      error: null,
    })
  }

  async function runQuery(blockId, query) {
    const block = queryBlocks.value.find((b) => b.id === blockId)
    if (!block) return

    try {
      const result = await db.query(query)
      block.result = result.toArray()
      block.error = null
    } catch (error) {
      console.error('Query error:', error)
      block.error = error.message
      block.result = null
    }
  }

  return { queryBlocks, addQueryBlock, runQuery }
})
