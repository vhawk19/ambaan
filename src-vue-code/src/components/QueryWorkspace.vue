<template>
    <div class="query-workspace p-4 bg-gray-900 h-full overflow-auto text-white">
      <h2 class="text-2xl font-bold mb-4">Query Workspace</h2>
      <div id="queryBlocks" class="space-y-4">
        <QueryBlock 
          v-for="blockId in queryBlockCounter" 
          :key="blockId" 
          :blockId="blockId" 
        />
      </div>
      <div 
        class="add-query-btn mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer text-center"
        @click="addQueryBlock"
      >
        + Add Query Block
      </div>
    </div>
  </template>
  
  <script>
  import QueryBlock from './QueryBlock.vue';
  
  export default {
    name: 'QueryWorkspace',
    components: {
      QueryBlock
    },
    data() {
      return {
        queryBlockCounter: 1,
      }
    },
    methods: {
      addQueryBlock() {
        this.queryBlockCounter++;
      }
    }
  }
  </script>