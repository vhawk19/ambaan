<template>
    <div class="query-workspace flex h-screen">
      <div class="flex-grow overflow-y-auto p-6">
        <h1 class="text-2xl font-bold mb-4 p-6">Query Workspace</h1>
        <button @click="addQueryBlock" class="bg-white text-green-600 font-bold py-2 px-6 mx-6 rounded mb-4">
          Add Query Block
        </button>
        <div v-for="block in queryBlocks" :key="block.id" class="mb-4">
          <QueryBlock :blockId="block.id" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import QueryBlock from '@/components/QueryBlock.vue'
  import { useQueryBlockStore } from '@/stores/queryBlockStore'
  
  const queryBlockStore = useQueryBlockStore()
  const { queryBlocks, addQueryBlock } = queryBlockStore
  
  onMounted(() => {
    addQueryBlock()
  })
  </script>
