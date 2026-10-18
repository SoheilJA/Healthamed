// Persian labels for every enum/status used across the app.
import type {
  OrderStatus,
  PrescriptionStatus,
  VisitStatus,
  DoctorStatus,
  Gender,
  Urgency,
  NotificationKind
} from '@/types'

export const VISIT_STATUS: Record<VisitStatus, string> = {
  waiting: 'در انتظار',
  active: 'در حال انجام',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده'
}

export const PRESCRIPTION_STATUS: Record<PrescriptionStatus, string> = {
  active: 'فعال',
  delivered: 'تحویل شده',
  cancelled: 'ابطال شده',
  expired: 'منقضی شده'
}

export const ORDER_STATUS: Record<OrderStatus, string> = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شده',
  preparing: 'در حال آماده‌سازی',
  ready: 'آماده تحویل',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده'
}

export const DOCTOR_STATUS: Record<DoctorStatus, string> = {
  pending: 'در انتظار تأیید',
  approved: 'تأیید شده',
  rejected: 'رد شده',
  suspended: 'معلق'
}

export const GENDER: Record<Gender, string> = {
  male: 'آقا',
  female: 'خانم'
}

export const URGENCY: Record<Urgency, string> = {
  routine: 'معمولی',
  urgent: 'فوری'
}

export const NOTIFICATION_KIND: Record<NotificationKind, { label: string; emoji: string }> = {
  visit: { label: 'ویزیت', emoji: '🩺' },
  prescription: { label: 'نسخه', emoji: '💊' },
  order: { label: 'سفارش', emoji: '📦' },
  system: { label: 'سیستم', emoji: '⚙️' },
  account: { label: 'حساب', emoji: '👤' }
}

export const LIFESTYLE = {
  smoking: { never: 'نمی‌کشم', former: 'ترک کرده‌ام', current: 'می‌کشم' },
  alcohol: { never: 'مصرف نمی‌کنم', former: 'قبلاً مصرف می‌کردم', current: 'مصرف می‌کنم' },
  exercise: { none: 'بدون تحرک', light: 'کم‌تحرک', regular: 'منظم', intense: 'ورزشکار حرفه‌ای' }
} as const

export const SEVERITY = { mild: 'خفیف', moderate: 'متوسط', severe: 'شدید' } as const

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

export const CITIES = [
  'تهران',
  'مشهد',
  'اصفهان',
  'شیراز',
  'تبریز',
  'کرج',
  'قم',
  'اهواز',
  'رشت',
  'کرمانشاه',
  'یزد',
  'همدان',
  'ساری',
  'بندرعباس',
  'شاهرود',
  'زاهدان'
]

export const INSURANCE_PROVIDERS = [
  'تأمین اجتماعی',
  'خدمات درمانی (سلامت)',
  'نیروهای مسلح',
  'بیمه ایران',
  'بیمه دانا',
  'بیمه پاسارگاد',
  'فاقد بیمه'
]

export const CHAT_ROLES = { patient: 'بیمار', doctor: 'پزشک' } as const

/** Human readable audit action labels. */
export function auditActionLabel(action: string): string {
  const map: Record<string, string> = {
    login: 'ورود به سیستم',
    'doctor.approve': 'تأیید پزشک',
    'doctor.reject': 'رد درخواست پزشک',
    'doctor.suspend': 'معلق کردن پزشک',
    'patient.import': 'ورود گروهی بیمار',
    'patient.view': 'مشاهده پرونده بیمار',
    'pharmacy.create': 'ایجاد داروخانه',
    'pharmacy.update': 'ویرایش داروخانه',
    'pharmacy.delete': 'حذف داروخانه',
    'permissions.update': 'تغییر سطوح دسترسی',
    'order.advance': 'تغییر وضعیت سفارش',
    'prescription.issue': 'صدور نسخه'
  }
  return map[action] ?? action
}
