<template>
    <div class="display-pane collapsible">
    <h2 onclick="toggleCollapse('display-pane')">Display Pane <span class="collapse-icon">▼</span></h2>
    <div class="content">
        <div id="displayArea"></div>
        <button id="exportPdfBtn">Export to PDF</button>
    </div>
    </div>
</template>

<script>
export default {
    name: 'DisplayPane',
}
</script>