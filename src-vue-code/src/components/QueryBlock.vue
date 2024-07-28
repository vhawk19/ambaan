<template>
    <div class="query-block bg-gray-800 p-4 rounded-lg shadow-lg">
      <textarea
        v-model="query"
        class="w-full h-32 p-2 mb-4 bg-gray-700 text-white rounded"
        placeholder="Enter your SQL query here..."
      ></textarea>
      <div class="flex justify-between">
        <button
          @click="executeQuery"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Execute Query
        </button>
        <button
          @click="clearQuery"
          class="bg-white hover:bg-white text-green-500 font-bold py-2 px-4 rounded"
        >
          Clear Query
        </button>
      </div>
      <div v-if="queryBlockStore.result" class="mt-4">
        <h3 class="text-xl font-bold mb-2">Query Result:</h3>
        <pre class="bg-gray-700 p-4 rounded overflow-x-auto">{{ queryBlockStore.result }}</pre>
      </div>
    </div>
  </template>
  
  <script>
  import { useQueryBlockStore } from '@/stores/queryBlockStore'
  
  export default {
    name: 'QueryBlock',
    setup() {
      const queryBlockStore = useQueryBlockStore()
      return {
        queryBlockStore
      }
    },
    computed: {
      query: {
        get() {
          return this.queryBlockStore.query
        },
        set(value) {
          this.queryBlockStore.setQuery(value)
        }
      }
    },
    methods: {
      async executeQuery() {
        await this.queryBlockStore.runQuery()
      },
      clearQuery() {
        this.queryBlockStore.clearQuery()
      }
    }
  }
  </script>
  