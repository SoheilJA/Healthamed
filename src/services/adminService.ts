// Admin service: KPIs, patient management + CSV import, doctor approvals,
// pharmacy CRUD, permission matrix, audit log.
import { latency, mutate, nextId, read } from './db'
import { notificationService } from './notificationService'
import { LEVEL_PRESETS, PERMISSIONS } from '@/data/seed'
import { computeCompletion } from './helpers'
import { useAuthStore } from '@/stores'
import { isValidNationalId, toEnglishDigits, isValidIranMobile, generateNationalId } from '@/lib/persian'
import type {
  AdminLevel,
  AuditEntry,
  DoctorProfile,
  Gender,
  Paged,
  PatientProfile,
  Pharmacy,
  User
} from '@/types'

function currentAdmin(): User {
  const id = useAuthStore.getState().userId
  if (!id) throw new Error('وارد نشده‌اید')
  const user = read((db) => db.users.find((u) => u.id === id))
  if (!user || user.role !== 'admin') throw new Error('دسترسی مدیر لازم است')
  return user
}

function audit(action: string, target?: string): void {
  const admin = currentAdmin()
  mutate((db) => {
    db.audit.push({
      id: nextId('au_'),
      actorId: admin.id,
      actorName: admin.fullName,
      action,
      target,
      at: new Date().toISOString()
    })
  }, 'ثبت رویداد حسابرسی')
}

// ---------- dashboard ----------

export interface AdminStats {
  patients: number
  doctors: number
  pendingDoctors: number
  visits: number
  prescriptions: number
  orders: number
  revenue: number
  visitsByDay: { label: string; count: number }[]
  specialtyDist: { label: string; value: number }[]
  orderStatusDist: { label: string; value: number }[]
  monthlyGrowth: number
}

export function getStats(): AdminStats {
  currentAdmin()
  return read((db) => {
    const days: { label: string; count: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayKey = d.toISOString().slice(0, 10)
      const count = db.visits.filter((v) => v.createdAt.slice(0, 10) === dayKey).length
      days.push({ label: String(d.getDate()), count })
    }
    const specCount = new Map<string, number>()
    for (const d of db.doctors.filter((x) => x.status === 'approved')) {
      specCount.set(d.specialty, (specCount.get(d.specialty) ?? 0) + 1)
    }
    const statusCount = new Map<string, number>()
    for (const o of db.orders) {
      statusCount.set(o.status, (statusCount.get(o.status) ?? 0) + 1)
    }
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10)
    const thisWeek = db.visits.filter((v) => v.createdAt.slice(0, 10) >= weekAgo).length
    const lastWeek = db.visits.filter((v) => v.createdAt.slice(0, 10) >= twoWeeksAgo && v.createdAt.slice(0, 10) < weekAgo).length
    return {
      patients: db.patients.length,
      doctors: db.doctors.filter((d) => d.status === 'approved').length,
      pendingDoctors: db.doctors.filter((d) => d.status === 'pending').length,
      visits: db.visits.length,
      prescriptions: db.prescriptions.length,
      orders: db.orders.length,
      revenue: db.orders.reduce((s, o) => s + o.total, 0),
      visitsByDay: days,
      specialtyDist: [...specCount.entries()].map(([k, v]) => ({ label: k, value: v })),
      orderStatusDist: [...statusCount.entries()].map(([k, v]) => ({ label: k, value: v })),
      monthlyGrowth: lastWeek === 0 ? 100 : Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
    }
  })
}

// ---------- patients (paginated, server-style) ----------

export interface AdminPatientRow {
  id: string
  fullName: string
  nationalId: string
  mobile: string
  gender: Gender
  age: number
  city: string
  completion: number
  visits: number
  createdAt: string
}

export interface PatientQuery {
  search?: string
  city?: string
  completion?: 'all' | 'complete' | 'incomplete'
  sortKey?: 'fullName' | 'createdAt' | 'visits' | 'age'
  sortDir?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export async function listPatients(q: PatientQuery): Promise<Paged<AdminPatientRow>> {
  await latency()
  currentAdmin()
  const page = q.page ?? 1
  const pageSize = q.pageSize ?? 20
  return read((db) => {
    let rows: AdminPatientRow[] = db.patients.map((p) => {
      const user = db.users.find((u) => u.id === p.userId)
      return {
        id: p.id,
        fullName: p.fullName,
        nationalId: p.nationalId,
        mobile: user?.mobile ?? '—',
        gender: p.gender,
        age: p.birthDate ? Math.max(0, new Date().getFullYear() - new Date(p.birthDate).getFullYear()) : 0,
        city: p.city,
        completion: p.completion,
        visits: db.visits.filter((v) => v.patientId === p.id).length,
        createdAt: p.createdAt
      }
    })
    if (q.search && q.search.trim()) {
      const s = toEnglishDigits(q.search.trim())
      rows = rows.filter(
        (r) => r.fullName.includes(q.search!.trim()) || r.nationalId.includes(s) || r.mobile.includes(s)
      )
    }
    if (q.city && q.city !== 'all') rows = rows.filter((r) => r.city === q.city)
    if (q.completion === 'complete') rows = rows.filter((r) => r.completion >= 100)
    if (q.completion === 'incomplete') rows = rows.filter((r) => r.completion < 100)
    const key = q.sortKey ?? 'createdAt'
    const dir = q.sortDir ?? 'desc'
    rows.sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'fa')
      return dir === 'asc' ? cmp : -cmp
    })
    const total = rows.length
    return {
      items: rows.slice((page - 1) * pageSize, page * pageSize),
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize))
    }
  })
}

export async function exportPatients(): Promise<AdminPatientRow[]> {
  currentAdmin()
  return read((db) =>
    db.patients.map((p) => {
      const user = db.users.find((u) => u.id === p.userId)
      return {
        id: p.id,
        fullName: p.fullName,
        nationalId: p.nationalId,
        mobile: user?.mobile ?? '',
        gender: p.gender,
        age: p.birthDate ? Math.max(0, new Date().getFullYear() - new Date(p.birthDate).getFullYear()) : 0,
        city: p.city,
        completion: p.completion,
        visits: db.visits.filter((v) => v.patientId === p.id).length,
        createdAt: p.createdAt
      }
    })
  )
}

// ---------- CSV import ----------

export interface ImportRow {
  fullName?: string
  mobile?: string
  nationalId?: string
  gender?: string
  birthDate?: string
  city?: string
  [k: string]: string | undefined
}

export interface ImportResult {
  created: number
  skipped: number
  errors: string[]
}

export async function importPatients(rows: ImportRow[]): Promise<ImportResult> {
  await latency()
  const result = mutate(
    (db) => {
      const res: ImportResult = { created: 0, skipped: 0, errors: [] }
      rows.forEach((row, i) => {
        const line = i + 2 // +1 header, +1 1-based
        const fullName = row.fullName?.trim()
        const mobile = toEnglishDigits(row.mobile ?? '').trim()
        const nationalId = toEnglishDigits(row.nationalId ?? '').trim()
        if (!fullName || fullName.length < 3) {
          res.skipped++
          res.errors.push(`خط ${line}: نام و نام خانوادگی نامعتبر`)
          return
        }
        if (!isValidIranMobile(mobile) || db.users.some((u) => u.mobile === mobile)) {
          res.skipped++
          res.errors.push(`خط ${line}: شماره موبایل تکراری یا نامعتبر`)
          return
        }
        let finalNatId = nationalId
        if (finalNatId && (!isValidNationalId(finalNatId) || db.patients.some((p) => p.nationalId === finalNatId))) {
          res.skipped++
          res.errors.push(`خط ${line}: کد ملی تکراری یا نامعتبر`)
          return
        }
        if (!finalNatId) finalNatId = generateNationalId(Math.random)
        const gender: Gender = row.gender?.includes('ز') || row.gender?.includes('خانم') || row.gender === 'female' ? 'female' : 'male'
        const birthDate = row.birthDate ? new Date(row.birthDate) : new Date(1990, 0, 1)
        const now = new Date().toISOString()
        const patientId = `pt_imp_${nextId('x')}`
        const userId = `u_imp_${nextId('x')}`
        db.users.push({
          id: userId,
          mobile,
          role: 'patient',
          fullName,
          nationalId: finalNatId,
          patientId,
          createdAt: now
        })
        const profile: PatientProfile = {
          id: patientId,
          userId,
          fullName,
          gender,
          birthDate: isNaN(birthDate.getTime()) ? new Date(1990, 0, 1).toISOString() : birthDate.toISOString(),
          nationalId: finalNatId,
          city: row.city?.trim() || 'تهران',
          allergies: [],
          chronicConditions: [],
          medications: [],
          surgeries: [],
          familyHistory: [],
          completion: 0,
          createdAt: now,
          updatedAt: now
        }
        profile.completion = computeCompletion(profile)
        db.patients.push(profile)
        res.created++
      })
      return res
    },
    'ورود گروهی بیماران'
  )
  audit('patient.import', `${result.created} بیمار جدید`)
  return result
}

// ---------- doctors ----------

export interface AdminDoctorRow {
  id: string
  fullName: string
  specialty: string
  medicalCouncilNumber: string
  city: string
  experienceYears: number
  status: DoctorProfile['status']
  rating: number
  visitCount: number
  createdAt: string
  bio?: string
  education?: string
}

export async function listDoctors(status?: 'all' | DoctorProfile['status'], search?: string): Promise<AdminDoctorRow[]> {
  await latency()
  currentAdmin()
  return read((db) => {
    let doctors = [...db.doctors]
    if (status && status !== 'all') doctors = doctors.filter((d) => d.status === status)
    if (search && search.trim()) {
      const q = search.trim()
      doctors = doctors.filter(
        (d) => d.fullName.includes(q) || d.medicalCouncilNumber.includes(toEnglishDigits(q))
      )
    }
    return doctors
      .sort((a, b) => (a.status === 'pending' && b.status !== 'pending' ? -1 : 1))
      .map((d) => ({
        id: d.id,
        fullName: d.fullName,
        specialty: d.specialty,
        medicalCouncilNumber: d.medicalCouncilNumber,
        city: d.city,
        experienceYears: d.experienceYears,
        status: d.status,
        rating: d.rating,
        visitCount: d.visitCount,
        createdAt: d.createdAt,
        bio: d.bio,
        education: d.education
      }))
  })
}

export async function setDoctorStatus(id: string, status: DoctorProfile['status'], reason?: string): Promise<void> {
  await latency()
  currentAdmin()
  mutate(
    (db) => {
      const d = db.doctors.find((x) => x.id === id)
      if (!d) throw new Error('پزشک یافت نشد')
      d.status = status
      const user = db.users.find((u) => u.doctorId === id)
      if (user) {
        if (status === 'approved') {
          notificationService.notify(user.id, {
            title: 'درخواست شما تأیید شد 🎉',
            body: 'حساب پزشکی شما فعال شد. از این پس می‌توانید بیماران را پذیرا باشید.',
            kind: 'account',
            link: '/panel'
          })
        } else if (status === 'rejected') {
          notificationService.notify(user.id, {
            title: 'درخواست شما متأسفانه رد شد',
            body: reason ? `دلیل: ${reason}` : 'برای پیگیری با پشتیبانی تماس بگیرید.',
            kind: 'account'
          })
        } else if (status === 'suspended') {
          notificationService.notify(user.id, {
            title: 'حساب شما موقتاً معلق شد',
            body: reason ? `دلیل: ${reason}` : 'برای پیگیری با پشتیبانی تماس بگیرید.',
            kind: 'account'
          })
        }
      }
    },
    'تغییر وضعیت پزشک'
  )
  audit(`doctor.${status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : 'suspend'}`, id)
}

// ---------- pharmacies ----------

export async function listPharmaciesAdmin(): Promise<Pharmacy[]> {
  await latency()
  currentAdmin()
  return read((db) => [...db.pharmacies].sort((a, b) => a.name.localeCompare(b.name, 'fa')))
}

export async function savePharmacy(input: Partial<Pharmacy> & { name: string; city: string; address: string; phone: string; openHours: string }): Promise<Pharmacy> {
  await latency()
  currentAdmin()
  const saved = mutate(
    (db) => {
      if (input.id) {
        const p = db.pharmacies.find((x) => x.id === input.id)
        if (!p) throw new Error('داروخانه یافت نشد')
        Object.assign(p, input)
        audit('pharmacy.update', p.name)
        return p
      }
      const p: Pharmacy = {
        id: nextId('ph_'),
        name: input.name,
        city: input.city,
        address: input.address,
        phone: toEnglishDigits(input.phone),
        openHours: input.openHours,
        active: input.active ?? true,
        rating: 4.2
      }
      db.pharmacies.push(p)
      audit('pharmacy.create', p.name)
      return p
    },
    'ذخیره داروخانه'
  )
  return saved
}

export async function togglePharmacy(id: string): Promise<void> {
  await latency()
  currentAdmin()
  mutate(
    (db) => {
      const p = db.pharmacies.find((x) => x.id === id)
      if (!p) throw new Error('داروخانه یافت نشد')
      p.active = !p.active
      audit(p.active ? 'pharmacy.update' : 'pharmacy.delete', p.name)
    },
    'تغییر وضعیت داروخانه'
  )
}

// ---------- permissions + audit ----------

export function getPermissionMatrix(): Record<string, Record<AdminLevel, boolean>> {
  currentAdmin()
  return PERMISSIONS
}

export async function updatePermission(module: string, level: AdminLevel, value: boolean): Promise<void> {
  await latency()
  const admin = currentAdmin()
  if (admin.mobile !== '09190000020') {
    throw new Error('فقط مدیر ارشد می‌تواند سطوح دسترسی را تغییر دهد.')
  }
  mutate(
    (db) => {
      void db
      const mod = PERMISSIONS[module]
      if (mod) mod[level] = value
    },
    'تغییر سطح دسترسی'
  )
  audit('permissions.update', `${module} / ${level}`)
}

export function getAdminLevels(): { level: AdminLevel; description: string }[] {
  return (Object.keys(LEVEL_PRESETS) as AdminLevel[]).map((level) => ({
    level,
    description: LEVEL_PRESETS[level]
  }))
}

export async function listAudit(params: { search?: string; page?: number; pageSize?: number }): Promise<Paged<AuditEntry>> {
  await latency()
  currentAdmin()
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 15
  return read((db) => {
    let entries = [...db.audit].sort((a, b) => (a.at < b.at ? 1 : -1))
    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      entries = entries.filter(
        (e) => e.actorName.includes(q) || e.action.includes(q) || (e.target ?? '').includes(q)
      )
    }
    const total = entries.length
    return {
      items: entries.slice((page - 1) * pageSize, page * pageSize),
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize))
    }
  })
}
