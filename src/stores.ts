// Global client state (zustand + persist).
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  userId: string | null
  login: (userId: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      login: (userId) => set({ userId }),
      logout: () => set({ userId: null })
    }),
    { name: 'healthamed:auth' }
  )
)

interface UiState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen }))
    }),
    { name: 'healthamed:ui', partialize: (s) => ({ sidebarOpen: s.sidebarOpen })
  })
)

/** Non-persisted theme store (class toggling handled by ThemeProvider). */
interface ThemeState {
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme })
}))
