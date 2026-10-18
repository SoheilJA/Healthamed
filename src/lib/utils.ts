import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Short deterministic id (for demo entities). */
export function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
}

/** Zero-pad a number. */
export function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0')
}

/** Clamp number between min and max. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** Simple deterministic string hash (for slot generation etc.). */
export function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Toman price formatting with Persian digits. */
export function formatToman(n: number): string {
  return n.toLocaleString('en-US')
}

/** Truncate text. */
export function truncate(text: string, max = 60): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

/** Initials for avatars (first letters of first + last word). */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + parts[parts.length - 1][0]
}

/** Deterministic avatar color from a string seed. */
const AVATAR_HUES = [157, 190, 38, 262, 340, 210, 20, 80]
export function hueOf(seed: string): number {
  return AVATAR_HUES[hashCode(seed) % AVATAR_HUES.length]
}

/** Sleep helper. */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Pick a random element. */
export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
