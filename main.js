// main.js
import { initDB, importFile } from './database.js'
import {
  addQueryBlock,
  runQueryBlock,
  updateVisualization,
  switchTab,
} from './queryBlocks.js'
import {
  updateFileList,
  showSchema,
  showRenameForm,
  renameTable,
} from './dataCatalog.js'
import { changePage } from './utils.js'

async function init() {
  await initDB()
  updateFileList()
  addQueryBlock() // Add an initial query block

  document.getElementById('importButton').addEventListener('click', importFile)
  document
    .getElementById('addQueryBtn')
    .addEventListener('click', addQueryBlock)

  // Expose necessary functions to window for inline event handlers
  window.runQueryBlock = runQueryBlock
  window.importFile = importFile
  window.showSchema = showSchema
  window.showRenameForm = showRenameForm
  window.renameTable = renameTable
  window.updateVisualization = updateVisualization
  window.switchTab = switchTab
  window.changePage = changePage
}

init()
