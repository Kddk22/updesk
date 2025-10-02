import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Desktop from './views/Desktop.vue'

// App-Komponenten importieren
import FlowUp from './views/apps/FlowUp.vue'
import UpSum from './views/apps/UpSum.vue'
import UpNote from './views/apps/UpNote.vue'
import PortDocumentation from './views/apps/PortDocumentation.vue'

// Global styles
import './styles/main.css'

// Router configuration
const routes = [
  {
    path: '/',
    name: 'Desktop',
    component: Desktop
  },
  {
    path: '/apps/upflow',
    name: 'FlowUp',
    component: FlowUp
  },
  {
    path: '/apps/upsum',
    name: 'UpSum',
    component: UpSum
  },
  {
    path: '/apps/upnote',
    name: 'UpNote',
    component: UpNote
  },
  {
    path: '/apps/portdocumentation',
    name: 'PortDocumentation',
    component: PortDocumentation
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Pinia store
const pinia = createPinia()

// Create and mount app
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')