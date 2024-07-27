import { conn } from "./database.js";
import { displayTable, exportCSV } from "./utils.js";

let queryBlockCounter = 0;

export function addQueryBlock() {
  const queryBlocksElement = document.getElementById("queryBlocks");
  const blockId = `query-block-${queryBlockCounter++}`;
  const queryBlock = document.createElement("div");
  queryBlock.className = "code-block";
  queryBlock.innerHTML = `
        <textarea id="${blockId}-input" rows="5" placeholder="Enter your SQL query here"></textarea>
        <button onclick="runQueryBlock('${blockId}')">Run Query</button>
        <button id="${blockId}-export" style="display: none;">Export as CSV</button>
        <div id="${blockId}-output" class="output-block"></div>
    `;
  queryBlocksElement.appendChild(queryBlock);
}

export async function runQueryBlock(blockId) {
  const queryInput = document.getElementById(`${blockId}-input`);
  const outputElement = document.getElementById(`${blockId}-output`);
  const exportButton = document.getElementById(`${blockId}-export`);
  const query = queryInput.value;

  try {
    const result = await conn.query(query);
    const data = result.toArray().map((row) => {
      const newRow = {};
      for (const [key, value] of Object.entries(row)) {
        newRow[key] = typeof value === "bigint" ? value.toString() : value;
      }
      return newRow;
    });
    displayTable(data, outputElement, exportButton);
    exportButton.onclick = () => exportCSV(data);
  } catch (error) {
    outputElement.style.display = "block";
    outputElement.innerHTML = `Error: ${error.message}`;
    exportButton.style.display = "none";
  }
}
