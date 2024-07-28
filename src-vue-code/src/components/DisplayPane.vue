<template>
    <div class="display-pane collapsible">
    <h2 onclick="toggleCollapse('display-pane')">Display Pane <span class="collapse-icon">▼</span></h2>
    <div class="content">
        <div id="displayArea" v-on:dragover="dragOver" v-on:drop="drop">
            <p>Drag visualizations here</p>
        </div>
        <button id="exportPdfBtn" v-on:click="exportToPdf">Export to PDF</button>
    </div>
    </div>
</template>

<script>
import { createVisualization } from "../visualization"
export default {
    name: 'DisplayPane',
    data () {
        return {}
    },
    methods: {
        // initializeDisplayPane() {
            // const displayArea = document.getElementById('displayArea')
            // displayArea.innerHTML = '<p>Drag visualizations here</p>'
            // displayArea.addEventListener('dragover', dragOver)
            // displayArea.addEventListener('drop', drop)

            // document.getElementById('exportPdfBtn').addEventListener('click', exportToPdf)
            // },

        createDraggableVisualization(blockId, vizId) {
            const vizElement = document.createElement('div')
            vizElement.id = `draggable-${vizId}`
            vizElement.className = 'draggable-viz'
            vizElement.draggable = true
            vizElement.innerHTML = `
                    <h3>Visualization ${vizId.split('-')[1]}</h3>
                    <div id="${vizId}-display-container"></div>
                `

            vizElement.addEventListener('dragstart', dragStart)

            const data = JSON.parse(sessionStorage.getItem(`${blockId}-data`) || '[]')
            const chartType = document.getElementById(`${vizId}-chart-type`).value
            const xAxis = document.getElementById(`${vizId}-x-axis`).value
            const yAxis = document.getElementById(`${vizId}-y-axis`).value

            const container = vizElement.querySelector(`#${vizId}-display-container`)
            createVisualization(container, data, chartType, xAxis, yAxis)

            return vizElement
            },

        dragStart(e) {
            draggedElement = e.target
            e.dataTransfer.setData('text/plain', e.target.id)
            },

        dragOver(e) {
            e.preventDefault()
            },

        drop(e) {
            e.preventDefault()
            const data = e.dataTransfer.getData('text')
            const draggedElement = document.getElementById(data)
            if (e.target.id === 'displayArea') {
                if (e.target.innerHTML === '<p>Drag visualizations here</p>') {
                e.target.innerHTML = ''
                }
                e.target.appendChild(draggedElement)
            } else if (e.target.closest('#displayArea')) {
                e.target.closest('#displayArea').appendChild(draggedElement)
            }
            },

        exportToPdf() {
            console.log('Exporting to PDF...')
            alert('PDF export functionality to be implemented')
        }

    }
}
</script>