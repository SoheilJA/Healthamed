// Offline snapshot storage (IndexedDB via idb-keyval).
// The emergency card and active prescriptions must be viewable with no network.
import { get, set } from 'idb-keyval'
import type { EmergencyCard, Prescription } from '@/types'

export interface OfflineSnapshot {
  userId: string
  syncedAt: string
  emergencyCard: EmergencyCard
  activePrescriptions: Prescription[]
  profileVersion: number
}

const keyFor = (userId: string) => `healthamed:snapshot:${userId}`

export async function saveOfflineSnapshot(snapshot: OfflineSnapshot): Promise<void> {
  await set(keyFor(snapshot.userId), snapshot)
}

export async function loadOfflineSnapshot(userId: string): Promise<OfflineSnapshot | null> {
  try {
    return (await get(keyFor(userId))) ?? null
  } catch {
    return null
  }
}

/** Snapshot age in minutes (null when missing). */
export function snapshotAge(snapshot: OfflineSnapshot | null): number | null {
  if (!snapshot) return null
  return Math.floor((Date.now() - new Date(snapshot.syncedAt).getTime()) / 60000)
}
