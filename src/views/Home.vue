<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useProfileStore } from '@/stores/profile';
import Card from 'primevue/card';
import Button from 'primevue/button';

const router = useRouter();
const userStore = useUserStore();
const profileStore = useProfileStore();

const stats = ref({
  profiles: 0,
  outbounds: 0,
  ruleSets: 0
});

onMounted(async () => {
  try {
    // Fetch basic stats
    const profilesData = await userStore.authorizedRequest<any[]>('/api/profiles');
    stats.value.profiles = profilesData?.length || 0;

    const outboundsData = await userStore.authorizedRequest<any[]>('/api/outbounds');
    stats.value.outbounds = outboundsData?.length || 0;

    const ruleSetsData = await userStore.authorizedRequest<any[]>('/api/rulesets');
    stats.value.ruleSets = ruleSetsData?.length || 0;
  } catch (err) {
    console.error('Failed to fetch stats:', err);
  }
});

const quickActions = [
  {
    title: 'Profiles',
    icon: 'pi pi-file',
    description: 'Manage your Sing-Box proxy profiles',
    color: '#3b82f6',
    route: '/profiles',
    action: 'View Profiles',
    statKey: 'profiles'
  },
  {
    title: 'Outbounds',
    icon: 'pi pi-send',
    description: 'Configure proxy outbound connections',
    color: '#10b981',
    route: '/outbounds',
    action: 'View Outbounds',
    statKey: 'outbounds'
  },
  {
    title: 'Rule Sets',
    icon: 'pi pi-list',
    description: 'Create and manage routing rule sets',
    color: '#f59e0b',
    route: '/rulesets',
    action: 'View Rule Sets',
    statKey: 'ruleSets'
  }
];

const navigateTo = (route: string) => {
  router.push(route);
};
</script>

<template>
  <div class="home-container p-4 md:p-6">
    <!-- Welcome Section -->
    <div class="welcome-section mb-6">
      <h1 class="text-4xl font-bold mb-2">Welcome to A-Cup</h1>
      <p class="text-xl text-gray-600 dark:text-gray-400">
        Manage your proxy configurations with ease
      </p>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card v-for="action in quickActions" :key="action.title" class="stat-card">
        <template #header>
          <div class="flex items-center justify-between p-4 pb-0">
            <div
              class="icon-wrapper p-3 rounded-lg"
              :style="{ backgroundColor: action.color + '20' }"
            >
              <i :class="action.icon" class="text-2xl" :style="{ color: action.color }"></i>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold">{{ stats[action.statKey as keyof typeof stats] }}</div>
              <div class="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </template>
        <template #title>
          <div class="text-xl font-semibold">{{ action.title }}</div>
        </template>
        <template #content>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ action.description }}
          </p>
        </template>
        <template #footer>
          <Button
            :label="action.action"
            :icon="action.icon"
            @click="navigateTo(action.route)"
            class="w-full"
            :style="{ backgroundColor: action.color, borderColor: action.color }"
          />
        </template>
      </Card>
    </div>

    <!-- Quick Start Guide -->
    <Card class="quick-start-card">
      <template #title>
        <div class="flex items-center gap-2">
          <i class="pi pi-info-circle text-primary"></i>
          <span>Quick Start Guide</span>
        </div>
      </template>
      <template #content>
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 class="font-semibold mb-1">Create Outbounds</h3>
              <p class="text-gray-600 dark:text-gray-400">
                Set up your proxy servers (VLESS, VMESS, Shadowsocks, etc.)
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 class="font-semibold mb-1">Configure Rule Sets</h3>
              <p class="text-gray-600 dark:text-gray-400">
                Define routing rules for traffic management
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 class="font-semibold mb-1">Build Profiles</h3>
              <p class="text-gray-600 dark:text-gray-400">
                Combine outbounds and rules into complete Sing-Box profiles
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h3 class="font-semibold mb-1">Deploy & Share</h3>
              <p class="text-gray-600 dark:text-gray-400">
                Export or host your profiles on Cloudflare R2
              </p>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  padding: 2rem 0;
}

.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.quick-start-card {
  margin-top: 2rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
