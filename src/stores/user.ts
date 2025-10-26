import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token'));
  const router = useRouter();

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }

  function clearToken() {
    token.value = null;
    localStorage.removeItem('token');
  }

  async function authorizedRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (token.value) {
      headers.set('Authorization', `Bearer ${token.value}`);
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      clearToken();
      router.push('/user/login');
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as T;
    }

    return response.json();
  }

  return { token, setToken, clearToken, authorizedRequest };
});
