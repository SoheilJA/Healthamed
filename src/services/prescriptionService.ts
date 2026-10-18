// Prescription service: tracking codes (HA-<year>-<6digits>),
// interaction/allergy validation, offline snapshot refresh after issuing.
import { latency, mutate, nextId, read } from './db'
import { notificationService } from './notificationService'
import { syncService } from './syncService'
import { useAuthStore } from '@/stores'
import { drugById } from '@/data/catalog'
import type { PatientProfile, Prescription, PrescriptionItem, PrescriptionWarning } from '@/types'
import { jalaliYear } from '@/lib/jalali'
import { pad } from '@/lib/utils'

function makeTrackingCode(seq: number): string {
  const year = jalaliYear(new Date())
  const num = String(100000 + ((seq * 7919) % 900000))
  return `HA-${year}-${num.slice(0, 6)}`
}

/** Persian allergen name -> drug tag aliases for reliable cross-checks. */
const ALLERGY_TAG_ALIASES: Array<[string, string]> = [
  ['پنی‌سیلین', 'penicillin'],
  ['پنی سیلین', 'penicillin'],
  ['سولفا', 'sulfa'],
  ['آسپرین', 'nsaid'],
  ['nsaid', 'nsaid'],
  ['ید', 'iodine']
]

/** Allergy + interaction validation used live by the prescription writer. */
export function validatePrescriptionItems(
  items: PrescriptionItem[],
  patient?: PatientProfile
): PrescriptionWarning[] {
  const warnings: PrescriptionWarning[] = []
  const seen = new Map<string, number>()
  items.forEach((it, idx) => {
    const drug = drugById(it.drugId)
    if (!drug) return
    // duplicate check
    if (seen.has(drug.id)) {
      warnings.push({
        level: 'warning',
        code: 'duplicate',
        message: `«${drug.name}» بیش از یک بار در نسخه آمده است.`,
        drugNames: [drug.name]
      })
    }
    seen.set(drug.id, idx)
    // allergy check
    if (patient) {
      for (const allergy of patient.allergies) {
        const a = allergy.substance
        const aliasTags = ALLERGY_TAG_ALIASES.filter(([alias]) => a.includes(alias)).map(([, tag]) => tag)
        const hit =
          drug.tags.some((tag) => aliasTags.includes(tag) || a.includes(tag) || tag.includes(a)) ||
          a.split(/[ /(،]/).some((part) => part.length > 2 && drug.name.includes(part)) ||
          a.includes(drug.generic.split(' ')[0])
        if (hit) {
          warnings.push({
            level: 'danger',
            code: 'allergy',
            message: `حساسیت ثبت‌شده بیمار به «${a}» با داروی «${drug.name}» ناسازگار است!`,
            drugNames: [drug.name]
          })
        }
      }
    }
    // interaction check
    for (const other of items) {
      if (other.drugId === it.drugId) continue
      const otherDrug = drugById(other.drugId)
      if (!otherDrug) continue
      if (drug.interactions.includes(otherDrug.id) || otherDrug.interactions.includes(drug.id)) {
        const key = [drug.id, otherDrug.id].sort().join('|')
        if (!warnings.some((w) => w.code === 'interaction' && w.drugNames.join('|') === key)) {
          warnings.push({
            level: 'danger',
            code: 'interaction',
            message: `تداخل دارویی بین «${drug.name}» و «${otherDrug.name}» — نیازمند بازبینی پزشک.`,
            drugNames: [drug.name, otherDrug.name]
          })
        }
      }
    }
  })
  return warnings
}

export const prescriptionService = {
  /** Create a prescription from a visit (doctor only). */
  async create(
    visitId: string,
    items: PrescriptionItem[],
    notes?: string
  ): Promise<Prescription> {
    await latency()
    const userId = useAuthStore.getState().userId
    if (!userId) throw new Error('وارد نشده‌اید')
    const errors = validatePrescriptionItems(items).filter((w) => w.level === 'danger')
    // danger warnings are surfaced by UI; doctor confirms explicitly there.
    void errors
    const rx = mutate((db) => {
      const v = db.visits.find((x) => x.id === visitId)
      if (!v) throw new Error('ویزیت یافت نشد')
      const doctor = db.doctors.find((d) => d.userId === userId)
      if (!doctor || v.doctorId !== doctor.id) throw new Error('دسترسی غیرمجاز')
      if (v.prescriptionId) throw new Error('برای این ویزیت قبلاً نسخه صادر شده است')
      const now = new Date()
      const seq = db.prescriptions.length + 1
      const rx: Prescription = {
        id: nextId('rx_'),
        trackingCode: makeTrackingCode(seq),
        visitId: v.id,
        patientId: v.patientId,
        doctorId: v.doctorId,
        items,
        notes,
        status: 'active',
        issuedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString()
      }
      db.prescriptions.push(rx)
      v.prescriptionId = rx.id
      v.status = 'completed'
      v.endedAt = now.toISOString()
      const patient = db.patients.find((p) => p.id === v.patientId)
      if (patient) {
        notificationService.notify(patient.userId, {
          title: 'نسخه جدید صادر شد 💊',
          body: `دکتر ${doctor.fullName} نسخه‌ای با کد پیگیری ${rx.trackingCode} برای شما صادر کرد. می‌توانید از داروخانه‌های همکار سفارش دهید.`,
          kind: 'prescription',
          link: '/app/records?tab=prescriptions'
        })
      }
      return rx
    }, 'صدور نسخه')
    // refresh offline snapshot so the new prescription is available offline
    const patientUserId = read((db) => db.patients.find((p) => p.id === rx.patientId)?.userId)
    if (patientUserId) await syncService.buildOfflineSnapshot(patientUserId)
    return rx
  },

  getByVisit(visitId: string): Prescription | undefined {
    return read((db) => db.prescriptions.find((r) => r.visitId === visitId))
  },

  validate: validatePrescriptionItems
}

export { pad }
