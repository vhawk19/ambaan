<template>
    <NuxtRouteAnnouncer />
    <div class="container">
            <DataCatalog />
            <QueryWorkspace />
            <DisplayPane/>
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
    ul {
        color: black;
    }
</style>
<script>
import QueryBlock from './components/QueryBlock.vue';
import DataCatalog from './components/DataCatalog.vue';
import DisplayPane from './components/DisplayPane.vue';
import QueryWorkspace from './components/QueryWorkspace.vue';
export default {
    methods: {},
    async beforeCreate() {
        console.log("Started here")
    },
    components: { QueryBlock, DataCatalog, DisplayPane, QueryWorkspace },
}
</script>