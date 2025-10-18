<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'
import UserLogin from '@/views/UserLogin.vue'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Sidebar from 'primevue/sidebar'

const userStore = useUserStore()
const drawer = ref(false)

const navItems = ref([
  { label: 'Profiles', route: '/profiles' },
  { label: 'Outbounds', route: '/outbounds' },
  { label: 'Rule Sets', route: '/rule-sets' },
])
</script>

<template>
  <div class="min-h-screen bg-surface-100">
    <!-- Show login form when not logged in -->
    <div v-if="!userStore.isLoggedIn" class="login-container">
      <UserLogin />
    </div>

    <div v-else>
      <header>
        <Menubar :model="navItems" class="rounded-none">
          <template #item="{ item, props }">
            <RouterLink :to="item.route" class="flex items-center" v-bind="props.action">
              <span :class="item.icon" />
              <span class="ml-2">{{ item.label }}</span>
            </RouterLink>
          </template>
          <template #end>
            <Button
              label="Logout"
              icon="i-mdi-logout"
              severity="danger"
              @click="userStore.logout"
            />
          </template>
        </Menubar>
      </header>

      <main class="p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style>