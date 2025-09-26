import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Desktop from './views/Desktop.vue'

// Global styles
import './styles/main.css'

// Router configuration
const routes = [
  {
    path: '/',
    name: 'Desktop',
    component: Desktop
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