import { defineStore } from 'pinia'
import { ref } from 'vue'
import { conn } from '../duck'

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

  function setQuery(blockId, newQuery) {
    const block = queryBlocks.value.find((b) => b.id === blockId)
    if (block) {
      block.query = newQuery
    }
  }

  async function runQuery(blockId) {
    const block = queryBlocks.value.find((b) => b.id === blockId)
    if (!block) return
    console.log('query is ', block.query)
    try {
      const result = await conn.query(block.query)
      block.result = result.toArray()
      block.error = null
    } catch (error) {
      console.error('Query error:', error)
      block.error = error.message
      block.result = null
    }
  }

  function clearQuery(blockId) {
    const block = queryBlocks.value.find((b) => b.id === blockId)
    if (block) {
      block.query = ''
      block.result = null
      block.error = null
    }
  }

  return { queryBlocks, addQueryBlock, setQuery, runQuery, clearQuery }
})
