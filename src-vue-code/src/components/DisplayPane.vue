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
            @dragover.prevent 
            @drop="drop" 
            ref="displayArea"
            class="min-h-[200px] border-2 border-dashed border-gray-600 rounded-lg p-4 mb-4"
          >
            <p v-if="isEmpty" class="text-gray-400 text-center">Drag visualizations here</p>
          </div>
          <button 
            id="exportPdfBtn" 
            @click="exportToPdf"
            class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full"
          >
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { createVisualization } from "../visualization"
  
  export default {
      name: 'DisplayPane',
      data() {
          return {
              isCollapsed: false,
              isEmpty: true,
              draggedElement: null
          }
      },
      methods: {
          toggleCollapse() {
              this.isCollapsed = !this.isCollapsed
          },
          createDraggableVisualization(blockId, vizId) {
              const vizElement = document.createElement('div')
              vizElement.id = `draggable-${vizId}`
              vizElement.className = 'draggable-viz bg-gray-700 p-4 rounded-lg mb-4'
              vizElement.draggable = true
              vizElement.innerHTML = `
                  <h3 class="text-lg font-semibold mb-2">Visualization ${vizId.split('-')[1]}</h3>
                  <div id="${vizId}-display-container" class="bg-gray-800 p-2 rounded"></div>
              `
  
              vizElement.addEventListener('dragstart', this.dragStart)
  
              const data = JSON.parse(sessionStorage.getItem(`${blockId}-data`) || '[]')
              const chartType = document.getElementById(`${vizId}-chart-type`).value
              const xAxis = document.getElementById(`${vizId}-x-axis`).value
              const yAxis = document.getElementById(`${vizId}-y-axis`).value
  
              const container = vizElement.querySelector(`#${vizId}-display-container`)
              createVisualization(container, data, chartType, xAxis, yAxis)
  
              return vizElement
          },
          dragStart(e) {
              this.draggedElement = e.target
              e.dataTransfer.setData('text/plain', e.target.id)
          },
          drop(e) {
              e.preventDefault()
              const data = e.dataTransfer.getData('text')
              const draggedElement = document.getElementById(data)
              if (this.$refs.displayArea.innerHTML === '<p class="text-gray-400 text-center">Drag visualizations here</p>') {
                  this.$refs.displayArea.innerHTML = ''
              }
              this.$refs.displayArea.appendChild(draggedElement)
              this.isEmpty = false
          },
          exportToPdf() {
              console.log('Exporting to PDF...')
              alert('PDF export functionality to be implemented')
          }
      }
  }
  </script>