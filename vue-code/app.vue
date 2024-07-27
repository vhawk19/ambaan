<template>
  <div>
    <NuxtRouteAnnouncer />
    <div>Ambaan</div>
    <div class="container">
            <div class="data-catalog">
                <h2>Data Catalog</h2>
                <input type="file" id="fileInput" accept=".csv,.parquet" />
                <button v-on:click="importFile">Import File</button>
                <div id="fileList"></div>
            </div>
            <div class="query-workspace">
                <h2>Query Workspace</h2>
                <div id="queryBlocks">
                <QueryBlock v-for="(btn, i) in queryBlockCounter" :blockId="i" />
                </div>
                <div class="add-query-btn" v-on:click="queryBlockCounter++">+</div>
            </div>
    </div>
  </div>
</template>
<style>
    body,
    html {
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
        display: none;
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
<script setup>
// alternatively, you can also use it here
const { $hello } = useNuxtApp()
</script>
<script>
import QueryBlock from './components/QueryBlock.vue';
// import DuckDB from '@duckdb/duckdb-wasm'
export default {
    data() {
        return {
            importedFiles: [],
            queryBlockCounter: 1,
            queryBlocksElement: document.getElementById("queryBlocks"),
            // conn: duckdb
            // db: null,
            // worker: worker
        }
    },
    methods: {
        updateFileList() {
            fileListElement.innerHTML = "<h3>Imported Files:</h3>";
            if (importedFiles.length === 0) {
                fileListElement.innerHTML +=
                    "<p>No files imported yet.</p>";
            }
            else {
                const ul = document.createElement("ul");
                importedFiles.forEach((file) => {
                    const li = document.createElement("li");
                    li.textContent = `${file.fileName} (Table: ${file.tableName})`;
                    ul.appendChild(li);
                });
                fileListElement.appendChild(ul);
            }
        },
        displayTable(data, outputElement, exportButton) {
            outputElement.style.display = "block";
            if (data.length === 0) {
                outputElement.innerHTML = "This query returned no results.";
                exportButton.style.display = "none";
                return;
            }
            const headers = Object.keys(data[0]);
            let tableHtml = "<table><thead><tr>";
            headers.forEach((header) => {
                tableHtml += `<th>${header}</th>`;
            });
            tableHtml += "</tr></thead><tbody>";
            data.slice(0, 5).forEach((row) => {
                tableHtml += "<tr>";
                headers.forEach((header) => {
                    tableHtml += `<td>${row[header]}</td>`;
                });
                tableHtml += "</tr>";
            });
            tableHtml += "</tbody></table>";
            if (data.length > 5) {
                tableHtml += `<p>Showing 5 of ${data.length} rows.</p>`;
            }
            outputElement.innerHTML = tableHtml;
            exportButton.style.display = "inline-block";
        },
        // async runQuery(queryInput, outputElement, exportButton) {
        //     const query = queryInput.value;
        //     try {
        //         const result = await conn.query(query);
        //         const data = result.toArray().map((row) => {
        //             const newRow = {};
        //             for (const [key, value] of Object.entries(row)) {
        //                 newRow[key] =
        //                     typeof value === "bigint"
        //                         ? value.toString()
        //                         : value;
        //             }
        //             return newRow;
        //         });
        //         displayTable(data, outputElement, exportButton);
        //         exportButton.onclick = () => exportCSV(data);
        //     }
        //     catch (error) {
        //         outputElement.style.display = "block";
        //         outputElement.innerHTML = `Error: ${error.message}`;
        //         exportButton.style.display = "none";
        //     }
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
                    await this.$db.registerFileHandle(fileName, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
                    await this.$conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${fileName}');`);
                }
                else if (fileExtension === "parquet") {
                    await this.$db.registerFileHandle(fileName, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
                    await this.$conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_parquet('${fileName}');`);
                }
                else {
                    throw new Error("Unsupported file format. Please use CSV or Parquet files.");
                }
                importedFiles.push({ fileName, tableName });
                updateFileList();
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
            // queryBlock.innerHTML = `
            //     <textarea id="${blockId}-input" rows="5" placeholder="Enter your SQL query here"></textarea>
            //     <button onclick="runQueryBlock('${blockId}')">Run Query</button>
            //     <button id="${blockId}-export" style="display: none;">Export as CSV</button>
            //     <div id="${blockId}-output" class="output-block"></div>
            // `;
            // this.queryBlocksElement.appendChild(queryBlock);
        },
        // runQueryBlock(blockId) {
        //     const queryInput = document.getElementById(`${blockId}-input`);
        //     const outputElement = document.getElementById(`${blockId}-output`);
        //     const exportButton = document.getElementById(`${blockId}-export`);
        //     runQuery(queryInput, outputElement, exportButton);
        // },
      },
    async beforeCreate() {
        // this.db = await DuckDB.init()
        console.log("something")
    },
    //         const MANUAL_BUNDLES = {
    //             mvp: {
    //                 mainModule: duckdb_wasm,
    //                 mainWorker: mvp_worker,
    //             },
    //             eh: {
    //                 mainModule: duckdb_wasm_next,
    //                 mainWorker: eh_worker,
    //             },
    //         };

        
    //         const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    //         const worker = new Worker(bundle.mainWorker);
    //         const logger = new duckdb.ConsoleLogger();
    //         this.db = new duckdb.AsyncDuckDB(logger, worker);
    //         await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    //         this.conn = await this.db.connect();
    // },
    components: { QueryBlock },
}
</script>
