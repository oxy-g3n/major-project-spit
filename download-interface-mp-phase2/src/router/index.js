import { createRouter, createWebHashHistory } from 'vue-router'
import DownloadButton from '../components/DownloadButton.vue'

const routes = [
  {
    path: '/',
    name: 'download',
    component: DownloadButton
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
