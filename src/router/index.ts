import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/outbounds'
    },
    {
      path: '/outbounds',
      name: 'OutboundsList',
      component: () => import('../views/OutboundsView.vue'),
    },
    {
      path: '/outbounds/create',
      name: 'OutboundsCreate',
      component: () => import('../views/OutboundsCreateView.vue'),
    },
    {
      path: '/outbounds/edit/:id',
      name: 'OutboundsEdit',
      component: () => import('../views/OutboundsEditView.vue'),
      props: true
    },
    
    {
      path: '/rule-sets',
      name: 'RuleSets',
      component: () => import('../views/RuleSetsView.vue'),
    },
    {
      path: '/rule-sets/create',
      name: 'RuleSetsCreate',
      component: () => import('../views/RuleSetsCreateView.vue'),
    },
    {
      path: '/rule-sets/edit/:id',
      name: 'RuleSetsEdit',
      component: () => import('../views/RuleSetsEditView.vue'),
      props: true
    },
    
    {
      path: '/profiles',
      name: 'Profiles',
      component: () => import('../views/ProfilesView.vue'),
    },
    {
      path: '/profiles/create',
      name: 'ProfilesCreate',
      component: () => import('../views/ProfilesCreateView.vue'),
    },
    {
      path: '/profiles/:id/edit',
      name: 'ProfilesEdit',
      component: () => import('../views/ProfilesEditView.vue'),
      props: true
    },
  ],
})

export default router
