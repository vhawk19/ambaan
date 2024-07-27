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
                {{ file.fileName }} Table {{ file.tableName }}
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
            fileListElement: ""
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

      },
}
</script>