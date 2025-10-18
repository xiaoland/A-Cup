import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LoginCredentials, LoginResponse, User, JWTPayload } from '@/views/types'

const TOKEN_KEY = 'auth_token';

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // Decode JWT payload
  const decodeJWT = (token: string): JWTPayload | null => {
    try {
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      return decoded
    } catch {
      return null
    }
  }

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    const payload = decodeJWT(token)
    if (!payload) return true
    
    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  }

  // Initialize user from existing token
  const initializeFromToken = () => {
    if (token.value && !isTokenExpired(token.value)) {
      const payload = decodeJWT(token.value)
      if (payload) {
        user.value = {
          id: parseInt(payload.sub),
          username: '', // We don't store username in JWT
        }
      }
    } else {
      logout()
    }
  }

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await fetch(`/api/users/${credentials.username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: credentials.password
      }),
    })

    if (!response.ok) {
      const error = new Error('Login failed')
      ;(error as any).status = response.status
      throw error
    }

    const userData: LoginResponse = await response.json()
    const authToken = response.headers.get('authorization')?.replace('Bearer ', '')

    if (!authToken) {
      throw new Error('No token received')
    }

    token.value = authToken
    user.value = {
      id: userData.id,
      username: userData.username,
    }
    localStorage.setItem(TOKEN_KEY, authToken)
  }

  // Logout function
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  // Authorized fetch wrapper
  const authorizedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    if (!token.value) {
      throw new Error('No authentication token available')
    }

    if (isTokenExpired(token.value)) {
      logout()
      throw new Error('Token expired')
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token.value}`,
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }

  // Initialize on store creation
  initializeFromToken()

  return {
    token: computed(() => token.value),
    user: computed(() => user.value),
    isLoggedIn,
    login,
    logout,
    authorizedFetch,
  }
})