<template>
    <div class="query-block bg-gray-800 p-4 rounded-lg">
      <textarea
        :id="`query-input-${blockId}`"
        v-model="queryInput"
        rows="5"
        placeholder="Enter your SQL query here"
        class="w-full bg-gray-700 text-white p-2 rounded mb-2"
      ></textarea>
      <div class="flex space-x-2 mb-2">
        <button @click="runQueryBlock" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Run Query
        </button>
        <button @click="exportCSV" :disabled="!hasData" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
          Export as CSV
        </button>
      </div>
      <div v-if="displayOutput" class="output-block bg-gray-700 p-4 rounded">
        <div v-if="isError" class="error-message text-red-500">{{ errorMsg }}</div>
        <div v-else-if="data.length === 0" class="text-gray-400">Query returned no results</div>
        <template v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-gray-900 text-white">
              <thead>
                <tr>
                  <th v-for="header in headers" :key="header" class="px-4 py-2 text-left bg-gray-800">{{ header }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in displayedData" :key="index" class="border-t border-gray-700">
                  <td v-for="header in headers" :key="header" class="px-4 py-2">{{row[header]}}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="data.length > 5" class="mt-2 text-gray-400">Showing 5 of {{ data.length }} rows</div>
        </template>
      </div>
    </div>
  </template>
  <script>
  import { conn } from '../duck'
  
  export default {
    name: 'QueryBlock',
    props: {
      blockId: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        queryInput: '',
        headers: [],
        data: [],
        isError: false,
        errorMsg: '',
        displayOutput: false
      }
    },
    computed: {
      hasData() {
        return this.data.length > 0
      },
      displayedData() {
        return this.data.slice(0, 5)
      }
    },
    methods: {
      async runQueryBlock() {
        this.isError = false
        this.errorMsg = ''
        this.displayOutput = false
        this.data = []
  
        try {
          const result = await conn.query(this.queryInput)
          this.data = result.toArray().map((row) => {
            const newRow = {}
            for (const [key, value] of Object.entries(row)) {
              newRow[key] = typeof value === "bigint" ? value.toString() : value
            }
            return newRow
          })
  
          this.displayOutput = true
          this.headers = Object.keys(this.data[0] || {})
          console.log("data", this.data)
        } catch (error) {
          this.isError = true
          this.errorMsg = `Error: ${error.message}`
          this.displayOutput = true
          console.error("Query error:", error)
        }
      },
      exportCSV() {
        if (!this.hasData) {
          alert("No data to export.")
          return
        }
  
        const csvContent = this.generateCSV()
        this.downloadCSV(csvContent)
      },
      generateCSV() {
        const headers = this.headers
        let csvContent = headers.join(",") + "\n"
        
        this.data.forEach((row) => {
          const values = headers.map((header) => {
            const cell = row[header] === null ? "" : row[header]
            return typeof cell === "string"
              ? `"${cell.replace(/"/g, '""')}"`
              : cell
          })
          csvContent += values.join(",") + "\n"
        })
  
        return csvContent
      },
      downloadCSV(csvContent) {
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob)
          link.setAttribute("href", url)
          link.setAttribute("download", `query_result_${this.blockId}.csv`)
          link.style.visibility = "hidden"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .query-block {
    margin-bottom: 20px;
  }
  
  textarea {
    width: 100%;
    margin-bottom: 10px;
  }
  
  button {
    margin-right: 10px;
  }
  
  .output-block {
    margin-top: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
  }
  
  .error-message {
    color: red;
  }
  </style>