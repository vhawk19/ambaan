import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import {faPlay, faSquarePlus, faTrash } from '@fortawesome/free-solid-svg-icons'
// import { faSquarePlus } from '@fortawesome/free-regular-svg-icons'

/* add icons to the library */
library.add(faPlay, faTrash, faSquarePlus)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
