// Patient-facing service: doctors directory, visits, prescriptions, orders, profile.
import { latency, mutate, nextId, read, requireOnline } from './db'
import { buildEmergencyCard, buildSlots, computeCompletion } from './helpers'
import { notificationService } from './notificationService'
import { syncService } from './syncService'
import { useAuthStore } from '@/stores'
import { DRUGS, drugById } from '@/data/catalog'
import type {
  EmergencyCard,
  Order,
  Paged,
  PatientProfile,
  Pharmacy,
  Prescription,
  Slot,
  User,
  Visit
} from '@/types'
import type { MedicalProfileInput } from '@/services/syncService'
import { dateKey, nextDateKeys } from '@/lib/jalali'

function currentUserId(): string {
  const id = useAuthStore.getState().userId
  if (!id) throw new Error('وارد نشده‌اید')
  return id
}

export function getMyUser(): User {
  const id = currentUserId()
  const user = read((db) => db.users.find((u) => u.id === id))
  if (!user) throw new Error('کاربر یافت نشد')
  return user
}

export function getMyPatient(): PatientProfile {
  const user = getMyUser()
  if (user.role !== 'patient' || !user.patientId) throw new Error('این بخش برای بیماران است')
  const p = read((db) => db.patients.find((x) => x.id === user.patientId))
  if (!p) throw new Error('پرونده پزشکی یافت نشد')
  return p
}

export function hasPatient(): boolean {
  try {
    getMyPatient()
    return true
  } catch {
    return false
  }
}

/** Save wizard output (all 8 steps) and mark the profile complete. */
export async function saveMedicalProfile(input: MedicalProfileInput): Promise<PatientProfile> {
  await latency()
  const user = getMyUser()
  const profile = mutate(
    (db) => {
      const p = db.patients.find((x) => x.id === user.patientId)
      if (!p) throw new Error('پرونده یافت نشد')
      Object.assign(p, {
        ...input,
        updatedAt: new Date().toISOString()
      })
      // keep name in sync
      const u = db.users.find((x) => x.id === user.id)
      if (u && input.fullName) u.fullName = input.fullName
      p.completion = computeCompletion(p)
      return p
    },
    'ذخیره پرونده پزشکی'
  )
  notificationService.notify(user.id, {
    title: 'پرونده پزشکی به‌روزرسانی شد',
    body: 'اطلاعات شما با موفقیت ذخیره شد. حالا می‌توانید از پزشکان مشاوره بگیرید.',
    kind: 'account',
    link: '/app/doctors'
  })
  await syncService.buildOfflineSnapshot(user.id)
  return profile
}

export async function updatePatientContact(patch: {
  city?: string
  address?: string
  emergencyContact?: PatientProfile['emergencyContact']
  insurance?: PatientProfile['insurance']
}): Promise<PatientProfile> {
  await latency()
  const user = getMyUser()
  const profile = mutate(
    (db) => {
      const p = db.patients.find((x) => x.id === user.patientId)
      if (!p) throw new Error('پرونده یافت نشد')
      Object.assign(p, patch, { updatedAt: new Date().toISOString() })
      return p
    },
    'ذخیره اطلاعات تماس'
  )
  await syncService.buildOfflineSnapshot(user.id)
  return profile
}

// ---------- doctors directory ----------

export interface DoctorCardData {
  id: string
  fullName: string
  gender: string
  specialty: string
  city: string
  experienceYears: number
  fee: number
  rating: number
  reviewCount: number
  visitCount: number
  bio: string
}

export async function listDoctors(params: {
  specialty?: string
  search?: string
  city?: string
  page?: number
  pageSize?: number
}): Promise<Paged<DoctorCardData>> {
  await latency()
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 9
  return read((db) => {
    let list = db.doctors.filter((d) => d.status === 'approved')
    if (params.specialty && params.specialty !== 'all') {
      list = list.filter((d) => d.specialty === params.specialty)
    }
    if (params.city && params.city !== 'all') {
      list = list.filter((d) => d.city === params.city)
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      list = list.filter((d) => d.fullName.includes(q) || d.bio.includes(q))
    }
    const total = list.length
    const items = list
      .slice((page - 1) * pageSize, page * pageSize)
      .map((d) => ({
        id: d.id,
        fullName: d.fullName,
        gender: d.gender,
        specialty: d.specialty,
        city: d.city,
        experienceYears: d.experienceYears,
        fee: d.fee,
        rating: d.rating,
        reviewCount: d.reviewCount,
        visitCount: d.visitCount,
        bio: d.bio
      }))
    return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) }
  })
}

export async function getDoctor(id: string): Promise<DoctorCardData & { education?: string; daysOff: string[] }> {
  await latency()
  const d = read((db) => db.doctors.find((x) => x.id === id && x.status === 'approved'))
  if (!d) throw new Error('پزشک یافت نشد')
  return {
    id: d.id,
    fullName: d.fullName,
    gender: d.gender,
    specialty: d.specialty,
    city: d.city,
    experienceYears: d.experienceYears,
    fee: d.fee,
    rating: d.rating,
    reviewCount: d.reviewCount,
    visitCount: d.visitCount,
    bio: d.bio,
    education: d.education,
    daysOff: d.daysOff
  }
}

/** Slot availability for the next 14 days. */
export async function getDoctorSlots(doctorId: string): Promise<Record<string, Slot[]>> {
  await latency()
  return read((db) => {
    const doctor = db.doctors.find((d) => d.id === doctorId)
    if (!doctor) return {}
    const result: Record<string, Slot[]> = {}
    for (const key of nextDateKeys(14)) {
      result[key] = buildSlots(doctor, key, db.visits)
    }
    return result
  })
}

// ---------- visits ----------

export interface VisitWithDoctor extends Visit {
  doctorName: string
  doctorSpecialty: string
}

function withDoctor(v: Visit): VisitWithDoctor {
  const d = read((db) => db.doctors.find((x) => x.id === v.doctorId))
  return { ...v, doctorName: d?.fullName ?? '—', doctorSpecialty: d?.specialty ?? '' }
}

export async function startVisit(input: {
  doctorId: string
  dateKey: string
  time: string
  chiefComplaint: string
  urgency: 'routine' | 'urgent'
}): Promise<Visit> {
  await latency()
  requireOnline('شروع ویزیت')
  const user = getMyUser()
  const doctor = read((db) => db.doctors.find((d) => d.id === input.doctorId))
  if (!doctor || doctor.status !== 'approved') throw new Error('پزشک در دسترس نیست')
  const taken = read((db) =>
    db.visits.some(
      (v) =>
        v.doctorId === input.doctorId &&
        v.slot.dateKey === input.dateKey &&
        v.slot.time === input.time &&
        v.status !== 'cancelled'
    )
  )
  if (taken) throw new Error('این نوبت همین حالا رزرو شد؛ زمان دیگری انتخاب کنید.')
  const now = new Date().toISOString()
  const visit = mutate(
    (db) => {
      const visit: Visit = {
        id: nextId('vs_'),
        patientId: user.patientId!,
        doctorId: input.doctorId,
        slot: { dateKey: input.dateKey, time: input.time },
        status: 'active',
        urgency: input.urgency,
        chiefComplaint: input.chiefComplaint,
        startedAt: now,
        createdAt: now,
        messages: [
          {
            id: nextId('msg_'),
            by: 'patient',
            text: input.chiefComplaint,
            at: now
          }
        ]
      }
      db.visits.push(visit)
      notificationService.notify(doctor.userId, {
        title: 'بیمار جدید در صف پذیرش',
        body: `${user.fullName} با شکایت «${input.chiefComplaint}» وارد شد.`,
        kind: 'visit',
        link: '/panel/visits'
      })
      return visit
    },
    'رزرو ویزیت'
  )
  return visit
}

export async function getMyVisits(): Promise<VisitWithDoctor[]> {
  await latency()
  const patient = getMyPatient()
  return read((db) =>
    db.visits
      .filter((v) => v.patientId === patient.id)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map(withDoctor)
  )
}

/** Fetch a visit with joined doctor info (patient view). */
export async function getVisit(id: string): Promise<VisitWithDoctor> {
  const v = read((db) => db.visits.find((x) => x.id === id))
  if (!v) throw new Error('ویزیت یافت نشد')
  return withDoctor(v)
}

export async function rateVisit(visitId: string, rating: number): Promise<void> {
  await latency()
  const patient = getMyPatient()
  mutate(
    (db) => {
      const v = db.visits.find((x) => x.id === visitId)
      if (!v || v.patientId !== patient.id) throw new Error('ویزیت یافت نشد')
      v.patientRating = rating
      db.reviews.push({
        id: nextId('rw_'),
        visitId: v.id,
        doctorId: v.doctorId,
        patientId: patient.id,
        rating,
        at: new Date().toISOString()
      })
      const doctor = db.doctors.find((d) => d.id === v.doctorId)
      if (doctor) {
        const reviews = db.reviews.filter((r) => r.doctorId === doctor.id)
        doctor.reviewCount = reviews.length
        doctor.rating = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      }
    },
    'ثبت امتیاز ویزیت'
  )
}

// ---------- prescriptions ----------

export async function getMyPrescriptions(): Promise<Prescription[]> {
  await latency()
  const patient = getMyPatient()
  return read((db) =>
    db.prescriptions
      .filter((r) => r.patientId === patient.id)
      .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1))
  )
}

// ---------- pharmacies + orders ----------

export async function listPharmacies(): Promise<Pharmacy[]> {
  await latency()
  return read((db) => db.pharmacies.filter((p) => p.active).sort((a, b) => b.rating - a.rating))
}

export async function createOrder(input: {
  prescriptionId: string
  pharmacyId: string
  quantities: Record<string, number>
  address?: string
}): Promise<Order> {
  await latency()
  requireOnline('ثبت سفارش')
  const user = getMyUser()
  const rx = read((db) => db.prescriptions.find((r) => r.id === input.prescriptionId))
  if (!rx || rx.patientId !== user.patientId) throw new Error('نسخه یافت نشد')
  const pharmacy = read((db) => db.pharmacies.find((p) => p.id === input.pharmacyId))
  if (!pharmacy) throw new Error('داروخانه یافت نشد')
  const items = rx.items.map((it) => {
    const qty = Math.max(1, input.quantities[it.drugId] ?? 1)
    return { drugId: it.drugId, name: it.name, qty, price: drugById(it.drugId)?.price ?? 0 }
  })
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const deliveryFee = 45000
  const now = new Date().toISOString()
  const order = mutate(
    (db) => {
      const order: Order = {
        id: nextId('or_'),
        prescriptionId: rx.id,
        patientId: user.patientId!,
        pharmacyId: pharmacy.id,
        items,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        status: 'pending',
        address: input.address,
        createdAt: now,
        statusHistory: [{ status: 'pending', at: now }]
      }
      db.orders.push(order)
      return order
    },
    'ثبت سفارش دارو'
  )
  notificationService.notify(user.id, {
    title: 'سفارش ثبت شد',
    body: `سفارش شما در داروخانه ${pharmacy.name} ثبت شد و در انتظار تأیید است.`,
    kind: 'order',
    link: '/app/orders'
  })
  return order
}

/** Orders progress over time (demo): each stage ~40 seconds. */
const ORDER_FLOW: Order['status'][] = ['confirmed', 'preparing', 'ready', 'delivered']
const STAGE_MS = 40 * 1000

export async function getMyOrders(): Promise<Order[]> {
  await latency()
  const patient = getMyPatient()
  const orders = mutate((db) => {
    const mine = db.orders.filter((o) => o.patientId === patient.id)
    let changed = false
    for (const o of mine) {
      if (o.status === 'cancelled') continue
      const created = new Date(o.createdAt).getTime()
      const elapsed = Date.now() - created
      const targetIdx = Math.floor(elapsed / STAGE_MS)
      const currentIdx = ORDER_FLOW.indexOf(o.status)
      if (currentIdx >= 0 && targetIdx > currentIdx) {
        const next = ORDER_FLOW[Math.min(targetIdx, ORDER_FLOW.length - 1)]
        o.status = next
        o.statusHistory.push({ status: next, at: new Date().toISOString() })
        changed = true
        if (next === 'delivered') {
          const rx = db.prescriptions.find((r) => r.id === o.prescriptionId)
          if (rx) rx.status = 'delivered'
          const userId = db.patients.find((p) => p.id === o.patientId)?.userId
          if (userId) {
            notificationService.notify(userId, {
              title: 'سفارش شما تحویل شد',
              body: 'داروهای شما با موفقیت تحویل داده شد. سلامت باشید!',
              kind: 'order',
              link: '/app/orders'
            })
          }
        }
      }
    }
    if (changed) db.seq = db.seq
    return mine.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, 'به‌روزرسانی وضعیت سفارش')
  return orders
}

export async function cancelOrder(orderId: string): Promise<void> {
  await latency()
  const patient = getMyPatient()
  mutate(
    (db) => {
      const o = db.orders.find((x) => x.id === orderId)
      if (!o || o.patientId !== patient.id) throw new Error('سفارش یافت نشد')
      if (o.status !== 'pending' && o.status !== 'confirmed') {
        throw new Error('این سفارش قابل لغو نیست؛ داروخانه آن را آماده کرده است.')
      }
      o.status = 'cancelled'
      o.statusHistory.push({ status: 'cancelled', at: new Date().toISOString() })
    },
    'لغو سفارش'
  )
}

// ---------- emergency card ----------

export async function getEmergencyCard(): Promise<EmergencyCard> {
  const p = getMyPatient()
  return buildEmergencyCard(p)
}

export function getEmergencyCardSync(): EmergencyCard {
  const p = getMyPatient()
  return buildEmergencyCard(p)
}

export function getTodayKey(): string {
  return dateKey(new Date())
}

export function getAllDrugs() {
  return DRUGS
}
