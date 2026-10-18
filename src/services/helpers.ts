// Shared service helpers: slot generation, emergency card, profile completion.
import type {
  DoctorProfile,
  EmergencyCard,
  PatientProfile,
  Slot,
  Visit
} from '@/types'
import { hashCode } from '@/lib/utils'
import { ageFromBirth, dateKey, fromKey, persianWeekday } from '@/lib/jalali'
import { drugById } from '@/data/catalog'

const RESERVE_RATIO = 0.26

/**
 * Deterministic slot generation for a doctor on a given date.
 * Slots collide with real visits; ~26% are pre-reserved via stable hash.
 */
export function buildSlots(doctor: DoctorProfile, key: string, visits: Visit[], now = new Date()): Slot[] {
  const date = fromKey(key)
  const weekday = persianWeekday(date)
  const schedule = doctor.weeklySchedule[weekday]
  if (!schedule?.enabled) return []
  if (doctor.daysOff.includes(key)) return []
  const [sh, sm] = schedule.start.split(':').map(Number)
  const [eh, em] = schedule.end.split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  const slots: Slot[] = []
  const bookedTimes = new Set(
    visits
      .filter((v) => v.doctorId === doctor.id && v.slot.dateKey === key && v.status !== 'cancelled')
      .map((v) => v.slot.time)
  )
  for (let t = startMin; t + schedule.slotMinutes <= endMin; t += schedule.slotMinutes) {
    const time = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
    const reserved = hashCode(`${doctor.id}|${key}|${time}`) % 100 < RESERVE_RATIO * 100
    const isPast =
      dateKey(now) === key &&
      now.getHours() * 60 + now.getMinutes() > t + schedule.slotMinutes
    slots.push({ dateKey: key, time, taken: bookedTimes.has(time) || reserved || isPast })
  }
  return slots
}

/** Build the printable/shareable emergency card from a patient profile. */
export function buildEmergencyCard(p: PatientProfile): EmergencyCard {
  return {
    fullName: p.fullName,
    gender: p.gender,
    age: ageFromBirth(p.birthDate),
    bloodType: p.bloodType,
    nationalId: p.nationalId,
    allergies: p.allergies,
    chronicConditions: p.chronicConditions.map((c) => c.name),
    medications: p.medications.map((m) => `${m.name} — ${m.dosage} (${m.frequency})`),
    emergencyContact: p.emergencyContact,
    insurance: p.insurance,
    generatedAt: new Date().toISOString()
  }
}

/** Profile completion percent (weighted sections). */
export function computeCompletion(p: Partial<PatientProfile>): number {
  let score = 0
  if (p.fullName && p.nationalId) score += 10
  if (p.gender && p.birthDate) score += 10
  if (p.city) score += 5
  if (p.bloodType) score += 10
  if (p.heightCm && p.weightKg) score += 10
  if (p.emergencyContact?.name && p.emergencyContact?.phone) score += 10
  if ((p.allergies?.length ?? 0) > 0 || p.allergiesKnownEmpty) score += 15
  if ((p.chronicConditions?.length ?? 0) > 0 || p.chronicKnownEmpty) score += 10
  if ((p.medications?.length ?? 0) > 0 || p.medsKnownEmpty) score += 10
  if (p.lifestyle?.exercise) score += 10
  return Math.min(100, score)
}

/** Drug display helper for order building. */
export function drugPrice(drugId: string): number {
  return drugById(drugId)?.price ?? 0
}
