// Shared React hooks: online status, debounce, countdown, media query,
// PWA install prompt, local draft persistence.
import { useCallback, useEffect, useRef, useState } from 'react'

export function useOnline(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  )
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function useCountdown(seconds: number): { remaining: number; start: () => void; running: boolean } {
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    setRemaining(seconds)
    setRunning(true)
  }, [seconds])

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [running])

  return { remaining, start, running }
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    setMatches(mql.matches)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt(): {
  canInstall: boolean
  promptInstall: () => Promise<void>
  isStandalone: boolean
} {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setStandalone] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setStandalone(standalone)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return
    await deferred.prompt()
    setDeferred(null)
  }, [deferred])

  return { canInstall: !!deferred, promptInstall, isStandalone }
}

/** Persist a draft (wizard etc.) in localStorage as JSON. */
export function useLocalDraft<T>(
  key: string,
  initial: T
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const storageKey = `healthamed:draft:${key}`
  const [draft, setDraft] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? ({ ...(initial as object), ...JSON.parse(raw) } as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft))
    } catch {
      // ignore quota
    }
  }, [storageKey, draft])

  const clear = useCallback(() => {
    localStorage.removeItem(storageKey)
    setDraft(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  return [draft, setDraft, clear]
}

/** Set document title per page. */
export function useDocTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} | هلثامد`
    return () => {
      document.title = 'هلثامد | سلامت دیجیتال'
    }
  }, [title])
}

/** Auto-scroll a ref element to bottom (chat). */
export function useAutoScrollBottom<T extends HTMLElement>(dep: unknown): React.RefObject<T> {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [dep])
  return ref
}
