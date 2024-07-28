<template>
    <textarea :id="`${blockId}-input`" rows="5" placeholder="Enter your SQL query here"></textarea>
    <button v-on:click="runQueryBlock(blockId)">Run Query</button>
    <button :id="`${blockId}-export`" style="">Export as CSV</button>
    <div v-if="displayOutput" class="output-block" :id="`${blockId}-output`">
        <div v-if="isError">{{ errorMsg }}</div>
        <!-- <div v-if="data.length===0"> Query returned no results </div> -->
        <table>
            <thead>
            <tr>
                <th v-for="h in headers">{{ h }}</th>
            </tr>
            </thead>
            <tbody>
                <tr v-for="row in data.slice(0,5)">
                    <td v-for="header in headers">{{row[header]}}</td>
                </tr>
            </tbody>
        </table>
        <div v-if="data.length > 5"> Showing 5 of {{ data.length }} rows</div>
    </div>
</template>

<script>
import {conn} from '../duck'
export default {
    name: 'QueryBlock',
    data() {
        return {
        conn: conn,
        outputElement: '',
        headers: null,
        data: [],
        tableHtmlText: '',
        isError: false,
        errorMsg: '',
        displayOutput: false
        }
    },
    props: {
        blockId: Number
    },
    methods: {
        async runQuery(queryInput, outputElement, exportButton) {
            const query = queryInput.value;
            try {
                const result = await this.conn.query(query);
                this.data = result.toArray().map((row) => {
                    const newRow = {};
                    for (const [key, value] of Object.entries(row)) {
                        newRow[key] =
                            typeof value === "bigint"
                                ? value.toString()
                                : value;
                    }
                    return newRow;
                });
                this.displayOutput = true
                console.log("data", this.data)
                this.displayTable(this.data, outputElement, exportButton);
                exportButton.onclick = () => exportCSV(this.data);
            }
            catch (error) {
                this.isError = true
                console.log("error")
                this.errorMsg = `Error: ${error.message}`;
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
        runQueryBlock(blockId) {
            console.log("running query")
            const queryInput = document.getElementById(`${blockId}-input`);
            const outputElement = document.getElementById(`${blockId}-output`);
            const exportButton = document.getElementById(`${blockId}-export`);
            this.runQuery(queryInput, outputElement, exportButton);
        },
        displayTable(data, outputElement, exportButton) {
            if (this.data.length === 0) {
                return;
            }
            this.headers = Object.keys(data[0]);

        },

        
    }

}
</script>