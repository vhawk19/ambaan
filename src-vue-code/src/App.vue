<template>
    <div class="app-container m-0">
      <div class="flex h-screen w-full overflow-hidden bg-gray-900 text-white">
        <!-- Data Catalog -->
        <div 
          :class="['transition-all duration-300 ease-in-out', 
                   isDataCatalogVisible ? 'w-1/4' : 'w-0']"
        >
          <DataCatalog v-if="isDataCatalogVisible" />
        </div>
        
        <!-- Main content area -->
        <div class="flex flex-grow overflow-hidden">
          <!-- Toggle button for Data Catalog -->
          <div 
            @click="toggleDataCatalog" 
            :class="['cursor-pointer flex items-center justify-center w-6 transition-colors',
                     isDataCatalogVisible ? 'rotate-0' : 'rotate-180']"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          
          <!-- Query Workspace -->
          <div class="flex-grow overflow-auto">
            <QueryWorkspace />
          </div>
          
          <!-- Toggle button for Display Pane -->
          <div 
            @click="toggleDisplayPane" 
            :class="['cursor-pointer flex items-center justify-center w-6 transition-colors',
                     isDisplayPaneVisible ? 'rotate-180' : 'rotate-0']"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <!-- Display Pane -->
          <div 
            :class="['transition-all duration-300 ease-in-out', 
                     isDisplayPaneVisible ? 'w-1/4' : 'w-0']"
          >
            <DisplayPane v-if="isDisplayPaneVisible" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import DataCatalog from './components/DataCatalog.vue';
  import QueryWorkspace from './components/QueryWorkspace.vue';
  import DisplayPane from './components/DisplayPane.vue';
  
  export default {
    components: {
      DataCatalog,
      QueryWorkspace,
      DisplayPane,
    },
    data() {
      return {
        isDataCatalogVisible: true,
        isDisplayPaneVisible: true,
      };
    },
    methods: {
      toggleDataCatalog() {
        this.isDataCatalogVisible = !this.isDataCatalogVisible;
      },
      toggleDisplayPane() {
        this.isDisplayPaneVisible = !this.isDisplayPaneVisible;
      },
    },
  };
  </script>
  
  <style>
  /* Global styles to ensure full-width layout */
  html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  
  .app-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  </style>