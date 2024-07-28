<template>
    <div class="display-pane bg-gray-800 h-full overflow-auto text-white">
      <div class="p-4">
        <h2 class="text-2xl font-bold mb-4 flex items-center justify-between cursor-pointer" @click="toggleCollapse">
          Display Pane 
          <svg :class="['w-6 h-6 transition-transform', isCollapsed ? 'transform rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </h2>
        <div v-show="!isCollapsed" class="content">
          <div 
            id="displayArea" 
            ref="displayArea"
            class="min-h-[200px] border-2 border-dashed border-gray-600 rounded-lg p-4 mb-4"
          >
            <p v-if="isEmpty" class="text-gray-400 text-center">Add visualizations here</p>
            <div v-for="item in displayItems" :key="item.id" class="mb-4">
              <h3 class="text-lg font-semibold mb-2">{{ item.name }}</h3>
              <div :id="`${item.id}-container`" class="bg-gray-700 p-4 rounded-lg"></div>
            </div>
          </div>
          <button 
            @click="exportToPdf"
            class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full"
          >
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useDisplayPaneStore } from '@/stores/displayPaneStore'
  import { createVisualization } from "@/utils/visualization"
  
  const displayPaneStore = useDisplayPaneStore()
  const isCollapsed = ref(false)
  const displayArea = ref(null)
  
  const displayItems = computed(() => displayPaneStore.items)
  const isEmpty = computed(() => displayItems.value.length === 0)
  
  function toggleCollapse() {
    isCollapsed.value = !isCollapsed.value
  }
  
  function exportToPdf() {
    console.log('Exporting to PDF...')
    alert('PDF export functionality to be implemented')
  }
  
  watch(displayItems, () => {
    nextTick(() => {
      displayItems.value.forEach(item => {
        if (item.type === 'visualization') {
          const container = document.getElementById(`${item.id}-container`)
          if (container) {
            createVisualization(container, item.data, item.chartType, item.xAxis, item.yAxis)
          }
        }
      })
    })
  }, { deep: true })
  
  onMounted(() => {
    // Initial render of visualizations
    displayItems.value.forEach(item => {
      if (item.type === 'visualization') {
        const container = document.getElementById(`${item.id}-container`)
        if (container) {
          createVisualization(container, item.data, item.chartType, item.xAxis, item.yAxis)
        }
      }
    })
  })
  </script>