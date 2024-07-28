<template>
    <div class="data-catalog h-full bg-gray-800 p-4 overflow-auto">
      <h2 class="text-2xl font-bold mb-4">Data Catalog</h2>
      <div class="mb-4 space-y-2">
        <label for="file-upload" class="block">
          <span class="sr-only">Choose file</span>
          <input 
            id="file-upload"
            type="file" 
            ref="fileInput" 
            accept=".csv,.parquet" 
            @change="handleFileChange" 
            class="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
          />
        </label>
        <button 
          @click="importFile" 
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Import File
        </button>
      </div>
      <div id="fileList">
        <h3 class="text-xl font-semibold mb-2">Imported Files:</h3>
        <p v-if="importedFiles.length === 0" class="text-gray-400">No files imported yet.</p>
        <ul v-else class="space-y-4">
          <li v-for="file in importedFiles" :key="file.tableName" class="bg-gray-700 p-4 rounded shadow">
            <div class="table-item">
              <h3 class="text-lg font-semibold">{{ file.tableName }}</h3>
              <p class="text-sm text-gray-400">Original file: {{ file.fileName }}</p>
              <div class="table-actions mt-2 space-x-2">
                <button 
                  @click="showSchema(file.tableName)"
                  class="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  {{ file.showSchema ? 'Hide' : 'Show' }} Schema
                </button>
                <button 
                  @click="showRenameForm(file.tableName)"
                  class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  Rename Table
                </button>
              </div>
              <!-- Schema display and rename form code remains the same -->
            </div>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import * as duckdb from '@duckdb/duckdb-wasm'
  import { conn, db } from '../duck'
  
  export default {
    name: 'DataCatalog',
    data() {
      return {
        importedFiles: [],
        conn,
        db,
        selectedFile: null
      }
    },
    methods: {
      handleFileChange(event) {
        this.selectedFile = event.target.files[0];
      },
      async importFile() {
        if (!this.selectedFile) {
          alert("Please select a file to import.");
          return;
        }
        const fileName = this.selectedFile.name;
        const fileExtension = fileName.split(".").pop().toLowerCase();
        const tableName = fileName.split(".")[0].replace(/\W/g, "_");
        try {
          if (fileExtension === "csv") {
            await this.db.registerFileHandle(fileName, this.selectedFile, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
            await this.conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${fileName}');`);
          } else if (fileExtension === "parquet") {
            await this.db.registerFileHandle(fileName, this.selectedFile, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
            await this.conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_parquet('${fileName}');`);
          } else {
            throw new Error("Unsupported file format. Please use CSV or Parquet files.");
          }
          this.importedFiles.push({ 
            fileName, 
            tableName, 
            showSchema: false, 
            schemaData: [], 
            schemaError: '',
            showRenameForm: false,
            newName: ''
          });
          alert(`File "${fileName}" imported successfully as table "${tableName}".`);
        } catch (error) {
          alert(`Error importing file: ${error.message}`);
        }
        this.$refs.fileInput.value = ''; // Reset file input
        this.selectedFile = null;
      },
      async showSchema(tableName) {
        const file = this.importedFiles.find(f => f.tableName === tableName);
        if (file) {
          file.showSchema = !file.showSchema;
          if (file.showSchema && file.schemaData.length === 0) {
            try {
              const result = await this.conn.query(`DESCRIBE ${tableName};`);
              file.schemaData = result.toArray();
              file.schemaError = '';
            } catch (error) {
              console.error('Error fetching schema:', error);
              file.schemaError = 'Error fetching schema';
            }
          }
        }
      },
      showRenameForm(tableName) {
        const file = this.importedFiles.find(f => f.tableName === tableName);
        if (file) {
          file.showRenameForm = !file.showRenameForm;
        }
      },
      async renameTable(oldTableName) {
        const file = this.importedFiles.find(f => f.tableName === oldTableName);
        if (!file) return;
  
        const newTableName = file.newName.trim();
        if (newTableName && newTableName !== oldTableName) {
          try {
            await this.conn.query(`ALTER TABLE ${oldTableName} RENAME TO ${newTableName};`);
            file.tableName = newTableName;
            file.showRenameForm = false;
            file.newName = '';
            alert(`Table renamed from ${oldTableName} to ${newTableName}`);
          } catch (error) {
            console.error('Error renaming table:', error);
            alert(`Error renaming table: ${error.message}`);
          }
        } else {
          alert('Please enter a valid new table name');
        }
      }
    }
  }
  </script>