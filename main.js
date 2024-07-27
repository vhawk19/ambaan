// main.js
import { initDB, importFile } from './database.js'
import {
  addQueryBlock,
  runQueryBlock,
  updateVisualization,
  switchTab,
  addToDisplayPane,
} from './queryBlocks.js'
import {
  updateFileList,
  showSchema,
  showRenameForm,
  renameTable,
} from './dataCatalog.js'
import { changePage } from './utils.js'
import { initializeDisplayPane } from './displayPane.js'

async function init() {
  await initDB()
  updateFileList()
  addQueryBlock() // Add an initial query block
  initializeDisplayPane() // Initialize the display pane

  document.getElementById('importButton').addEventListener('click', importFile)
  document
    .getElementById('addQueryBtn')
    .addEventListener('click', addQueryBlock)

  window.runQueryBlock = runQueryBlock
  window.importFile = importFile
  window.showSchema = showSchema
  window.showRenameForm = showRenameForm
  window.renameTable = renameTable
  window.updateVisualization = updateVisualization
  window.switchTab = switchTab
  window.changePage = changePage
  window.addToDisplayPane = addToDisplayPane
}

init()
