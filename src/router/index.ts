import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import userLogin from "@/views/userLogin.vue";
import Home from "@/views/Home.vue";

const routes = [
  {
    path: "/user/login",
    name: "userLogin",
    component: userLogin,
  },
  {
    path: "/",
    name: "home",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/outbounds",
    name: "outbounds",
    component: () => import("@/views/outboundsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/outbounds/new",
    name: "newOutbound",
    component: () => import("@/views/editOutbound.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/outbounds/edit/:id",
    name: "editOutbound",
    component: () => import("@/views/editOutbound.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/rulesets",
    name: "ruleSets",
    component: () => import("@/views/ruleSets.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/rulesets/new",
    name: "newRuleSet",
    component: () => import("@/views/editRuleSet.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/rulesets/edit/:id",
    name: "editRuleSet",
    component: () => import("@/views/editRuleSet.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profiles",
    name: "profiles",
    component: () => import("@/views/profiles.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profiles/new",
    name: "newProfile",
    component: () => import("@/views/editProfile.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profiles/:id",
    name: "editProfile",
    component: () => import("@/views/editProfile.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !userStore.token) {
    next({
      name: "userLogin",
      query: { redirect: to.fullPath },
    });
  } else {
    next();
  }
});

export default router;
