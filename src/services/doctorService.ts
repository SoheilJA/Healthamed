// Doctor-facing service: dashboard, schedule, queue, patients, profile.
import { latency, mutate, read } from './db'
import { buildSlots } from './helpers'
import { notificationService } from './notificationService'
import { useAuthStore } from '@/stores'
import { dateKey, fromKey, nextDateKeys, persianWeekday, PERSIAN_WEEKDAYS } from '@/lib/jalali'
import type { DaySchedule, DoctorProfile, PatientProfile, Prescription, Slot, Visit, WeeklySchedule } from '@/types'

function currentUserId(): string {
  const id = useAuthStore.getState().userId
  if (!id) throw new Error('وارد نشده‌اید')
  return id
}

export function getMyDoctor(): DoctorProfile {
  const userId = currentUserId()
  const d = read((db) => db.doctors.find((x) => x.userId === userId))
  if (!d) throw new Error('پروفایل پزشکی یافت نشد')
  return d
}

export interface QueueItem extends Visit {
  patientName: string
  patientAge: number
  patientGender: string
  hasAllergies: boolean
}

export function getDashboard(): {
  todayCount: number
  activeCount: number
  waitingCount: number
  totalPatients: number
  totalVisits: number
  rating: number
  weekVisits: { label: string; count: number }[]
  queue: QueueItem[]
} {
  const doctor = getMyDoctor()
  return read((db) => {
    const myVisits = db.visits.filter((v) => v.doctorId === doctor.id)
    const todayK = dateKey(new Date())
    const weekVisits = nextDateKeys(-7)
      .reverse()
      .map((key) => {
        const d = fromKey(key)
        return {
          label: PERSIAN_WEEKDAYS[persianWeekday(d)],
          count: myVisits.filter((v) => v.slot.dateKey === key).length
        }
      })
    const queue = myVisits
      .filter((v) => (v.status === 'waiting' || v.status === 'active') && v.slot.dateKey >= todayK)
      .sort((a, b) => (a.startedAt > b.startedAt ? -1 : 1))
      .map((v) => {
        const p = db.patients.find((x) => x.id === v.patientId)!
        return {
          ...v,
          patientName: p?.fullName ?? '—',
          patientAge: p ? Math.max(0, new Date().getFullYear() - new Date(p.birthDate).getFullYear()) : 0,
          patientGender: p?.gender ?? 'male',
          hasAllergies: (p?.allergies?.length ?? 0) > 0
        }
      })
    const uniquePatients = new Set(myVisits.map((v) => v.patientId))
    return {
      todayCount: myVisits.filter((v) => v.slot.dateKey === todayK).length,
      activeCount: myVisits.filter((v) => v.status === 'active').length,
      waitingCount: myVisits.filter((v) => v.status === 'waiting').length,
      totalPatients: uniquePatients.size,
      totalVisits: myVisits.length + 0,
      rating: doctor.rating,
      weekVisits,
      queue
    }
  })
}

// ---------- schedule ----------

export function getScheduleRange(): { dateKey: string; weekday: number; slots: Slot[]; isOff: boolean }[] {
  const doctor = getMyDoctor()
  return read((db) =>
    nextDateKeys(14).map((key) => {
      const d = fromKey(key)
      return {
        dateKey: key,
        weekday: persianWeekday(d),
        slots: buildSlots(doctor, key, db.visits),
        isOff: doctor.daysOff.includes(key) || !doctor.weeklySchedule[persianWeekday(d)]?.enabled
      }
    })
  )
}

export function getWeeklySchedule(): WeeklySchedule {
  return getMyDoctor().weeklySchedule
}

export async function updateDaySchedule(weekday: number, patch: Partial<DaySchedule>): Promise<void> {
  await latency()
  const userId = currentUserId()
  mutate(
    (db) => {
      const d = db.doctors.find((x) => x.userId === userId)
      if (!d) throw new Error('پزشک یافت نشد')
      d.weeklySchedule[weekday] = { ...d.weeklySchedule[weekday], ...patch }
    },
    'به‌روزرسانی برنامه هفتگی'
  )
}

export async function toggleDayOff(dateKeyStr: string): Promise<void> {
  await latency()
  const userId = currentUserId()
  mutate(
    (db) => {
      const d = db.doctors.find((x) => x.userId === userId)
      if (!d) throw new Error('پزشک یافت نشد')
      if (d.daysOff.includes(dateKeyStr)) {
        d.daysOff = d.daysOff.filter((k) => k !== dateKeyStr)
      } else {
        d.daysOff.push(dateKeyStr)
      }
    },
    'تغییر روزهای تعطیلی'
  )
}

// ---------- queue & visits ----------

export function getVisitQueue(): { waiting: QueueItem[]; active: QueueItem[]; recent: QueueItem[] } {
  const doctor = getMyDoctor()
  return read((db) => {
    const map = (v: Visit): QueueItem => {
      const p = db.patients.find((x) => x.id === v.patientId)
      return {
        ...v,
        patientName: p?.fullName ?? '—',
        patientAge: p ? Math.max(0, new Date().getFullYear() - new Date(p.birthDate).getFullYear()) : 0,
        patientGender: p?.gender ?? 'male',
        hasAllergies: (p?.allergies?.length ?? 0) > 0
      }
    }
    const mine = db.visits.filter((v) => v.doctorId === doctor.id)
    return {
      waiting: mine.filter((v) => v.status === 'waiting').sort((a, b) => (a.startedAt > b.startedAt ? -1 : 1)).map(map),
      active: mine.filter((v) => v.status === 'active').sort((a, b) => (a.startedAt > b.startedAt ? -1 : 1)).map(map),
      recent: mine
        .filter((v) => v.status === 'completed' || v.status === 'cancelled')
        .sort((a, b) => (a.endedAt! < b.endedAt! ? 1 : -1))
        .slice(0, 30)
        .map(map)
    }
  })
}

export function getVisitForDoctor(visitId: string): {
  visit: Visit
  patient: PatientProfile
  doctor: DoctorProfile
  prescription?: Prescription
} {
  const userId = currentUserId()
  return read((db) => {
    const doctor = db.doctors.find((d) => d.userId === userId)
    const v = db.visits.find((x) => x.id === visitId)
    if (!v || !doctor || v.doctorId !== doctor.id) throw new Error('ویزیت یافت نشد')
    const patient = db.patients.find((p) => p.id === v.patientId)!
    const prescription = v.prescriptionId
      ? db.prescriptions.find((r) => r.id === v.prescriptionId)
      : undefined
    return { visit: v, patient, doctor, prescription }
  })
}

// ---------- patients ----------

export interface DoctorPatientRow {
  profile: PatientProfile
  lastVisitAt?: string
  visitCount: number
}

export function getMyPatients(search?: string): DoctorPatientRow[] {
  const doctor = getMyDoctor()
  return read((db) => {
    const myVisits = db.visits.filter((v) => v.doctorId === doctor.id)
    const byPatient = new Map<string, Visit[]>()
    for (const v of myVisits) {
      const list = byPatient.get(v.patientId) ?? []
      list.push(v)
      byPatient.set(v.patientId, list)
    }
    let rows: DoctorPatientRow[] = []
    for (const [pid, visits] of byPatient) {
      const profile = db.patients.find((p) => p.id === pid)
      if (!profile) continue
      rows.push({
        profile,
        visitCount: visits.length,
        lastVisitAt: visits.map((v) => v.startedAt).sort().reverse()[0]
      })
    }
    rows = rows.sort((a, b) => ((a.lastVisitAt ?? '') < (b.lastVisitAt ?? '') ? 1 : -1))
    if (search && search.trim()) {
      const q = search.trim()
      rows = rows.filter(
        (r) => r.profile.fullName.includes(q) || r.profile.nationalId.includes(q)
      )
    }
    return rows
  })
}

export function getPatientFile(patientId: string): {
  profile: PatientProfile
  visits: Visit[]
  prescriptions: Prescription[]
} {
  const doctor = getMyDoctor()
  return read((db) => {
    const profile = db.patients.find((p) => p.id === patientId)
    if (!profile) throw new Error('بیمار یافت نشد')
    const hasRelation = db.visits.some((v) => v.doctorId === doctor.id && v.patientId === patientId)
    if (!hasRelation) throw new Error('این بیمار در لیست شما نیست')
    const visits = db.visits
      .filter((v) => v.patientId === patientId)
      .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
    const prescriptions = db.prescriptions
      .filter((r) => r.patientId === patientId)
      .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1))
    return { profile, visits, prescriptions }
  })
}

// ---------- profile ----------

export async function updateMyProfile(patch: {
  bio?: string
  fee?: number
  education?: string
  city?: string
}): Promise<DoctorProfile> {
  await latency()
  const userId = currentUserId()
  const updated = mutate(
    (db) => {
      const d = db.doctors.find((x) => x.userId === userId)
      if (!d) throw new Error('پزشک یافت نشد')
      Object.assign(d, patch)
      return d
    },
    'به‌روزرسانی پروفایل'
  )
  return updated
}

export function myNotifications() {
  const userId = currentUserId()
  return notificationService.listFor(userId)
}

export function notifyPatient(visitId: string, title: string, body: string): void {
  read((db) => {
    const v = db.visits.find((x) => x.id === visitId)
    if (!v) return
    const patient = db.patients.find((p) => p.id === v.patientId)
    if (patient) {
      notificationService.notify(patient.userId, { title, body, kind: 'visit', link: `/app/visits/${visitId}` })
    }
  })
}
