<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';

const router = useRouter();
const userStore = useUserStore();

const menuItems = ref([
  {
    label: 'Home',
    icon: 'pi pi-home',
    command: () => router.push('/')
  },
  {
    label: 'Profiles',
    icon: 'pi pi-file',
    command: () => router.push('/profiles')
  },
  {
    label: 'Outbounds',
    icon: 'pi pi-send',
    command: () => router.push('/outbounds')
  },
  {
    label: 'Rule Sets',
    icon: 'pi pi-list',
    command: () => router.push('/rulesets')
  }
]);

const handleLogout = () => {
  userStore.logout();
};
</script>

<template>
  <div class="navbar-wrapper">
    <Menubar :model="menuItems" class="mb-4">
      <template #start>
        <div class="flex items-center gap-2 mr-4">
          <i class="pi pi-cloud text-2xl text-primary"></i>
          <span class="font-bold text-xl">A-Cup</span>
        </div>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <Button
            label="Logout"
            icon="pi pi-sign-out"
            @click="handleLogout"
            severity="secondary"
            text
          />
        </div>
      </template>
    </Menubar>
  </div>
</template>

<style scoped>
.navbar-wrapper {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--surface-ground);
}
</style>
