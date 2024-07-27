// queryBlocks.js
import { conn } from './database.js'
import { displayTable, exportCSV } from './utils.js'
import { createVisualization } from './visualization.js'

let queryBlockCounter = 0
let visualizationCounter = 0

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
              <div id="${blockId}-viz-tabs"></div>
              <button class="add-visualization-btn" onclick="addVisualization('${blockId}')">+</button>
          </div>
          <div id="${blockId}-table-tab" class="tab-content active">
              <div id="${blockId}-output" class="output-block"></div>
              <div id="${blockId}-pagination" class="pagination"></div>
              <button id="${blockId}-export" style="display: none;">Export as CSV</button>
          </div>
          <div id="${blockId}-visualizations-container"></div>
      </div>
  `
  queryBlocksElement.appendChild(queryBlock)
}

export function addVisualization(blockId) {
  const vizTabsContainer = document.getElementById(`${blockId}-viz-tabs`)
  const visualizationsContainer = document.getElementById(
    `${blockId}-visualizations-container`
  )
  const vizId = `visualization-${visualizationCounter++}`

  // Add new visualization tab
  const vizTab = document.createElement('button')
  vizTab.className = 'tab-button'
  vizTab.textContent = `Viz ${visualizationCounter}`
  vizTab.onclick = () => switchTab(blockId, vizId)
  vizTabsContainer.appendChild(vizTab)

  // Add new visualization content
  const vizContent = document.createElement('div')
  vizContent.id = `${blockId}-${vizId}-content`
  vizContent.className = 'tab-content visualization-block'
  vizContent.innerHTML = `
        <div class="visualization-options">
            <select id="${vizId}-chart-type" onchange="updateVisualization('${blockId}', '${vizId}')">
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="scatter">Scatter Plot</option>
            </select>
            <select id="${vizId}-x-axis" onchange="updateVisualization('${blockId}', '${vizId}')"></select>
            <select id="${vizId}-y-axis" onchange="updateVisualization('${blockId}', '${vizId}')"></select>
        </div>
        <div id="${vizId}-chart-container" class="chart-container"></div>
    `
  visualizationsContainer.appendChild(vizContent)

  // Populate column selects for the new visualization
  const data = JSON.parse(sessionStorage.getItem(`${blockId}-data`) || '[]')
  if (data.length > 0) {
    const columns = Object.keys(data[0])
    const xAxisSelect = document.getElementById(`${vizId}-x-axis`)
    const yAxisSelect = document.getElementById(`${vizId}-y-axis`)
    xAxisSelect.innerHTML = columns
      .map((col) => `<option value="${col}">${col}</option>`)
      .join('')
    yAxisSelect.innerHTML = columns
      .map((col) => `<option value="${col}">${col}</option>`)
      .join('')
    updateVisualization(blockId, vizId)
  }

  // Switch to the new visualization tab
  switchTab(blockId, vizId)
}

export function updateVisualization(blockId, vizId) {
  const chartType = document.getElementById(`${vizId}-chart-type`).value
  const xAxis = document.getElementById(`${vizId}-x-axis`).value
  const yAxis = document.getElementById(`${vizId}-y-axis`).value
  const chartContainer = document.getElementById(`${vizId}-chart-container`)

  // Retrieve data from session storage
  const data = JSON.parse(sessionStorage.getItem(`${blockId}-data`) || '[]')

  createVisualization(chartContainer, data, chartType, xAxis, yAxis)
}

export async function runQueryBlock(blockId) {
  const queryInput = document.getElementById(`${blockId}-input`)
  const outputElement = document.getElementById(`${blockId}-output`)
  const exportButton = document.getElementById(`${blockId}-export`)
  const resultsElement = document.getElementById(`${blockId}-results`)

  if (!queryInput || !outputElement || !exportButton || !resultsElement) {
    console.error('Query block elements not found')
    return
  }

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

    console.log('Query result data:', data)

    if (data.length === 0) {
      outputElement.innerHTML = '<p>This query returned no results.</p>'
      exportButton.style.display = 'none'
      resultsElement.style.display = 'block'
      return
    }

    // Store the data in session storage
    sessionStorage.setItem(`${blockId}-data`, JSON.stringify(data))

    // Clear existing visualizations
    const vizTabsContainer = document.getElementById(`${blockId}-viz-tabs`)
    const visualizationsContainer = document.getElementById(
      `${blockId}-visualizations-container`
    )
    if (vizTabsContainer) vizTabsContainer.innerHTML = ''
    if (visualizationsContainer) visualizationsContainer.innerHTML = ''

    // Reset visualization counter for this block
    visualizationCounter = 0

    // Show results
    resultsElement.style.display = 'block'

    // Use setTimeout to ensure DOM is updated before we try to access elements
    setTimeout(() => {
      displayTable(data, outputElement, exportButton, blockId, 1)
      exportButton.onclick = () => exportCSV(data)
      switchTab(blockId, 'table')
    }, 0)
  } catch (error) {
    console.error('Query error:', error)
    outputElement.innerHTML = `<p>Error: ${error.message}</p>`
    exportButton.style.display = 'none'
    resultsElement.style.display = 'block'
  }
}

export function switchTab(blockId, tabName) {
  setTimeout(() => {
    const tableTab = document.getElementById(`${blockId}-table-tab`)
    const tabButtons = document.querySelectorAll(
      `#query-block-${blockId} .tab-button`
    )
    const visualizationContents = document.querySelectorAll(
      `#${blockId}-visualizations-container .tab-content`
    )

    // Hide all tab contents
    if (tableTab) tableTab.classList.remove('active')
    visualizationContents.forEach((content) =>
      content.classList.remove('active')
    )

    // Deactivate all tab buttons
    tabButtons.forEach((button) => button.classList.remove('active'))

    if (tabName === 'table') {
      if (tableTab) tableTab.classList.add('active')
      // Activate the first tab button (assumed to be the table tab)
      if (tabButtons.length > 0) tabButtons[0].classList.add('active')
    } else {
      const vizContent = document.getElementById(
        `${blockId}-${tabName}-content`
      )
      if (vizContent) vizContent.classList.add('active')
      // Find and activate the corresponding tab button
      tabButtons.forEach((button) => {
        if (button.textContent === `Viz ${tabName.split('-')[1]}`) {
          button.classList.add('active')
        }
      })
    }
  }, 0)
}

// Helper function to generate a report (you can expand this as needed)
export function generateReport(blockId) {
  const data = JSON.parse(sessionStorage.getItem(`${blockId}-data`) || '[]')
  const visualizationsContainer = document.getElementById(
    `${blockId}-visualizations-container`
  )
  const visualizations = visualizationsContainer.querySelectorAll(
    '.visualization-block'
  )

  let report = `Report for Query Block ${blockId}\n\n`
  report += `Data Summary:\n`
  report += `Total rows: ${data.length}\n`
  report += `Columns: ${Object.keys(data[0]).join(', ')}\n\n`

  report += `Visualizations:\n`
  visualizations.forEach((viz, index) => {
    const vizId = viz
      .querySelector('.chart-container')
      .id.replace('-chart-container', '')
    const chartType = document.getElementById(`${vizId}-chart-type`).value
    const xAxis = document.getElementById(`${vizId}-x-axis`).value
    const yAxis = document.getElementById(`${vizId}-y-axis`).value

    report += `${index + 1}. Visualization ID: ${vizId}\n`
    report += `   Type: ${chartType}\n`
    report += `   X-Axis: ${xAxis}\n`
    report += `   Y-Axis: ${yAxis}\n\n`
  })

  console.log(report)
}
