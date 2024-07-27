// queryBlocks.js
import { conn } from './database.js'
import { displayTable, exportCSV } from './utils.js'
import { createVisualization } from './visualization.js'

let queryBlockCounter = 0
const ROWS_PER_PAGE = 5 // This should match the value in utils.js

export function addQueryBlock() {
  const queryBlocksElement = document.getElementById('queryBlocks')
  const blockId = `query-block-${queryBlockCounter++}`
  const queryBlock = document.createElement('div')
  queryBlock.className = 'code-block'
  queryBlock.innerHTML = `
        <textarea id="${blockId}-input" rows="5" placeholder="Enter your SQL query here"></textarea>
        <button onclick="runQueryBlock('${blockId}')">Run Query</button>
        <div id="${blockId}-results" class="query-results" style="display: none;">
            <div class="tabs">
                <button class="tab-button active" onclick="switchTab('${blockId}', 'table')">Table</button>
                <button class="tab-button" onclick="switchTab('${blockId}', 'visualization')">Visualization</button>
            </div>
            <div id="${blockId}-table-tab" class="tab-content active">
                <div id="${blockId}-output" class="output-block"></div>
                <div id="${blockId}-pagination" class="pagination"></div>
                <button id="${blockId}-export" style="display: none;">Export as CSV</button>
            </div>
            <div id="${blockId}-visualization-tab" class="tab-content">
                <div class="visualization-options">
                    <select id="${blockId}-chart-type" onchange="updateVisualization('${blockId}')">
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="scatter">Scatter Plot</option>
                    </select>
                    <select id="${blockId}-x-axis" onchange="updateVisualization('${blockId}')"></select>
                    <select id="${blockId}-y-axis" onchange="updateVisualization('${blockId}')"></select>
                </div>
                <div id="${blockId}-chart-container" class="chart-container"></div>
            </div>
        </div>
    `
  queryBlocksElement.appendChild(queryBlock)
}

export async function runQueryBlock(blockId) {
  const queryInput = document.getElementById(`${blockId}-input`)
  const outputElement = document.getElementById(`${blockId}-output`)
  const exportButton = document.getElementById(`${blockId}-export`)
  const resultsElement = document.getElementById(`${blockId}-results`)
  const query = queryInput.value

  try {
    const result = await conn.query(query)
    const data = result.toArray().map((row) => {
      const newRow = {}
      for (const [key, value] of Object.entries(row)) {
        newRow[key] = typeof value === 'bigint' ? value.toString() : value
      }
      return newRow
    })

    if (data.length === 0) {
      outputElement.innerHTML = '<p>This query returned no results.</p>'
      exportButton.style.display = 'none'
      resultsElement.style.display = 'block'
      return
    }

    // Store the data in session storage
    sessionStorage.setItem(`${blockId}-data`, JSON.stringify(data))

    console.log(`Query returned ${data.length} rows. First row:`, data[0])

    displayTable(data, outputElement, exportButton, blockId, 1)
    exportButton.onclick = () => exportCSV(data)

    // Populate column selects for visualization
    const columns = Object.keys(data[0])
    const xAxisSelect = document.getElementById(`${blockId}-x-axis`)
    const yAxisSelect = document.getElementById(`${blockId}-y-axis`)
    xAxisSelect.innerHTML = columns
      .map((col) => `<option value="${col}">${col}</option>`)
      .join('')
    yAxisSelect.innerHTML = columns
      .map((col) => `<option value="${col}">${col}</option>`)
      .join('')

    // Create initial visualization
    updateVisualization(blockId)

    // Show results
    resultsElement.style.display = 'block'
  } catch (error) {
    console.error('Query error:', error)
    outputElement.innerHTML = `<p>Error: ${error.message}</p>`
    exportButton.style.display = 'none'
    resultsElement.style.display = 'block'
  }
}

export function updateVisualization(blockId) {
  const chartType = document.getElementById(`${blockId}-chart-type`).value
  const xAxis = document.getElementById(`${blockId}-x-axis`).value
  const yAxis = document.getElementById(`${blockId}-y-axis`).value
  const chartContainer = document.getElementById(`${blockId}-chart-container`)

  // Retrieve data from session storage
  const data = JSON.parse(sessionStorage.getItem(`${blockId}-data`) || '[]')

  createVisualization(chartContainer, data, chartType, xAxis, yAxis)
}

export function switchTab(blockId, tabName) {
  const tableTab = document.getElementById(`${blockId}-table-tab`)
  const vizTab = document.getElementById(`${blockId}-visualization-tab`)
  const tabButtons = document.querySelectorAll(
    `#query-block-${blockId} .tab-button`
  )

  if (tabName === 'table') {
    tableTab.classList.add('active')
    vizTab.classList.remove('active')
  } else {
    tableTab.classList.remove('active')
    vizTab.classList.add('active')
  }

  tabButtons.forEach((button) => {
    if (button.textContent.toLowerCase() === tabName) {
      button.classList.add('active')
    } else {
      button.classList.remove('active')
    }
  })
}
