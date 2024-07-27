<script>
import QueryBlock from './QueryBlock.vue';
export default {
    name: 'QueryWorkspace',
    data() {
        return {
            queryBlockCounter: 1,
            queryBlocksElement: document.getElementById("queryBlocks"),
        }
    },
    methods: {
    },
    components: {
        QueryBlock
    }
}
</script>

<template>
    <div class="query-workspace">
        <h2>Query Workspace</h2>
        <div id="queryBlocks">
            <QueryBlock v-for="(btn, i) in queryBlockCounter" :blockId="i" />
        </div>
        <div class="add-query-btn" v-on:click="queryBlockCounter++">+</div>
    </div>
</template>

