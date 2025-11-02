<template>
  <div class="flex items-center justify-center h-screen">
    <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center">Login</h2>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <Password id="password" v-model="password" class="w-full mt-1" :feedback="false" />
        </div>
        <Button type="submit" label="Login" class="w-full" :loading="loading" />
        <Message v-if="error" severity="error">{{ error }}</Message>
        <Message v-if="success" severity="success">Login successful! Redirecting...</Message>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter, useRoute } from 'vue-router';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const password = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

async function handleLogin() {
  loading.value = true;
  error.value = null;
  success.value = false;

  try {
    await userStore.login(password.value);
    success.value = true;
    setTimeout(() => {
      const redirect = route.query.redirect as string || '/';
      router.push(redirect);
    }, 1000);
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>
