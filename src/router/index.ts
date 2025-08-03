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
      path: '/inbounds',
      name: 'Inbounds',
      component: () => import('../views/InboundsView.vue'),
    },
    {
      path: '/inbounds/create',
      name: 'InboundsCreate',
      component: () => import('../views/InboundsCreateView.vue'),
    },
    {
      path: '/inbounds/:id/edit',
      name: 'InboundsEdit',
      component: () => import('../views/InboundsEditView.vue'),
    },
    {
      path: '/route-rules',
      name: 'RouteRules',
      component: () => import('../views/RouteRulesView.vue'),
    },
    {
      path: '/route-rules/create',
      name: 'RouteRulesCreate',
      component: () => import('../views/RouteRulesCreateView.vue'),
    },
    {
      path: '/route-rules/edit/:id',
      name: 'RouteRulesEdit',
      component: () => import('../views/RouteRulesEditView.vue'),
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
      path: '/dns-servers',
      name: 'DNSServers',
      component: () => import('../views/DNSServersView.vue'),
    },
    {
      path: '/dns-servers/create',
      name: 'DNSServersCreate',
      component: () => import('../views/DNSServersCreateView.vue'),
    },
    {
      path: '/dns-servers/:id/edit',
      name: 'DNSServersEdit',
      component: () => import('../views/DNSServersEditView.vue'),
      props: true
    },
    {
      path: '/dns-rules',
      name: 'DNSRules',
      component: () => import('../views/DNSRulesView.vue'),
    },
    {
      path: '/dns-rules/create',
      name: 'DNSRulesCreate',
      component: () => import('../views/DNSRulesCreateView.vue'),
    },
    {
      path: '/dns-rules/:id/edit',
      name: 'DNSRulesEdit',
      component: () => import('../views/DNSRulesEditView.vue'),
      props: true
    },
    {
      path: '/endpoints',
      name: 'Endpoints',
      component: () => import('../views/EndpointsView.vue'),
    },
    {
      path: '/endpoints/create',
      name: 'EndpointsCreate',
      component: () => import('../views/EndpointsCreateView.vue'),
    },
    {
      path: '/endpoints/edit/:id',
      name: 'EndpointsEdit',
      component: () => import('../views/EndpointsEditView.vue'),
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
