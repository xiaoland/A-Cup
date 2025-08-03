import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'

export function useTheme() {
  const isDark = ref(false)
  const vuetifyTheme = useVuetifyTheme()

  let mediaQuery: MediaQueryList

  const updateTheme = (matches: boolean) => {
    isDark.value = matches
    vuetifyTheme.global.name.value = matches ? 'dark' : 'light'
  }

  const handleThemeChange = (e: MediaQueryListEvent) => {
    updateTheme(e.matches)
  }

  onMounted(() => {
    // Check if window is available (for SSR compatibility)
    if (typeof window !== 'undefined') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      // Set initial theme
      updateTheme(mediaQuery.matches)
      
      // Listen for changes
      mediaQuery.addEventListener('change', handleThemeChange)
    }
  })

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleThemeChange)
    }
  })

  return {
    isDark,
    updateTheme,
  }
}
