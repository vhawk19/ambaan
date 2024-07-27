<template>
    <textarea id="${blockId}-input" rows="5" placeholder="Enter your SQL query here"></textarea>
    <button v-on:click="runQueryBlock('${blockId}')">Run Query</button>
    <button id="${blockId}-export" style="display: none;">Export as CSV</button>
    <div id="${blockId}-output" class="output-block"></div>
</template>

<script>

export default {
    name: 'QueryBlock',
    // data() {
    //     return {
    //     conn: this.$conn
    //     }
    // },
    props: {
        blockId: Number
    },
    methods: {
        async runQuery(queryInput, outputElement, exportButton) {
            const query = queryInput.value;
            try {
                const result = await this.$conn.query(query);
                const data = result.toArray().map((row) => {
                    const newRow = {};
                    for (const [key, value] of Object.entries(row)) {
                        newRow[key] =
                            typeof value === "bigint"
                                ? value.toString()
                                : value;
                    }
                    return newRow;
                });
                displayTable(data, outputElement, exportButton);
                exportButton.onclick = () => exportCSV(data);
            }
            catch (error) {
                outputElement.style.display = "block";
                outputElement.innerHTML = `Error: ${error.message}`;
                exportButton.style.display = "none";
            }
        },
        runQueryBlock(blockId) {
            console.log("running query")
            const queryInput = document.getElementById(`${blockId}-input`);
            const outputElement = document.getElementById(`${blockId}-output`);
            const exportButton = document.getElementById(`${blockId}-export`);
            this.runQuery(queryInput, outputElement, exportButton);
        },
    }

}
</script>