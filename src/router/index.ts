import { createRouter, createWebHistory } from 'vue-router'
import OutboundsView from '../views/OutboundsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/outbounds',
      name: 'Outbounds',
      component: () => import('../views/OutboundsView.vue'),
    },
  ],
})

export default router
