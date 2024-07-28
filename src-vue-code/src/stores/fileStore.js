import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as duckdb from '@duckdb/duckdb-wasm'
import { db } from '../duck'

export const useFileStore = defineStore('file', () => {
  const importedFiles = ref([])

  async function importFile(file) {
    const fileName = file.name
    const fileExtension = fileName.split('.').pop().toLowerCase()
    const tableName = fileName.split('.')[0].replace(/\W/g, '_')

    try {
      if (fileExtension === 'csv') {
        await db.registerFileHandle(
          fileName,
          file,
          duckdb.DuckDBDataProtocol.BROWSER_FILEREADER,
          true
        )
        await db.query(
          `CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${fileName}')`
        )
      } else if (fileExtension === 'parquet') {
        await db.registerFileHandle(
          fileName,
          file,
          duckdb.DuckDBDataProtocol.BROWSER_FILEREADER,
          true
        )
        await db.query(
          `CREATE TABLE ${tableName} AS SELECT * FROM read_parquet('${fileName}')`
        )
      } else {
        throw new Error(
          'Unsupported file format. Please use CSV or Parquet files.'
        )
      }

      importedFiles.value.push({
        fileName,
        tableName,
        showSchema: false,
        schemaData: [],
        schemaError: '',
        showRenameForm: false,
        newName: '',
      })

      return `File "${fileName}" imported successfully as table "${tableName}".`
    } catch (error) {
      console.error('Error importing file:', error)
      throw error
    }
  }

  return { importedFiles, importFile }
})
