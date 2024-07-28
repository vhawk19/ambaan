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
        <p v-if="fileStore.importedFiles.length === 0" class="text-gray-400">No files imported yet.</p>
        <ul v-else class="space-y-4">
          <li v-for="file in fileStore.importedFiles" :key="file.tableName" class="bg-gray-700 p-4 rounded shadow">
            <div class="table-item">
              <h3 @click="toggleOptions(file.tableName)" class="text-lg font-semibold cursor-pointer hover:text-blue-300">
                {{ file.tableName }}
              </h3>
              <p class="text-sm text-gray-400">Original file: {{ file.fileName }}</p>
              <div v-if="file.showOptions" class="table-actions mt-2 space-y-2">
                <button
                  @click="showSchema(file.tableName)"
                  class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  {{ file.showSchema ? 'Hide' : 'Show' }} Schema
                </button>
                <button
                  @click="showRenameForm(file.tableName)"
                  class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  Rename Table
                </button>
              </div>
              <div v-if="file.showSchema" class="schema-display mt-2">
                <table v-if="file.schemaData.length > 0" class="w-full text-sm">
                  <thead>
                    <tr>
                      <th class="text-left">Column Name</th>
                      <th class="text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in file.schemaData" :key="row.column_name">
                      <td>{{ row.column_name }}</td>
                      <td>{{ row.column_type }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else-if="file.schemaError" class="text-red-500">{{ file.schemaError }}</p>
              </div>
              <div v-if="file.showRenameForm" class="rename-form mt-2">
                <input
                  v-model="file.newName"
                  type="text"
                  :placeholder="'New name for ' + file.tableName"
                  class="mr-2 p-1 rounded"
                >
                <button
                  @click="renameTable(file.tableName)"
                  class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  Rename
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import { useFileStore } from '@/stores/fileStore'
  import { useTableStore } from '@/stores/tableStore'
  import { db, conn } from '@/duck'
  
  export default {
    name: 'DataCatalog',
    setup() {
      const fileStore = useFileStore()
      const tableStore = useTableStore()
      return {
        fileStore,
        tableStore,
        db,
        conn
      }
    },
    data() {
      return {
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
        try {
          await this.fileStore.importFile(this.selectedFile, this.db, this.conn);
          alert(`File "${this.selectedFile.name}" imported successfully.`);
        } catch (error) {
          alert(`Error importing file: ${error.message}`);
        }
        this.$refs.fileInput.value = '';
        this.selectedFile = null;
      },
      async showSchema(tableName) {
  const file = this.fileStore.importedFiles.find(f => f.tableName === tableName);
  if (file) {
    file.showSchema = !file.showSchema;
    if (file.showSchema) {
      try {
        const schemaData = await this.tableStore.showSchema(tableName);
        file.schemaData = schemaData;
        file.schemaError = '';
      } catch (error) {
        console.error('Error fetching schema:', error);
        file.schemaError = 'Error fetching schema';
        file.schemaData = [];
      }
    }
  }
},
      showRenameForm(tableName) {
        const file = this.fileStore.importedFiles.find(f => f.tableName === tableName);
        if (file) {
          file.showRenameForm = !file.showRenameForm;
        }
      },
      async renameTable(oldTableName) {
        const file = this.fileStore.importedFiles.find(f => f.tableName === oldTableName);
        if (!file) return;
        const newTableName = file.newName.trim();
        if (newTableName && newTableName !== oldTableName) {
          try {
            const result = await this.tableStore.renameTable(oldTableName, newTableName);
            file.tableName = newTableName;
            file.showRenameForm = false;
            file.newName = '';
            alert(result);
          } catch (error) {
            alert(`Error renaming table: ${error.message}`);
          }
        } else {
          alert('Please enter a valid new table name');
        }
      },
      toggleOptions(tableName) {
        const file = this.fileStore.importedFiles.find(f => f.tableName === tableName);
        if (file) {
          file.showOptions = !file.showOptions;
        }
      }
    }
  }
  </script>