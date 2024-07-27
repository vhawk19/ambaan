<template>
    <NuxtRouteAnnouncer />
    <div class="container">
            <div class="data-catalog">
                <h2>Data Catalog</h2>
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
            <div class="query-workspace">
                <h2>Query Workspace</h2>
                <div id="queryBlocks">
                <QueryBlock v-for="(btn, i) in queryBlockCounter" :blockId="i" />
                </div>
                <div class="add-query-btn" v-on:click="queryBlockCounter++">+</div>
            </div>
    </div>
</template>
<style>
    body,
    html,
    #app {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        height: 100%;
        line-height: 1.6;
    }
    .container {
        display: flex;
        height: 100%;
    }
    .data-catalog {
        width: 30%;
        background-color: #f0f0f0;
        padding: 20px;
        overflow-y: auto;
    }
    .query-workspace {
        width: 70%;
        padding: 20px;
        overflow-y: auto;
    }
    h2 {
        margin-top: 0;
    }
    input[type="file"],
    input[type="text"],
    textarea {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
    }
    button {
        padding: 10px 20px;
        background-color: #4caf50;
        color: white;
        border: none;
        cursor: pointer;
        margin-right: 10px;
        margin-bottom: 10px;
    }
    button:hover {
        background-color: #45a049;
    }
    table {
        border-collapse: collapse;
        width: 100%;
    }
    th,
    td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2;
        position: sticky;
        top: 0;
    }
    .code-block {
        background-color: #f8f8f8;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 20px;
    }
    .output-block {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        margin-top: 10px;
        max-height: 300px;
        overflow-y: auto;
        color: black;
        /* display: none; */
    }
    .add-query-btn {
        display: block;
        width: 100%;
        text-align: center;
        font-size: 24px;
        background-color: #f0f0f0;
        border: 2px dashed #ccc;
        color: #666;
        padding: 10px;
        cursor: pointer;
    }
    .add-query-btn:hover {
        background-color: #e0e0e0;
    }
</style>
<script>
import QueryBlock from './components/QueryBlock.vue';
import * as duckdb from '@duckdb/duckdb-wasm'
import { conn, db, worker } from './duck'
export default {
    data() {
        return {
            importedFiles: [],
            queryBlockCounter: 1,
            queryBlocksElement: document.getElementById("queryBlocks"),
            conn: conn,
            db: db,
            worker: worker,
            fileListElement: ""
            // filereader: duckdb.DuckDBDataProtocol.BROWSER_FILEREADER,
        }
    },
    methods: {
        updateFileList() {
            this.fileListElement = "Imported Files:"
            // fileListElement.innerHTML = "<h3>Imported Files:</h3>";
            if (this.importedFiles.length === 0) {
                this.fileListElement +=
                    "<p>No files imported yet.</p>";
            }
            // else {
            //     const ul = document.createElement("ul");
            //     this.importedFiles.forEach((file) => {
            //         const li = document.createElement("li");
            //         li.textContent = `${file.fileName} (Table: ${file.tableName})`;
            //         ul.appendChild(li);
            //     });
            //     fileListElement.appendChild(ul);
            // }
        },
        // displayTable(data, outputElement, exportButton) {
        //     outputElement.style.display = "block";
        //     if (data.length === 0) {
        //         outputElement.innerHTML = "This query returned no results.";
        //         exportButton.style.display = "none";
        //         return;
        //     }
        //     const headers = Object.keys(data[0]);
        //     let tableHtml = "<table><thead><tr>";
        //     headers.forEach((header) => {
        //         tableHtml += `<th>${header}</th>`;
        //     });
        //     tableHtml += "</tr></thead><tbody>";
        //     data.slice(0, 5).forEach((row) => {
        //         tableHtml += "<tr>";
        //         headers.forEach((header) => {
        //             tableHtml += `<td>${row[header]}</td>`;
        //         });
        //         tableHtml += "</tr>";
        //     });
        //     tableHtml += "</tbody></table>";
        //     if (data.length > 5) {
        //         tableHtml += `<p>Showing 5 of ${data.length} rows.</p>`;
        //     }
        //     outputElement.innerHTML = tableHtml;
        //     exportButton.style.display = "inline-block";
        // },
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
        async exportCSV(data) {
            if (!data || data.length === 0) {
                alert("No data to export.");
                return;
            }
            const headers = Object.keys(data[0]);
            let csvContent = headers.join(",") + "\n";
            data.forEach((row) => {
                const values = headers.map((header) => {
                    const cell = row[header] === null ? "" : row[header];
                    return typeof cell === "string"
                        ? `"${cell.replace(/"/g, "\"\"")}"`
                        : cell;
                });
                csvContent += values.join(",") + "\n";
            });
            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "query_result.csv");
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        },
        addQueryBlock() {
            console.log("query block add");
            const blockId = `query-block-${this.queryBlockCounter++}`;
            const queryBlock = document.createElement("div");
            queryBlock.className = "code-block";
        },

      },
    async beforeCreate() {
        // this.db = await DuckDB.init()
        console.log("something")
    },
    components: { QueryBlock },
}
</script>