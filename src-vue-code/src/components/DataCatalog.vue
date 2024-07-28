<template>
<div class="data-catalog collapsible">
    <div v-on:click="toggleCollapse('data-catalog')">
        <h2>Data Catalog</h2>  
        <span class="collapse-icon">▼</span>    
    </div>
    <input type="file" id="fileInput" accept=".csv,.parquet" />
    <button v-on:click="importFile">Import File</button>
    <div id="fileList">
        <h3>{{ fileListElement }}</h3>
        <ul class="ul">
            <li v-for="file in importedFiles" :key="file">
                <div class="table-item">
                    <h3>{{ file.tableName }}</h3>
                    <p> Original file: {{ file.fileName }} </p>
                    <div class="table-actions">
                        <button v-on:click="showSchema(file.tableName)">Show Schema</button>
                        <button v-on:click="showRenameForm(file.tableName)">Rename Table</button>
                    </div>
                    <div :id="`schema-${file.tableName}`" class="schema-display" style="display: none;">
                        <table class="schema-table">
                            <tr>
                                <th>Column Name</th>
                                <th>Type</th>
                            </tr>
                            <tr v-for="row in schemaData">
                                <td>{{row.column_name}}</td>
                                <td>{{row.column_type}}</td>
                            </tr>
                        </table>
                        <p>{{ errorMsg }}</p>
                    </div>
                    <div :id="`rename-form-${file.tableName}`" class="rename-form" style="display: none;">
                        <input type="text" :id="`new-name-${file.tableName}`" placeholder="New table name">
                        <button v-on:click="renameTable(file.tableName)">Rename</button>
                    </div>
                </div>

            </li>
        </ul>
    </div>
</div>
</template>

<script>
import * as duckdb from '@duckdb/duckdb-wasm'
import { conn, db, worker } from '../duck'
export default {
    name: 'DataCatalog',
    data() {
        return {
            importedFiles: [],
            queryBlockCounter: 1,
            conn: conn,
            db: db,
            worker: worker,
            fileListElement: "",
            schemaElement: null,
            schemaData: [],
            errorMsg: ''
        }
    },
    methods: {
        updateFileList() {
            this.fileListElement = "Imported Files:"
            if (this.importedFiles.length === 0) {
                this.fileListElement +=
                    "<p>No files imported yet.</p>";
            }

        },
        async importFile() {
            const fileInput = document.getElementById("fileInput");
            const file = fileInput.files[0];
            if (!file) {
                alert("Please select a file to import.");
                return;
            }
            const fileName = file.name;
            const fileExtension = fileName.split(".").pop().toLowerCase();
            const tableName = fileName.split(".")[0].replace(/\W/g, "_");
            try {
                if (fileExtension === "csv") {
                    await this.db.registerFileHandle(fileName, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
                    await this.conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${fileName}');`);
                }
                else if (fileExtension === "parquet") {
                    await this.db.registerFileHandle(fileName, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
                    await this.conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_parquet('${fileName}');`);
                }
                else {
                    throw new Error("Unsupported file format. Please use CSV or Parquet files.");
                }
                this.importedFiles.push({ fileName, tableName });
                this.updateFileList();
                alert(`File "${fileName}" imported successfully as table "${tableName}".`);
            }
            catch (error) {
                alert(`Error importing file: ${error.message}`);
            }
        },
        async showSchema(tableName) {
            // const schemaElement = document.getElementById(`schema-${tableName}`)
            // if (this.schemaElement != tableName && this.schemaElement!= null) 
            // if (tableName) {
                try {
                    const result = await this.conn.query(`DESCRIBE ${tableName};`)
                    this.schemaData = result.toArray()
                    console.log(this.schemaData)
                    this.schemaElement = tableName
                } catch (error) {
                    console.error('Error fetching schema:', error)
                    this.errorMsg = 'Error fetching schema'
                }
            // } else {
            //     this.schemaElement = null
            // }
        },
        showRenameForm(tableName) {
            const renameForm = document.getElementById(`rename-form-${tableName}`)
            renameForm.style.display =
            renameForm.style.display === 'none' ? 'flex' : 'none'
        },
        async renameTable(oldTableName) {
            const newNameInput = document.getElementById(`new-name-${oldTableName}`)
            const newTableName = newNameInput.value.trim()

            if (newTableName && newTableName !== oldTableName) {
                try {
                await conn.query(`ALTER TABLE ${oldTableName} RENAME TO ${newTableName};`)
                const fileIndex = this.importedFiles.findIndex(
                    (file) => file.tableName === oldTableName
                )
                if (fileIndex !== -1) {
                    this.importedFiles[fileIndex].tableName = newTableName
                }
                this.updateFileList()
                alert(`Table renamed from ${oldTableName} to ${newTableName}`)
                } catch (error) {
                    console.error('Error renaming table:', error)
                    alert(`Error renaming table: ${error.message}`)
                }
            } else {
                alert('Please enter a valid new table name')
            }
        }        
      },
}
</script>