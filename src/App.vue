<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'
import UserLogin from '@/components/userLogin/userLogin.vue'

const userStore = useUserStore()
const drawer = ref(false)

const navItems = [
  { title: 'Profiles', to: '/profiles' },
  { title: 'Outbounds', to: '/outbounds' },
  { title: 'Inbounds', to: '/inbounds' },
  { title: 'Endpoints', to: '/endpoints' },
  { title: 'Route Rules', to: '/route-rules' },
  { title: 'Rule Sets', to: '/rule-sets' },
  { title: 'DNS Servers', to: '/dns-servers' },
  { title: 'DNS Rules', to: '/dns-rules' }
]
</script>

<template>
  <v-app>
    <!-- Show login form when not logged in -->
    <div v-if="!userStore.isLoggedIn" class="login-container">
      <UserLogin />
    </div>

    <div v-else>
      <v-app-bar elevation="1">
        <v-container>
          <v-row align="center" style="flex-wrap:nowrap">
            <!-- Mobile menu button -->
            <v-col cols="auto" class="d-md-none">
              <v-btn
                icon
                @click="drawer = !drawer"
                variant="text"
              >
                <v-icon>mdi-menu</v-icon>
              </v-btn>
            </v-col>
            
            <!-- Desktop navigation -->
            <v-col class="d-none d-md-flex">
              <nav class="nav-links">
                <RouterLink to="/profiles">Profiles</RouterLink>
                <RouterLink to="/outbounds">Outbounds</RouterLink>
                <RouterLink to="/inbounds">Inbounds</RouterLink>
                <RouterLink to="/endpoints">Endpoints</RouterLink>
                <RouterLink to="/route-rules">Route Rules</RouterLink>
                <RouterLink to="/rule-sets">Rule Sets</RouterLink>
                <RouterLink to="/dns-servers">DNS Servers</RouterLink>
                <RouterLink to="/dns-rules">DNS Rules</RouterLink>
              </nav>
            </v-col>
            
            <v-col cols="auto">
              <v-btn @click="userStore.logout" variant="outlined" color="primary">
                Logout
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-app-bar>

      <!-- Mobile navigation drawer -->
      <v-navigation-drawer
        v-model="drawer"
        temporary
        class="d-md-none"
      >
        <v-list>
          <v-list-item
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            @click="drawer = false"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <v-container>
          <RouterView />
        </v-container>
      </v-main>
    </div>
  </v-app>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-links a {
  text-decoration: none;
  color: inherit;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 0.875rem;
}

.nav-links a:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.nav-links a.router-link-active {
  background-color: rgba(var(--v-theme-primary), 0.2);
  color: rgb(var(--v-theme-primary));
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .nav-links a {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 960px) {
  .nav-links {
    gap: 0.25rem;
  }
  .nav-links a {
    padding: 0.5rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
