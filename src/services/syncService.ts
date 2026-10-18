// Offline snapshot builder (emergency card + active prescriptions).
// Persisted to IndexedDB so it survives offline PWA usage.
import { get, set } from 'idb-keyval'
import type { OfflineSnapshot } from '@/lib/offline'
import { mutateLocal, read } from './db'
import { buildEmergencyCard } from './helpers'
import { useAuthStore } from '@/stores'

export interface MedicalProfileInput {
  fullName: string
  gender: 'male' | 'female'
  birthDate: string
  nationalId: string
  bloodType?: string
  heightCm?: number
  weightKg?: number
  city: string
  address?: string
  emergencyContact?: { name: string; phone: string; relation: string }
  allergies: { substance: string; severity: 'mild' | 'moderate' | 'severe'; reaction?: string }[]
  chronicConditions: { name: string; sinceYear?: number; controlled: boolean; notes?: string }[]
  medications: { drugId: string; name: string; dosage: string; frequency: string }[]
  surgeries: string[]
  familyHistory: string[]
  lifestyle?: {
    smoking: 'never' | 'former' | 'current'
    alcohol: 'never' | 'former' | 'current'
    exercise: 'none' | 'light' | 'regular' | 'intense'
    sleepHours?: number
  }
  insurance?: { provider: string; number: string }
  notes?: string
  allergiesKnownEmpty?: boolean
  chronicKnownEmpty?: boolean
  medsKnownEmpty?: boolean
}

const keyFor = (userId: string) => `healthamed:snapshot:${userId}`

export const syncService = {
  async buildOfflineSnapshot(userId: string): Promise<OfflineSnapshot> {
    const data = read((db) => {
      const user = db.users.find((u) => u.id === userId)
      if (!user) throw new Error('کاربر یافت نشد')
      const patient = db.patients.find((p) => p.id === user.patientId)
      const prescriptions = db.prescriptions
        .filter((r) => r.patientId === user.patientId && r.status === 'active')
        .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1))
      return { patient, prescriptions }
    })
    const snapshot: OfflineSnapshot = {
      userId,
      syncedAt: new Date().toISOString(),
      emergencyCard: data.patient
        ? buildEmergencyCard(data.patient)
        : {
            fullName: '—',
            gender: 'male',
            age: 0,
            nationalId: '',
            allergies: [],
            chronicConditions: [],
            medications: [],
            generatedAt: new Date().toISOString()
          },
      activePrescriptions: data.prescriptions,
      profileVersion: Date.now()
    }
    await set(keyFor(userId), snapshot)
    // touch db so snapshot marker persists
    mutateLocal((db) => {
      db.seededAt = db.seededAt
    })
    return snapshot
  },

  async loadSnapshot(userId: string): Promise<OfflineSnapshot | null> {
    try {
      return (await get(keyFor(userId))) ?? null
    } catch {
      return null
    }
  }
}
