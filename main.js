import { initDB, importFile } from "./database.js";
import { addQueryBlock, runQueryBlock } from "./queryBlocks.js";
import {
  updateFileList,
  showSchema,
  showRenameForm,
  renameTable,
} from "./dataCatalog.js";

async function init() {
  await initDB();
  updateFileList();
  addQueryBlock(); // Add an initial query block

  document.getElementById("importButton").addEventListener("click", importFile);
  document
    .getElementById("addQueryBtn")
    .addEventListener("click", addQueryBlock);

  // Expose necessary functions to window for inline event handlers
  window.runQueryBlock = runQueryBlock;
  window.importFile = importFile;
  window.showSchema = showSchema;
  window.showRenameForm = showRenameForm;
  window.renameTable = renameTable;
}

init();
