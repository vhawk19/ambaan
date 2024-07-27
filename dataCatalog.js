// dataCatalog.js
import { importedFiles, conn } from './database.js'

export async function updateFileList() {
  const tableListElement = document.getElementById('tableList')
  tableListElement.innerHTML = ''

  if (importedFiles.length === 0) {
    tableListElement.innerHTML = '<p>No files imported yet.</p>'
  } else {
    for (const file of importedFiles) {
      const tableItem = document.createElement('div')
      tableItem.className = 'table-item'
      tableItem.innerHTML = `
                <h3>${file.tableName}</h3>
                <p>Original file: ${file.fileName}</p>
                <div class="table-actions">
                    <button onclick="showSchema('${file.tableName}')">Show Schema</button>
                    <button onclick="showRenameForm('${file.tableName}')">Rename Table</button>
                </div>
                <div id="schema-${file.tableName}" class="schema-display" style="display: none;"></div>
                <div id="rename-form-${file.tableName}" class="rename-form" style="display: none;">
                    <input type="text" id="new-name-${file.tableName}" placeholder="New table name">
                    <button onclick="renameTable('${file.tableName}')">Rename</button>
                </div>
            `
      tableListElement.appendChild(tableItem)
    }
  }
}

export async function showSchema(tableName) {
  const schemaElement = document.getElementById(`schema-${tableName}`)
  if (schemaElement.style.display === 'none') {
    try {
      const result = await conn.query(`DESCRIBE ${tableName};`)
      const schemaData = result.toArray()
      let schemaHtml =
        '<table class="schema-table"><tr><th>Column Name</th><th>Type</th></tr>'
      schemaData.forEach((row) => {
        schemaHtml += `<tr><td>${row.column_name}</td><td>${row.column_type}</td></tr>`
      })
      schemaHtml += '</table>'
      schemaElement.innerHTML = schemaHtml
      schemaElement.style.display = 'block'
    } catch (error) {
      console.error('Error fetching schema:', error)
      schemaElement.textContent = 'Error fetching schema'
      schemaElement.style.display = 'block'
    }
  } else {
    schemaElement.style.display = 'none'
  }
}

export function showRenameForm(tableName) {
  const renameForm = document.getElementById(`rename-form-${tableName}`)
  renameForm.style.display =
    renameForm.style.display === 'none' ? 'flex' : 'none'
}

export async function renameTable(oldTableName) {
  const newNameInput = document.getElementById(`new-name-${oldTableName}`)
  const newTableName = newNameInput.value.trim()

  if (newTableName && newTableName !== oldTableName) {
    try {
      await conn.query(`ALTER TABLE ${oldTableName} RENAME TO ${newTableName};`)
      const fileIndex = importedFiles.findIndex(
        (file) => file.tableName === oldTableName
      )
      if (fileIndex !== -1) {
        importedFiles[fileIndex].tableName = newTableName
      }
      updateFileList()
      alert(`Table renamed from ${oldTableName} to ${newTableName}`)
    } catch (error) {
      console.error('Error renaming table:', error)
      alert(`Error renaming table: ${error.message}`)
    }
  } else {
    alert('Please enter a valid new table name')
  }
}
