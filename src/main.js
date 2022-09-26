import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './assets/style.css'

createPinia().use('#app')
createApp(App).mount('#app')
