<template>
  <v-card class="user-login" max-width="400" min-width="300" elevation="2">
    <v-card-title class="text-h5 text-center">
      Login
    </v-card-title>
    
    <v-card-text>
      <v-form ref="form" @submit.prevent="handleLogin">
        <v-text-field
          v-model="username"
          label="Username"
          :rules="usernameRules"
          required
          variant="outlined"
          class="mb-3"
        />
        
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          :rules="passwordRules"
          required
          variant="outlined"
          class="mb-3"
        />
        
        <v-alert
          v-if="errorMessage"
          type="error"
          class="mb-3"
          :text="errorMessage"
        />
        
        <v-btn
          type="submit"
          color="primary"
          block
          :loading="isLoading"
          :disabled="!isFormValid"
        >
          Login
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import type { LoginCredentials, LoginResponse } from './types'

const userStore = useUserStore()

const form = ref()
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const usernameRules = [
  (v: string) => !!v || 'Username is required',
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
]

const isFormValid = computed(() => {
  return username.value && password.value
})

const handleLogin = async () => {
  if (!form.value?.validate()) return
  
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