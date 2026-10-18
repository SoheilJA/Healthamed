// Authentication service (mock): OTP is always 12345 in this MVP.
import { mutate, read, latency } from './db'
import { useAuthStore } from '@/stores'
import type { User } from '@/types'
import { isValidNationalId, toEnglishDigits } from '@/lib/persian'

export const DEMO_OTP = '12345'

export interface OtpSession {
  mobile: string
  expiresAt: number
}

const otpSessions = new Map<string, OtpSession>()

export async function requestOtp(mobile: string): Promise<{ sent: boolean; mobile: string }> {
  await latency()
  const normalized = toEnglishDigits(mobile)
  otpSessions.set(normalized, { mobile: normalized, expiresAt: Date.now() + 2 * 60 * 1000 })
  return { sent: true, mobile: normalized }
}

export async function verifyOtp(mobile: string, code: string): Promise<User> {
  await latency()
  const normalized = toEnglishDigits(mobile)
  const session = otpSessions.get(normalized)
  if (!session || session.expiresAt < Date.now()) {
    throw new Error('کد تأیید منقضی شده است. دوباره تلاش کنید.')
  }
  if (toEnglishDigits(code) !== DEMO_OTP) {
    throw new Error('کد تأیید نادرست است.')
  }
  const user = await loginByMobile(normalized)
  otpSessions.delete(normalized)
  return user
}

async function loginByMobile(mobile: string): Promise<User> {
  const user = read((db) => db.users.find((u) => u.mobile === mobile))
  if (!user) {
    throw new Error('حسابی با این شماره یافت نشد. ابتدا ثبت‌نام کنید.')
  }
  if (user.role === 'doctor') {
    const doctor = read((db) => db.doctors.find((d) => d.id === user.doctorId))
    if (doctor && doctor.status !== 'approved') {
      throw new Error('حساب پزشکی شما هنوز تأیید نشده است.')
    }
  }
  const fresh = mutate(
    (db) => {
      const u = db.users.find((x) => x.id === user.id)!
      u.lastLoginAt = new Date().toISOString()
      return u
    },
    'ورود به حساب'
  )
  useAuthStore.getState().login(fresh.id)
  return fresh
}

export async function loginWithPassword(identifier: string, password: string): Promise<User> {
  await latency()
  const id = toEnglishDigits(identifier).trim().toLowerCase()
  const user = read((db) =>
    db.users.find(
      (u) =>
        (u.mobile === id || (u.email ?? '').toLowerCase() === id) && u.password === password
    )
  )
  if (!user) throw new Error('شناسه یا رمز عبور نادرست است.')
  const fresh = await loginByMobile(user.mobile)
  return fresh
}

export async function registerPatient(input: {
  fullName: string
  mobile: string
  nationalId: string
  password: string
}): Promise<User> {
  await latency()
  const mobile = toEnglishDigits(input.mobile)
  const nationalId = toEnglishDigits(input.nationalId)
  if (!isValidNationalId(nationalId)) throw new Error('کد ملی معتبر نیست.')
  const exists = read((db) => db.users.find((u) => u.mobile === mobile))
  if (exists) throw new Error('با این شماره موبایل قبلاً ثبت‌نام شده است.')
  const natExists = read((db) => db.patients.some((p) => p.nationalId === nationalId))
  if (natExists) throw new Error('این کد ملی در سیستم ثبت شده است.')
  const user = mutate(
    (db) => {
      const now = new Date().toISOString()
      const patientId = `pt_${db.patients.length + 1}_${Math.random().toString(36).slice(2, 6)}`
      const u: User = {
        id: `u_${db.users.length + 1}_${Math.random().toString(36).slice(2, 6)}`,
        mobile,
        role: 'patient',
        fullName: input.fullName.trim(),
        nationalId,
        password: input.password,
        patientId,
        createdAt: now,
        lastLoginAt: now
      }
      db.users.push(u)
      db.patients.push({
        id: patientId,
        userId: u.id,
        fullName: u.fullName,
        gender: 'male',
        birthDate: '',
        nationalId,
        city: '',
        allergies: [],
        chronicConditions: [],
        medications: [],
        surgeries: [],
        familyHistory: [],
        completion: 10,
        createdAt: now,
        updatedAt: now
      })
      db.notifications.push({
        id: `nt_w_${u.id}`,
        userId: u.id,
        title: 'به هلثامد خوش آمدید 🌿',
        body: 'پرونده پزشکی خود را تکمیل کنید تا بتوانید از پزشکان مشاوره بگیرید.',
        kind: 'system',
        read: false,
        at: now,
        link: '/app/records'
      })
      return u
    },
    'ثبت‌نام بیمار'
  )
  useAuthStore.getState().login(user.id)
  return user
}

export async function registerDoctor(input: {
  fullName: string
  mobile: string
  email?: string
  password: string
  specialty: string
  medicalCouncilNumber: string
  city: string
  experienceYears: number
  bio: string
}): Promise<User> {
  await latency()
  const mobile = toEnglishDigits(input.mobile)
  const exists = read((db) => db.users.find((u) => u.mobile === mobile))
  if (exists) throw new Error('با این شماره موبایل قبلاً ثبت‌نام شده است.')
  const user = mutate(
    (db) => {
      const now = new Date().toISOString()
      const doctorId = `dr_new_${Math.random().toString(36).slice(2, 7)}`
      const u: User = {
        id: `u_${db.users.length + 1}_${Math.random().toString(36).slice(2, 6)}`,
        mobile,
        email: input.email || undefined,
        role: 'doctor',
        fullName: input.fullName.trim(),
        password: input.password,
        doctorId,
        createdAt: now,
        lastLoginAt: now
      }
      db.users.push(u)
      db.doctors.push({
        id: doctorId,
        userId: u.id,
        fullName: u.fullName,
        gender: 'male',
        specialty: input.specialty,
        medicalCouncilNumber: toEnglishDigits(input.medicalCouncilNumber),
        city: input.city,
        experienceYears: input.experienceYears,
        bio: input.bio,
        fee: 200000,
        status: 'pending',
        rating: 0,
        reviewCount: 0,
        visitCount: 0,
        weeklySchedule: {
          0: { enabled: true, start: '09:00', end: '13:00', slotMinutes: 30 },
          1: { enabled: true, start: '09:00', end: '13:00', slotMinutes: 30 },
          2: { enabled: true, start: '09:00', end: '13:00', slotMinutes: 30 },
          3: { enabled: true, start: '09:00', end: '13:00', slotMinutes: 30 },
          4: { enabled: true, start: '09:00', end: '13:00', slotMinutes: 30 },
          5: { enabled: false, start: '09:00', end: '13:00', slotMinutes: 30 },
          6: { enabled: false, start: '09:00', end: '13:00', slotMinutes: 30 }
        },
        daysOff: [],
        createdAt: now
      })
      db.notifications.push({
        id: `nt_doc_${u.id}`,
        userId: u.id,
        title: 'درخواست شما ثبت شد',
        body: 'پرونده شما در انتظار بررسی و تأیید مدیر است. پس از تأیید می‌توانید پذیرش بیمار را آغاز کنید.',
        kind: 'account',
        read: false,
        at: now
      })
      return u
    },
    'ثبت‌نام پزشک'
  )
  useAuthStore.getState().login(user.id)
  return user
}

/** Quick demo logins used on the login page. */
export const DEMO_ACCOUNTS: Array<{
  key: string
  label: string
  mobile: string
  password?: string
  role: 'patient-complete' | 'patient-incomplete' | 'doctor' | 'admin'
}> = [
  { key: 'pc', label: 'بیمار (پرونده کامل)', mobile: '09190000001', role: 'patient-complete' },
  { key: 'pi', label: 'بیمار (پرونده ناقص)', mobile: '09190000002', role: 'patient-incomplete' },
  { key: 'dr', label: 'پزشک', mobile: '09190000010', password: 'doctor123', role: 'doctor' },
  { key: 'ad', label: 'مدیر سیستم', mobile: '09190000020', password: 'admin123', role: 'admin' }
]

export async function demoLogin(key: string): Promise<User> {
  const account = DEMO_ACCOUNTS.find((a) => a.key === key)
  if (!account) throw new Error('حساب دمو یافت نشد.')
  await latency()
  return loginByMobile(account.mobile)
}

export function logout(): void {
  useAuthStore.getState().logout()
}

export function getCurrentUser(): User | null {
  const userId = useAuthStore.getState().userId
  if (!userId) return null
  return read((db) => db.users.find((u) => u.id === userId) ?? null)
}
