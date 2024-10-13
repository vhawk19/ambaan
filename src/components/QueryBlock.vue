<template>
  <div class="bg-gray-900 rounded-lg shadow-md p-6 mb-6 text-white">
    <textarea
      v-model="query"
      rows="5"
      class="w-full p-2 mb-4 border border-gray-300 rounded bg-gray-800 text-white resize-vertical"
      placeholder="Enter your SQL query here"
    ></textarea>
    <div class="flex space-x-4 mb-4">
      <font-awesome-icon
        icon="fa-solid fa-play"
        style="color: rgb(34, 197, 94)"
        @click="runQueryBlock"
        cursor="pointer"
        size="2xl"
        title="Run query"
      />
      <font-awesome-icon
        icon="fa-solid fa-trash"
        size="2xl"
        style="color: #ffffff"
        @click="clearQueryBlock"
        cursor="pointer"
        title="Clear query"
      />
    </div>
    <div v-if="block.result || block.error" class="mt-6">
      <div class="flex justify-between items-center mb-4">
        <span v-if="block.result" class="font-bold"
          >{{ block.result.length }} row(s) returned</span
        >
        <div class="flex space-x-4">
          <button
            @click="addVisualization"
            class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Add Visualization
          </button>
          <button
            @click="addToDisplayPane"
            class="bg-white text-green-600 font-bold py-2 px-4 rounded"
          >
            Add to Display Pane
          </button>
          <button
            @click="exportToCSV"
            class="bg-white text-green-600 font-bold py-2 px-4 rounded"
          >
            Export as CSV
          </button>
        </div>
      </div>
      <div class="flex border-b border-gray-200 mb-4">
        <button
          class="py-2 px-4 text-sm font-medium text-center border-b-2"
          :class="{
            'border-white text-white': activeTab === 'table',
            'border-transparent hover:border-gray-300': activeTab !== 'table',
          }"
          @click="switchTab('table')"
        >
          Table
        </button>
        <button
          v-for="viz in visualizations"
          :key="viz.id"
          class="py-2 px-4 text-sm font-medium text-center border-b-2"
          :class="{
            'border-white text-white': activeTab === viz.id,
            'border-transparent hover:border-gray-300': activeTab !== viz.id,
          }"
          @click="switchTab(viz.id)"
        >
          {{ viz.name }}
        </button>
      </div>
      <div v-if="activeTab === 'table'" class="overflow-x-auto">
        <div v-if="block.error" class="text-red-500 mb-4">{{ block.error }}</div>
        <table
          v-else-if="block.result && block.result.length > 0"
          class="min-w-full divide-y divide-gray-200"
        >
          <thead class="bg-gray-600 text-white">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header"
                class="px-6 py-3 text-left text-xs font-medium text-white text-bold uppercase tracking-wider"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody class="g-gray-800 text-whitedivide-y divide-gray-200">
            <tr v-for="(row, index) in paginatedData" :key="index">
              <td
                v-for="header in tableHeaders"
                :key="header"
                class="px-6 py-4 whitespace-nowrap text-sm text-white"
              >
                {{ row[header] }}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="block.result && block.result.length > 0"
          class="flex justify-center items-center mt-4"
        >
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="bg-white text-green-600 font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span class="mx-2">Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="bg-white text-green-600 font-bold py-2 px-4 rounded ml-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <div v-for="viz in visualizations" :key="viz.id" v-show="activeTab === viz.id">
        <div class="flex space-x-4 mb-4">
          <input
            v-model="viz.name"
            @change="updateVisualization(viz)"
            class="border border-gray-300 text-black rounded px-2 py-1"
          />
          <select
            v-model="viz.chartType"
            @change="updateVisualization(viz)"
            class="border border-gray-300 text-black rounded px-2 py-1"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="scatter">Scatter Plot</option>
          </select>
          <select
            v-model="viz.xAxis"
            @change="updateVisualization(viz)"
            class="border border-gray-300 rounded px-2 py-1 text-black"
          >
            <option v-for="column in tableHeaders" :key="column" :value="column">
              {{ column }}
            </option>
          </select>
          <select
            v-model="viz.yAxis"
            @change="updateVisualization(viz)"
            class="border border-gray-300 rounded px-2 py-1 text-black"
          >
            <option v-for="column in tableHeaders" :key="column" :value="column">
              {{ column }}
            </option>
          </select>
        </div>
        <div
          :id="`${viz.id}-chart-container`"
          class="w-full h-96 border border-gray-300 rounded"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useQueryBlockStore } from "@/stores/queryBlockStore";
import { useDisplayPaneStore } from "@/stores/displayPaneStore";
import { createVisualization } from "@/utils/visualization";
import { exportCSV } from "@/utils/exportUtils";

const props = defineProps({
  blockId: {
    type: Number,
    required: true,
  },
});

const queryBlockStore = useQueryBlockStore();
const displayPaneStore = useDisplayPaneStore();

const activeTab = ref("table");
const currentPage = ref(1);
const visualizations = ref([]);
const rowsPerPage = 10;

const block = computed(() => queryBlockStore.getBlockById(props.blockId));
const query = computed({
  get: () => block.value?.query || "",
  set: (value) => queryBlockStore.setQuery(props.blockId, value),
});

const tableHeaders = computed(() => {
  if (block.value?.result && block.value.result.length > 0) {
    return Object.keys(block.value.result[0]);
  }
  return [];
});

const totalPages = computed(() => {
  if (block.value?.result) {
    return Math.ceil(block.value.result.length / rowsPerPage);
  }
  return 0;
});

const paginatedData = computed(() => {
  if (block.value?.result) {
    const start = (currentPage.value - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return block.value.result.slice(start, end);
  }
  return [];
});

async function runQueryBlock() {
  await queryBlockStore.runQuery(props.blockId);
  currentPage.value = 1;
  activeTab.value = "table";
}

function clearQueryBlock() {
  queryBlockStore.clearQuery(props.blockId);
  visualizations.value = [];
  activeTab.value = "table";
  currentPage.value = 1;
}

function updateVisualization(viz) {
  if (viz && block.value?.result) {
    nextTick(() => {
      const container = document.getElementById(`${viz.id}-chart-container`);
      if (container) {
        createVisualization(
          container,
          block.value.result,
          viz.chartType,
          viz.xAxis,
          viz.yAxis
        );
      }

      // Update the corresponding visualization in the Display Pane
      const displayItem = displayPaneStore.getItemByQueryBlockId(props.blockId, viz.id);
      if (displayItem) {
        displayPaneStore.updateItem({
          ...displayItem,
          name: viz.name,
          chartType: viz.chartType,
          xAxis: viz.xAxis,
          yAxis: viz.yAxis,
          data: block.value.result,
        });
      }
    });
  }
}

function addToDisplayPane() {
  if (block.value?.result) {
    // Use the last created visualization or a default if none exists
    const lastViz = visualizations.value[visualizations.value.length - 1] || {
      chartType: "bar",
      xAxis: tableHeaders.value[0],
      yAxis: tableHeaders.value[1],
      name: `Query Result ${props.blockId}`,
    };

    const displayItem = {
      id: `display-${Date.now()}`,
      queryBlockId: props.blockId,
      vizId: lastViz.id,
      type: "visualization",
      name: lastViz.name,
      data: block.value.result,
      query: query.value,
      chartType: lastViz.chartType,
      xAxis: lastViz.xAxis,
      yAxis: lastViz.yAxis,
    };
    console.log("Adding display item:", displayItem);
    displayPaneStore.addItem(displayItem);
  }
}

function addVisualization() {
  const vizId = `visualization-${Date.now()}`;
  const newViz = {
    id: vizId,
    name: `Visualization ${visualizations.value.length + 1}`,
    chartType: "bar",
    xAxis: tableHeaders.value[0],
    yAxis: tableHeaders.value[1],
  };

  visualizations.value.push(newViz);
  activeTab.value = vizId;
  updateVisualization(newViz);
}

// function addVisualization() {
//   const vizId = `visualization-${Date.now()}`
//   const newViz = {
//     id: vizId,
//     name: `Visualization ${visualizations.value.length + 1}`,
//     chartType: 'bar',
//     xAxis: tableHeaders.value[0],
//     yAxis: tableHeaders.value[1],
//     type: 'visualization',
//   }

//   visualizations.value.push(newViz)
//   activeTab.value = vizId
//   updateVisualization(newViz)
//   console.log(newViz)
//   // displayPaneStore.addItem(newViz)
// }

// function updateVisualization(viz) {
//   if (viz && block.value?.result) {
//     nextTick(() => {
//       const container = document.getElementById(`${viz.id}-chart-container`)
//       if (container) {
//         createVisualization(container, block.value.result, viz.chartType, viz.xAxis, viz.yAxis)
//       }
//     })
//   }
// }

function exportToCSV() {
  if (block.value?.result) {
    exportCSV(block.value.result, `query_result_${props.blockId}`);
  }
}

function switchTab(tabName) {
  activeTab.value = tabName;
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

watch(
  () => block.value?.result,
  () => {
    visualizations.value.forEach((viz) => updateVisualization(viz));
  }
);

onMounted(() => {
  if (block.value?.result) {
    visualizations.value.forEach((viz) => updateVisualization(viz));
  }
});
</script>
