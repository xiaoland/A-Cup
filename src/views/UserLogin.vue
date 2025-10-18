<template>
  <Card class="w-full max-w-md">
    <template #title>
      <div class="text-center text-2xl font-bold">Login</div>
    </template>
    <template #content>
      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div class="p-fluid">
          <div class="field">
            <label for="username">Username</label>
            <InputText
              id="username"
              v-model="username"
              :invalid="!isUsernameValid"
            />
            <small v-if="!isUsernameValid" class="p-error">Username is required.</small>
          </div>
          <div class="field">
            <label for="password">Password</label>
            <Password
              id="password"
              v-model="password"
              :invalid="!isPasswordValid"
              :feedback="false"
              toggleMask
            />
            <small v-if="!isPasswordValid" class="p-error">Password is required.</small>
          </div>
        </div>

        <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>

        <Button
          type="submit"
          label="Login"
          :loading="isLoading"
          :disabled="!isFormValid"
        />
      </form>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import type { LoginCredentials } from './types'

const userStore = useUserStore()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const isUsernameValid = computed(() => !!username.value)
const isPasswordValid = computed(() => !!password.value)
const isFormValid = computed(() => isUsernameValid.value && isPasswordValid.value)

const handleLogin = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const credentials: LoginCredentials = {
      username: username.value,
      password: password.value,
    }

    await userStore.login(credentials)
  } catch (error: any) {
    if (error.status === 404) {
      errorMessage.value = 'User not found'
    } else if (error.status === 401) {
      errorMessage.value = 'Invalid password'
    } else {
      errorMessage.value = 'Login failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>