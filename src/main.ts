import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import { registerBuiltInNodes } from './core/node-registrations'

// 初始化节点注册
registerBuiltInNodes()

const app = createApp(App)
app.use(createPinia())
app.mount('#app')

