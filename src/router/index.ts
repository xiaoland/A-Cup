import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import EditProfile from "@/views/editProfile.vue";
import NewProfile from "@/views/newProfile.vue";
import UserLogin from "@/views/userLogin.vue";

const routes = [
  {
    path: "/",
    redirect: "/profiles",
  },
  {
    path: "/user/login",
    name: "UserLogin",
    component: UserLogin,
  },
  {
    path: "/profiles/:id",
    name: "EditProfile",
    component: EditProfile,
  },
  {
    path: "/profiles",
    name: "NewProfile",
    component: NewProfile,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Authentication guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.name !== "UserLogin" && !userStore.token) {
    next({ name: "UserLogin" });
  } else {
    next();
  }
});

export default router;
