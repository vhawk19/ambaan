<template>
    <textarea :id="`${blockId}-input`" rows="5" placeholder="Enter your SQL query here"></textarea>
    <button v-on:click="runQueryBlock(blockId)">Run Query</button>
    <button :id="`${blockId}-export`" style="display: none;">Export as CSV</button>
    <div class="output-block" :id="`${blockId}-output`">
        <div v-if="isError">{{ errorMsg }}</div>
        <div v-if="data.length===0"> Query returned no results </div>
        <div> Chumma Result</div>
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
        errorMsg: ''
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
                console.log("data", this.data)
                this.displayTable(this.data, outputElement, exportButton);
                exportButton.onclick = () => exportCSV(this.data);
            }
            catch (error) {
                this.isError = true
                // outputElement.style.display = "block";
                console.log("error")
                this.errorMsg = `Error: ${error.message}`;
                // exportButton.style.display = "none";
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
            // outputElement.style.display = "block";
            if (this.data.length === 0) {
                // this.outputElement = "This query returned no results.";
                // exportButton.style.display = "none";
                return;
            }
            this.headers = Object.keys(data[0]);
            // let tableHtml = "<table><thead><tr>";
            // headers.forEach((header) => {
            //     tableHtml += `<th>${header}</th>`;
            // });
            // tableHtml += "</tr></thead><tbody>";
            // data.slice(0, 5).forEach((row) => {
            //     tableHtml += "<tr>";
            //     headers.forEach((header) => {
            //         tableHtml += `<td>${row[header]}</td>`;
            //     });
            //     tableHtml += "</tr>";
            // });
            // tableHtml += "</tbody></table>";
            // if (this.data.length > 5) {
            //     this.tableHtml += `<p>Showing 5 of ${data.length} rows.</p>`;
            // }
            // outputElement.innerHTML = tableHtml;
            // exportButton.style.display = "inline-block";
        },
    }

}
</script>