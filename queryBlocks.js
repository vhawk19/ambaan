// queryBlocks.js
import { conn } from './database.js'
import { displayTable, exportCSV } from './utils.js'
import { createVisualization } from './visualization.js'
import { createDraggableVisualization } from './displayPane.js'

let queryBlockCounter = 0
let visualizationCounter = 0

export function addQueryBlock() {
  const queryBlocksElement = document.getElementById('queryBlocks')
  const blockId = `query-block-${queryBlockCounter++}`
  const queryBlock = document.createElement('div')
  queryBlock.className = 'code-block'
  queryBlock.innerHTML = `
      <textarea id="${blockId}-input" rows="5" placeholder="Enter your SQL query here"></textarea>
      <button onclick="window.runQueryBlock('${blockId}')">Run Query</button>
      <div id="${blockId}-results" class="query-results" style="display: none;">
          <div class="tabs">
              <button class="tab-button active" onclick="window.switchTab('${blockId}', 'table')">Table</button>
              <div id="${blockId}-viz-tabs"></div>
              <button class="add-visualization-btn" onclick="window.addVisualization('${blockId}')">+</button>
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
  const savedVisualizations = getSavedVisualizations(blockId)
  savedVisualizations.forEach((vizId) => {
    addVisualization(blockId)
    const name = getVisualizationName(blockId, vizId)
    const settings = getVisualizationSettings(blockId, vizId)

    // Update the visualization name
    document.getElementById(`${vizId}-name`).value = name
    document.querySelector(
      `#${blockId}-viz-tabs button[data-viz-id="${vizId}"]`
    ).textContent = name

    // Update the visualization settings
    if (settings.chartType) {
      document.getElementById(`${vizId}-chart-type`).value = settings.chartType
    }
    if (settings.xAxis) {
      document.getElementById(`${vizId}-x-axis`).value = settings.xAxis
    }
    if (settings.yAxis) {
      document.getElementById(`${vizId}-y-axis`).value = settings.yAxis
    }

    // Recreate the visualization
    updateVisualization(blockId, vizId)
  })
}
function getSavedVisualizations(blockId) {
  const visualizations = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key.startsWith(`${blockId}-visualization-`) && key.endsWith('-name')) {
      visualizations.push(key.split('-name')[0].split(`${blockId}-`)[1])
    }
  }
  return visualizations
}
export function addVisualization(blockId) {
  const vizTabsContainer = document.getElementById(`${blockId}-viz-tabs`)
  const visualizationsContainer = document.getElementById(
    `${blockId}-visualizations-container`
  )
  const vizId = `visualization-${visualizationCounter++}`

  // Create a new tab button
  const tabButton = document.createElement('button')
  tabButton.className = 'tab-button'
  tabButton.textContent = `Viz ${visualizationCounter}`
  tabButton.onclick = () => window.switchTab(blockId, vizId)
  tabButton.dataset.vizId = vizId
  vizTabsContainer.appendChild(tabButton)

  // Create visualization content
  const vizContent = document.createElement('div')
  vizContent.id = `${blockId}-${vizId}-content`
  vizContent.className = 'tab-content'
  vizContent.innerHTML = `
    <div class="visualization-options">
      <input type="text" id="${vizId}-name" value="Visualization ${visualizationCounter}" onchange="window.renameVisualization('${blockId}', '${vizId}')">
      <select id="${vizId}-chart-type" onchange="window.updateVisualization('${blockId}', '${vizId}')">
        <option value="bar">Bar Chart</option>
        <option value="line">Line Chart</option>
        <option value="pie">Pie Chart</option>
        <option value="scatter">Scatter Plot</option>
        <option value="counter">Counter</option>
        <option value="table">Table</option>
      </select>
      <select id="${vizId}-x-axis" onchange="window.updateVisualization('${blockId}', '${vizId}')"></select>
      <select id="${vizId}-y-axis" onchange="window.updateVisualization('${blockId}', '${vizId}')"></select>
    </div>
    <div id="${vizId}-chart-container" class="chart-container"></div>
    <button onclick="window.addToDisplayPane('${blockId}', '${vizId}')">Add to Display Pane</button>
  `
  visualizationsContainer.appendChild(vizContent)

  // Save the initial visualization name
  saveVisualizationName(blockId, vizId, `Visualization ${visualizationCounter}`)

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
  window.switchTab(blockId, vizId)
}

export function updateVisualization(blockId, vizId) {
  const chartType = document.getElementById(`${vizId}-chart-type`).value
  const xAxis = document.getElementById(`${vizId}-x-axis`).value
  const yAxis = document.getElementById(`${vizId}-y-axis`).value
  const chartContainer = document.getElementById(`${vizId}-chart-container`)

  // Retrieve data from session storage
  const data = JSON.parse(sessionStorage.getItem(`${blockId}-data`) || '[]')

  if (chartType === 'table') {
    displayTable(data, chartContainer, null, vizId, 1)
  } else {
    createVisualization(chartContainer, data, chartType, xAxis, yAxis)
  }

  // Save visualization settings
  saveVisualizationSettings(blockId, vizId, { chartType, xAxis, yAxis })
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
  const tableTab = document.getElementById(`${blockId}-table-tab`)
  const tabButtons = document.querySelectorAll(
    `#${blockId}-results .tab-button`
  )
  const tabContents = document.querySelectorAll(
    `#${blockId}-results .tab-content`
  )

  // Hide all tab contents and deactivate all tab buttons
  tabContents.forEach((content) => content.classList.remove('active'))
  tabButtons.forEach((button) => button.classList.remove('active'))

  if (tabName === 'table') {
    tableTab.classList.add('active')
    tabButtons[0].classList.add('active')
  } else {
    const vizContent = document.getElementById(`${blockId}-${tabName}-content`)
    if (vizContent) {
      vizContent.classList.add('active')
      // Find and activate the corresponding tab button
      tabButtons.forEach((button) => {
        if (button.textContent === `Viz ${tabName.split('-')[1]}`) {
          button.classList.add('active')
        }
      })
    }
  }
}

export function renameVisualization(blockId, vizId) {
  const newName = document.getElementById(`${vizId}-name`).value
  const tabButton = document.querySelector(
    `#${blockId}-viz-tabs button[data-viz-id="${vizId}"]`
  )
  if (tabButton) {
    tabButton.textContent = newName
  }

  // Save the new name
  saveVisualizationName(blockId, vizId, newName)

  // Record the renaming event
  recordEvent('rename_visualization', { blockId, vizId, newName })
}

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
export function addToDisplayPane(blockId, vizId) {
  const displayArea = document.getElementById('displayArea')
  const draggableViz = createDraggableVisualization(blockId, vizId)
  displayArea.appendChild(draggableViz)
}

function saveVisualizationName(blockId, vizId, name) {
  const key = `${blockId}-${vizId}-name`
  sessionStorage.setItem(key, name)
}
function saveVisualizationSettings(blockId, vizId, settings) {
  const key = `${blockId}-${vizId}-settings`
  sessionStorage.setItem(key, JSON.stringify(settings))
}

function getVisualizationName(blockId, vizId) {
  const key = `${blockId}-${vizId}-name`
  return sessionStorage.getItem(key) || `Visualization ${vizId.split('-')[1]}`
}

function getVisualizationSettings(blockId, vizId) {
  const key = `${blockId}-${vizId}-settings`
  return JSON.parse(sessionStorage.getItem(key) || '{}')
}

function recordEvent(eventName, eventData) {
  const events = JSON.parse(sessionStorage.getItem('events') || '[]')
  events.push({
    timestamp: new Date().toISOString(),
    eventName,
    eventData,
  })
  sessionStorage.setItem('events', JSON.stringify(events))
  console.log(`Event recorded: ${eventName}`, eventData)
}

window.addVisualization = addVisualization
window.updateVisualization = updateVisualization
window.runQueryBlock = runQueryBlock
window.switchTab = switchTab
window.addToDisplayPane = addToDisplayPane
window.renameVisualization = renameVisualization
window.getVisualizationName = getVisualizationName
window.getVisualizationSettings = getVisualizationSettings
