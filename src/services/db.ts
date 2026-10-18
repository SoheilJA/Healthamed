// Local-first mock database backed by localStorage.
// All "network" latency is simulated; writes require being online
// except the offline snapshot which is persisted to IndexedDB separately.
import type { Database } from '@/types'
import { seedDatabase } from '@/data/seed'

const STORAGE_KEY = 'healthamed:db:v1'
const LATENCY = { min: 120, max: 420 }

let db: Database | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null

export class OfflineError extends Error {
  constructor(op = 'این عملیات') {
    super(`${op} نیازمند اتصال اینترنت است`)
    this.name = 'OfflineError'
  }
}

export function requireOnline(op = 'این عملیات'): void {
  if (typeof navigator !== 'undefined' && !navigator.onLine) throw new OfflineError(op)
}

/** Simulated network delay. */
export function latency(): Promise<void> {
  const ms = LATENCY.min + Math.random() * (LATENCY.max - LATENCY.min)
  return new Promise((r) => setTimeout(r, ms))
}

function load(): Database {
  if (db) return db
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      db = JSON.parse(raw) as Database
      return db
    }
  } catch {
    // corrupted storage -> reseed
  }
  db = seedDatabase()
  persistNow()
  return db
}

function persistNow(): void {
  if (!db) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (e) {
    console.error('[db] persist failed (quota?)', e)
  }
}

/** Debounced save. */
export function saveDB(): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(persistNow, 350)
}

/** Read transaction (no mutation). */
export function read<T>(fn: (database: Database) => T): T {
  return fn(load())
}

/** Write transaction: mutate + persist. Requires online. */
export function mutate<T>(fn: (database: Database) => T, op = 'ذخیره اطلاعات'): T {
  requireOnline(op)
  const result = fn(load())
  saveDB()
  return result
}

/** Write without the online requirement (offline snapshot path only). */
export function mutateLocal<T>(fn: (database: Database) => T): T {
  const result = fn(load())
  saveDB()
  return result
}

/** Next sequential id with prefix. */
export function nextId(prefix: string): string {
  const database = load()
  const seq = (database.seq[prefix] ?? 0) + 1
  database.seq[prefix] = seq
  saveDB()
  return `${prefix}${String(seq).padStart(6, '0')}`
}

/** Full reset (dev helper: window.__resetHealthamed()). */
export function resetDatabase(): void {
  db = null
  localStorage.removeItem(STORAGE_KEY)
  load()
}

export function getDB(): Database {
  return load()
}

if (typeof window !== 'undefined') {
  // Expose a reset hook for demos/dev
  ;(window as unknown as Record<string, unknown>).__resetHealthamed = resetDatabase
}
