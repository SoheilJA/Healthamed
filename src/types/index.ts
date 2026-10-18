// Domain model for the Healthamed platform.

export type Role = 'patient' | 'doctor' | 'admin'
export type Gender = 'male' | 'female'
export type DoctorStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type VisitStatus = 'waiting' | 'active' | 'completed' | 'cancelled'
export type PrescriptionStatus = 'active' | 'delivered' | 'cancelled' | 'expired'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
export type Urgency = 'routine' | 'urgent'
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type AdminLevel = 'super' | 'standard' | 'support'
export type NotificationKind = 'visit' | 'prescription' | 'order' | 'system' | 'account'

export interface User {
  id: string
  mobile: string
  email?: string
  password?: string
  role: Role
  fullName: string
  nationalId?: string
  patientId?: string
  doctorId?: string
  createdAt: string
  lastLoginAt?: string
}

export interface AllergyRecord {
  substance: string
  severity: 'mild' | 'moderate' | 'severe'
  reaction?: string
}

export interface ChronicCondition {
  name: string
  sinceYear?: number
  controlled: boolean
  notes?: string
}

export interface MedicationStatement {
  drugId: string
  name: string
  dosage: string
  frequency: string
}

export interface Lifestyle {
  smoking: 'never' | 'former' | 'current'
  alcohol: 'never' | 'former' | 'current'
  exercise: 'none' | 'light' | 'regular' | 'intense'
  sleepHours?: number
}

export interface Insurance {
  provider: string
  number: string
}

export interface PatientProfile {
  id: string
  userId: string
  fullName: string
  gender: Gender
  birthDate: string // ISO date (Gregorian under the hood, Jalali in UI)
  nationalId: string
  bloodType?: BloodType
  heightCm?: number
  weightKg?: number
  city: string
  address?: string
  emergencyContact?: { name: string; phone: string; relation: string }
  allergies: AllergyRecord[]
  chronicConditions: ChronicCondition[]
  medications: MedicationStatement[]
  surgeries: string[]
  familyHistory: string[]
  lifestyle?: Lifestyle
  insurance?: Insurance
  notes?: string
  completion: number // 0..100
  // Wizard "explicitly empty" markers so "no allergies" still counts as data
  allergiesKnownEmpty?: boolean
  chronicKnownEmpty?: boolean
  medsKnownEmpty?: boolean
  createdAt: string
  updatedAt: string
}

export interface DaySchedule {
  enabled: boolean
  start: string // 'HH:mm'
  end: string // 'HH:mm'
  slotMinutes: number
}

/** weekday: 0 = شنبه ... 6 = جمعه */
export type WeeklySchedule = Record<number, DaySchedule>

export interface DoctorProfile {
  id: string
  userId: string
  fullName: string
  gender: Gender
  specialty: string // specialty id from catalog
  medicalCouncilNumber: string
  city: string
  experienceYears: number
  bio: string
  education?: string
  fee: number // toman
  status: DoctorStatus
  rating: number
  reviewCount: number
  visitCount: number
  weeklySchedule: WeeklySchedule
  daysOff: string[] // jalali dateKeys
  createdAt: string
}

export interface Slot {
  dateKey: string
  time: string // 'HH:mm'
  taken: boolean
}

export interface ChatMessage {
  id: string
  by: 'patient' | 'doctor'
  text: string
  at: string
}

export interface Visit {
  id: string
  patientId: string
  doctorId: string
  slot: { dateKey: string; time: string }
  status: VisitStatus
  urgency: Urgency
  chiefComplaint: string
  startedAt: string
  endedAt?: string
  createdAt: string
  messages: ChatMessage[]
  prescriptionId?: string
  patientRating?: number
}

export interface PrescriptionItem {
  drugId: string
  name: string
  dosage: string
  frequency: string
  durationDays: number
  instructions?: string
}

export interface Prescription {
  id: string
  trackingCode: string // HA-<jalaliYear>-<6 digits>
  visitId: string
  patientId: string
  doctorId: string
  items: PrescriptionItem[]
  notes?: string
  status: PrescriptionStatus
  issuedAt: string
  expiresAt: string
}

export interface OrderItem {
  drugId: string
  name: string
  qty: number
  price: number
}

export interface Order {
  id: string
  prescriptionId: string
  patientId: string
  pharmacyId: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  status: OrderStatus
  address?: string
  createdAt: string
  statusHistory: { status: OrderStatus; at: string }[]
}

export interface Pharmacy {
  id: string
  name: string
  city: string
  address: string
  phone: string
  openHours: string
  active: boolean
  rating: number
}

export interface Review {
  id: string
  visitId: string
  doctorId: string
  patientId: string
  rating: number
  comment?: string
  at: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  kind: NotificationKind
  read: boolean
  at: string
  link?: string
}

export interface AuditEntry {
  id: string
  actorId: string
  actorName: string
  action: string
  target?: string
  at: string
  meta?: string
}

export interface Database {
  users: User[]
  patients: PatientProfile[]
  doctors: DoctorProfile[]
  visits: Visit[]
  prescriptions: Prescription[]
  orders: Order[]
  pharmacies: Pharmacy[]
  reviews: Review[]
  notifications: Notification[]
  audit: AuditEntry[]
  seq: Record<string, number>
  seededAt?: string
}

// ---------- view models ----------

export interface EmergencyCard {
  fullName: string
  gender: Gender
  age: number
  bloodType?: BloodType
  nationalId: string
  allergies: AllergyRecord[]
  chronicConditions: string[]
  medications: string[]
  emergencyContact?: { name: string; phone: string; relation: string }
  insurance?: Insurance
  generatedAt: string
}

export interface Paged<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  pages: number
}

export interface PrescriptionWarning {
  level: 'danger' | 'warning'
  code: 'allergy' | 'interaction' | 'duplicate'
  message: string
  drugNames: string[]
}
