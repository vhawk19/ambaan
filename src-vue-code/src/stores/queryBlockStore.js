import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { conn } from '../duck'

export const useQueryBlockStore = defineStore('queryBlock', () => {
  const queryBlocks = ref([])
  let nextId = 1

  const getBlockById = computed(() => (id) => {
    return queryBlocks.value.find((block) => block.id === id)
  })

  function addQueryBlock() {
    const newBlock = {
      id: nextId++,
      query: '',
      result: null,
      error: null,
    }
    queryBlocks.value.push(newBlock)
    return newBlock.id
  }

  function setQuery(blockId, newQuery) {
    console.log('Setting query for block', blockId, newQuery)
    const blockIndex = queryBlocks.value.findIndex((b) => b.id === blockId)
    if (blockIndex !== -1) {
      queryBlocks.value[blockIndex] = {
        ...queryBlocks.value[blockIndex],
        query: newQuery,
      }
    } else {
      console.error('Block not found:', blockId)
    }
  }

  async function runQuery(blockId) {
    console.log('Running query for block', blockId)
    const blockIndex = queryBlocks.value.findIndex((b) => b.id === blockId)
    if (blockIndex === -1) {
      console.error('Block not found:', blockId)
      return
    }
    const block = queryBlocks.value[blockIndex]
    console.log('Query to execute:', block.query)
    try {
      const result = await conn.query(block.query)
      console.log('Query result:', result)

      // Transform Proxy objects to plain JavaScript objects
      const plainResult = result.toArray().map((row) => {
        const plainRow = {}
        for (const key in row) {
          plainRow[key] = row[key]
        }
        return plainRow
      })

      queryBlocks.value[blockIndex] = {
        ...block,
        result: plainResult,
        error: null,
      }
    } catch (error) {
      console.error('Query error:', error)
      queryBlocks.value[blockIndex] = {
        ...block,
        result: null,
        error: error.message,
      }
    }
  }

  function clearQuery(blockId) {
    const blockIndex = queryBlocks.value.findIndex((b) => b.id === blockId)
    if (blockIndex !== -1) {
      queryBlocks.value[blockIndex] = {
        ...queryBlocks.value[blockIndex],
        query: '',
        result: null,
        error: null,
      }
    } else {
      console.error('Block not found:', blockId)
    }
  }

  return {
    queryBlocks,
    getBlockById,
    addQueryBlock,
    setQuery,
    runQuery,
    clearQuery,
  }
})
