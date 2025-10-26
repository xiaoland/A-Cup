import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import userLogin from '@/views/userLogin.vue';

const routes = [
  {
    path: '/user/login',
    name: 'userLogin',
    component: userLogin,
  },
  {
    path: '/',
    name: 'home',
    // component: () => import('@/views/Home.vue'), // Example of a protected route
    component: { template: '<div>Home</div>' }, // Placeholder for home page
    meta: { requiresAuth: true },
  },
  {
    path: '/outbounds',
    name: 'outbounds',
    component: () => import('@/views/outboundsView.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !userStore.token) {
    next({
      name: 'userLogin',
      query: { redirect: to.fullPath },
    });
  } else {
    next();
  }
});

export default router;
