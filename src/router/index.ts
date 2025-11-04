import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import EditProfile from "@/views/editProfile.vue";
import NewProfile from "@/views/newProfile.vue";

const routes = [
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

export default router;
