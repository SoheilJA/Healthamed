// Theme provider: light/dark with localStorage + system preference.
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolved: 'light',
  setTheme: () => {}
})

const STORAGE_KEY = 'healthamed:theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme) || 'light'
  )
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const r = theme === 'dark' || (theme === 'system' && systemDark) ? 'dark' : 'light'
      setResolved(r)
      root.classList.toggle('dark', r === 'dark')
      root.style.colorScheme = r
    }
    apply()
    localStorage.setItem(STORAGE_KEY, theme)
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', apply)
    return () => mql.removeEventListener('change', apply)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
