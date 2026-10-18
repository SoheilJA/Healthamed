// Deterministic database seeder (mulberry32 PRNG, fixed seed).
// Creates demo users, ~1000 patients, 43 doctors, 6 pharmacies,
// ~500 historical visits/prescriptions/orders/reviews, notifications, audit log.
import type {
  AdminLevel,
  AuditEntry,
  ChatMessage,
  Database,
  DoctorProfile,
  Notification,
  Order,
  OrderStatus,
  PatientProfile,
  Pharmacy,
  Prescription,
  PrescriptionItem,
  Review,
  User,
  Visit,
  WeeklySchedule
} from '@/types'
import {
  CHRONIC_CONDITIONS_POOL,
  COMMON_ALLERGENS,
  DOCTOR_BIOS,
  DOCTOR_EDUCATIONS,
  DRUGS,
  FAMILY_NAMES,
  FEMALE_NAMES,
  MALE_NAMES,
  SPECIALTIES
} from './catalog'
import { generateNationalId } from '@/lib/persian'
import { dateKey, jalaliYear, toGregorian } from '@/lib/jalali'
import { pad } from '@/lib/utils'

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const R = mulberry32(14031403)
const ri = (min: number, max: number) => Math.floor(R() * (max - min + 1)) + min
const pk = <T>(arr: readonly T[]): T => arr[Math.floor(R() * arr.length)]
const pickN = <T>(arr: readonly T[], n: number): T[] => {
  const copy = [...arr]
  const out: T[] = []
  while (out.length < n && copy.length > 0) out.push(copy.splice(Math.floor(R() * copy.length), 1)[0])
  return out
}
const chance = (p: number) => R() < p
const daysAgo = (n: number, hour = 10, minute = 0): Date => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, minute, 0, 0)
  return d
}
const iso = (d: Date) => d.toISOString()

const PATIENT_OPENERS = [
  'سلام دکتر، از دیشب این مشکل رو دارم و نگران شدم.',
  'وقت بخیر، چند روزه حالم خوب نیست.',
  'سلام و خسته نباشید، ببخشید مزاحم می‌شم.',
  'سلام دکتر عزیز، مشکل من از هفته پیش شروع شده.'
]
const DOCTOR_REPLIES = [
  'سلام، وقت بخیر. لطفاً دقیق‌تر توضیح بدهید علائم از چه زمانی شروع شده؟',
  'درک می‌کنم. آیا تب، سرفه یا علائم دیگری هم همراهش هست؟',
  'آیا دارویی مصرف می‌کنید یا به دارویی حساسیت دارید؟',
  'با توجه به توضیحات شما احتمالاً مشکل جدی نیست، اما برای اطمینان چند نکته را بررسی می‌کنیم.',
  'حتماً مایعات کافی مصرف کنید و استراحت کنید. اگر تشدید شد خبر بدهید.',
  'برای شما نسخه‌ای صادر می‌کنم. در صورت ادامه علائم پس از یک هفته، حتماً مراجعه حضوری داشته باشید.'
]
const REVIEW_COMMENTS = [
  'برخورد خیلی خوب و پاسخگویی سریع داشتند. ممنونم.',
  'توضیحات کامل و دقیق بود. راضی بودم.',
  'دکتر با حوصله جواب دادند و نگرانیم رو برطرف کردند.',
  'خوب بود، ولی پاسخ کمی طول کشید.',
  'عالی بود، حتماً دوباره مراجعه می‌کنم.',
  'نسخه مؤثر بود و علائم من بهتر شد. سپاسگزارم.'
]
const STREETS = [
  'خیابان ولیعصر',
  'خیابان شریعتی',
  'بلوار فردوس',
  'خیابان کارگر شمالی',
  'بلوار کشاورز',
  'خیابان انقلاب',
  'بلوار آب و فیروزه',
  'خیابان سعادت‌آباد'
]

const DEFAULT_SCHEDULE = (evening: boolean): WeeklySchedule => {
  const s: WeeklySchedule = {}
  for (let w = 0; w < 7; w++) {
    if (w === 6) s[w] = { enabled: false, start: '09:00', end: '13:00', slotMinutes: 30 }
    else if (evening && w <= 3) s[w] = { enabled: true, start: '09:00', end: '13:00', slotMinutes: 30 }
    else s[w] = { enabled: true, start: '09:00', end: '13:00', slotMinutes: 30 }
  }
  return s
}

export function seedDatabase(): Database {
  const users: User[] = []
  const patients: PatientProfile[] = []
  const doctors: DoctorProfile[] = []
  const visits: Visit[] = []
  const prescriptions: Prescription[] = []
  const orders: Order[] = []
  const pharmacies: Pharmacy[] = []
  const reviews: Review[] = []
  const notifications: Notification[] = []
  const audit: AuditEntry[] = []
  const now = new Date()

  // ---------- demo users ----------
  users.push({
    id: 'u_1',
    mobile: '09190000001',
    role: 'patient',
    fullName: 'زهرا محمدی',
    nationalId: '0012345678',
    patientId: 'pt_1',
    createdAt: iso(daysAgo(220, 9)),
    lastLoginAt: iso(daysAgo(1, 18))
  })
  users.push({
    id: 'u_2',
    mobile: '09190000002',
    role: 'patient',
    fullName: 'علی رضایی',
    nationalId: '0087654321',
    patientId: 'pt_2',
    createdAt: iso(daysAgo(3, 11)),
    lastLoginAt: iso(daysAgo(3, 11))
  })
  users.push({
    id: 'u_3',
    mobile: '09190000010',
    role: 'doctor',
    fullName: 'امیر حسینی',
    doctorId: 'dr_1',
    password: 'doctor123',
    createdAt: iso(daysAgo(400, 9)),
    lastLoginAt: iso(daysAgo(0, 8))
  })
  users.push({
    id: 'u_4',
    mobile: '09190000020',
    role: 'admin',
    fullName: 'مدیر سیستم هلثامد',
    password: 'admin123',
    createdAt: iso(daysAgo(500, 9)),
    lastLoginAt: iso(daysAgo(0, 7))
  })

  // ---------- demo patient profiles ----------
  patients.push({
    id: 'pt_1',
    userId: 'u_1',
    fullName: 'زهرا محمدی',
    gender: 'female',
    birthDate: iso(toGregorian(1372, 3, 15)),
    nationalId: '0012345678',
    bloodType: 'O+',
    heightCm: 166,
    weightKg: 61,
    city: 'تهران',
    address: 'تهران، خیابان ولیعصر، کوچه بهار، پلاک ۱۲',
    emergencyContact: { name: 'محمد محمدی', phone: '09121112233', relation: 'همسر' },
    allergies: [
      { substance: 'پنی‌سیلین', severity: 'severe', reaction: 'کهیر و تنگی نفس' },
      { substance: 'فاتوماتِ گل، گرده گیاهان', severity: 'mild', reaction: 'عطسه و آبریزش چشم' }
    ],
    chronicConditions: [{ name: 'آسم', sinceYear: 1390, controlled: true, notes: 'با اسپری کنترل می‌شود' }],
    medications: [{ drugId: 'd29', name: 'سالدبوتامول اسپری', dosage: '۱۰۰ میکروگرم/پاف', frequency: 'در صورت نیاز' }],
    surgeries: ['آپاندکتومی (۱۳۹۴)'],
    familyHistory: ['فشار خون بالا (مادر)'],
    lifestyle: { smoking: 'never', alcohol: 'never', exercise: 'regular', sleepHours: 7 },
    insurance: { provider: 'تأمین اجتماعی', number: '4457821199' },
    completion: 100,
    createdAt: iso(daysAgo(220, 9)),
    updatedAt: iso(daysAgo(40, 16))
  })
  patients.push({
    id: 'pt_2',
    userId: 'u_2',
    fullName: 'علی رضایی',
    gender: 'male',
    birthDate: iso(toGregorian(1365, 9, 2)),
    nationalId: '0087654321',
    city: 'کرج',
    allergies: [],
    chronicConditions: [],
    medications: [],
    surgeries: [],
    familyHistory: [],
    completion: 25,
    createdAt: iso(daysAgo(3, 11)),
    updatedAt: iso(daysAgo(3, 11))
  })

  // ---------- doctors (40 approved incl. demo + 3 pending) ----------
  const SPECIALTY_IDS = SPECIALTIES.map((s) => s.id)
  const maleDrNames: string[] = []
  const femaleDrNames: string[] = []
  for (let i = 0; i < 30; i++) {
    maleDrNames.push(`${pk(MALE_NAMES)} ${pk(FAMILY_NAMES)}`)
    femaleDrNames.push(`${pk(FEMALE_NAMES)} ${pk(FAMILY_NAMES)}`)
  }
  const usedNames = new Set<string>(['امیر حسینی'])
  const makeDoctorName = (female: boolean): string => {
    for (let tries = 0; tries < 40; tries++) {
      const n = female ? femaleDrNames.pop()! : maleDrNames.pop()!
      if (!usedNames.has(n)) {
        usedNames.add(n)
        return n
      }
    }
    return `${pk(female ? FEMALE_NAMES : MALE_NAMES)} ${pk(FAMILY_NAMES)}`
  }
  const FEE_BY_SPECIALTY: Record<string, number> = {
    general: 120000, internal: 220000, cardiology: 350000, neurology: 330000,
    orthopedics: 300000, dermatology: 280000, psychiatry: 320000, pediatrics: 200000,
    gynecology: 300000, ent: 260000, ophthalmology: 280000, dentistry: 250000,
    nutrition: 180000, endocrinology: 300000, urology: 290000, pulmonology: 280000
  }
  for (let i = 1; i <= 43; i++) {
    const female = i % 3 === 0
    const specialty = i === 1 ? 'internal' : SPECIALTY_IDS[(i * 7 + 3) % SPECIALTY_IDS.length]
    const experience = i === 1 ? 12 : ri(3, 28)
    const status = i <= 40 ? 'approved' : 'pending'
    const daysOff: string[] = []
    const offCount = ri(0, 2)
    for (let k = 0; k < offCount; k++) {
      const d = new Date()
      d.setDate(d.getDate() + ri(1, 20))
      daysOff.push(dateKey(d))
    }
    doctors.push({
      id: `dr_${i}`,
      userId: i === 1 ? 'u_3' : `u_dr_${i}`,
      fullName: i === 1 ? 'امیر حسینی' : makeDoctorName(female),
      gender: female ? 'female' : 'male',
      specialty,
      medicalCouncilNumber: String(10000 + ((i * 3797) % 89000)),
      city: pk(['تهران', 'تهران', 'تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج', 'قم', 'اهواز']),
      experienceYears: experience,
      bio: DOCTOR_BIOS[i % DOCTOR_BIOS.length].replace('{n}', String(experience)),
      education: pk(DOCTOR_EDUCATIONS),
      fee: FEE_BY_SPECIALTY[specialty] ?? 200000,
      status,
      rating: 4.5,
      reviewCount: 0,
      visitCount: 0,
      weeklySchedule: DEFAULT_SCHEDULE(chance(0.4)),
      daysOff,
      createdAt: iso(daysAgo(ri(60, 420), 9))
    })
    if (i > 1) {
      users.push({
        id: `u_dr_${i}`,
        mobile: `0915${pad(1000000 + i * 4321, 7)}`.slice(0, 11),
        role: 'doctor',
        fullName: doctors[doctors.length - 1].fullName,
        doctorId: `dr_${i}`,
        createdAt: doctors[doctors.length - 1].createdAt
      })
    }
  }

  // ---------- batch patients (1000) ----------
  const usedMobiles = new Set(['09190000001', '09190000002', '09190000010', '09190000020'])
  const usedNatIds = new Set(['0012345678', '0087654321'])
  for (let i = 1; i <= 1000; i++) {
    const gender = chance(0.52) ? 'female' : 'male'
    const fullName = `${gender === 'female' ? pk(FEMALE_NAMES) : pk(MALE_NAMES)} ${pk(FAMILY_NAMES)}`
    let mobile = ''
    do {
      mobile = `09${pk(['12', '19', '35', '21', '91', '93', '90'])}${String(ri(1000000, 9999999)).padStart(7, '0')}`
    } while (usedMobiles.has(mobile))
    usedMobiles.add(mobile)
    let natId = generateNationalId(R)
    while (usedNatIds.has(natId)) natId = generateNationalId(R)
    usedNatIds.add(natId)
    const jy = ri(1305, 1382)
    const jm = ri(1, 12)
    const jd = ri(1, 28)
    const allergies = chance(0.35) ? pickN(COMMON_ALLERGENS, ri(1, 2)).map((substance) => ({
      substance,
      severity: pk(['mild', 'mild', 'moderate', 'severe']) as 'mild' | 'moderate' | 'severe',
      reaction: pk(['کهیر و خارش', 'تنگی نفس', 'ورم صورت', 'درد شکم'])
    })) : []
    const chronicConditions = chance(0.4) ? pickN(CHRONIC_CONDITIONS_POOL, ri(1, 2)).map((name) => ({
      name,
      sinceYear: ri(1390, 1403),
      controlled: chance(0.7),
      notes: undefined
    })) : []
    const medications = chance(0.25) ? pickN(DRUGS, ri(1, 2)).map((d) => ({
      drugId: d.id,
      name: d.name,
      dosage: d.strength,
      frequency: pk(['روزانه یک بار', 'روزانه دو بار', 'هر ۱۲ ساعت', 'در صورت نیاز'])
    })) : []
    const insuranceProviders = ['تأمین اجتماعی', 'خدمات درمانی (سلامت)', 'نیروهای مسلح', 'بیمه ایران', 'بیمه دانا', 'فاقد بیمه']
    const prov = pk(insuranceProviders)
    const userId = `u_pt_${i}`
    users.push({
      id: userId,
      mobile,
      role: 'patient',
      fullName,
      nationalId: natId,
      patientId: `pt_${i + 2}`,
      createdAt: iso(daysAgo(ri(1, 400), ri(8, 20)))
    })
    patients.push({
      id: `pt_${i + 2}`,
      userId,
      fullName,
      gender,
      birthDate: iso(toGregorian(jy, jm, jd)),
      nationalId: natId,
      bloodType: chance(0.85) ? (pk(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']) as PatientProfile['bloodType']) : undefined,
      heightCm: gender === 'female' ? ri(150, 180) : ri(162, 195),
      weightKg: gender === 'female' ? ri(45, 95) : ri(58, 115),
      city: pk(['تهران', 'تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج', 'قم', 'اهواز', 'رشت', 'یزد', 'همدان']),
      address: undefined,
      emergencyContact: chance(0.8)
        ? {
            name: `${pk([...MALE_NAMES, ...FEMALE_NAMES])} ${pk(FAMILY_NAMES)}`,
            phone: `0912${String(ri(1000000, 9999999))}`,
            relation: pk(['همسر', 'پدر', 'مادر', 'خواهر', 'برادر', 'فرزند'])
          }
        : undefined,
      allergies,
      chronicConditions,
      medications,
      surgeries: chance(0.2) ? [pk(['آپاندکتومی', 'سزارین', 'جراحی کیسه صفرا', 'جراحی زانو', 'ترمیم هرنیا'])] : [],
      familyHistory: chance(0.25) ? pickN(['دیابت (پدر)', 'فشار خون (مادر)', 'سرطان (خویشاوند)', 'بیماری قلبی (پدر)', 'تیروئید (مادر)'], 1) : [],
      lifestyle: {
        smoking: pk(['never', 'never', 'never', 'former', 'current']),
        alcohol: 'never',
        exercise: pk(['none', 'light', 'light', 'regular', 'regular', 'intense']),
        sleepHours: ri(4, 10)
      },
      insurance: prov !== 'فاقد بیمه' ? { provider: prov, number: String(ri(1000000000, 9999999999)) } : undefined,
      completion: 100,
      createdAt: iso(daysAgo(ri(1, 400), ri(8, 20))),
      updatedAt: iso(daysAgo(ri(0, 30), ri(8, 20)))
    })
  }

  // ---------- pharmacies (6) ----------
  const pharmacySeeds: Array<[string, string, string, string]> = [
    ['داروخانه دکتر عباسی', 'تهران', 'خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۲۴۰', '02188776655'],
    ['داروخانه شبانه‌روزی مهر', 'تهران', 'بلوار کشاورز، نبش کوچه یاس، پلاک ۸', '02188994433'],
    ['داروخانه شهرruz', 'مشهد', 'بلوار وکیل‌آباد، بین دانشجو ۱۰ و ۱۲', '05138445566'],
    ['داروخانه سلامت', 'اصفهان', 'خیابان چهارباغ بالا، مجتمع پارک، طبقه همکف', '03136677889'],
    ['داروخانه زندگی', 'شیراز', 'بلوار زند، روبروی بانک ملی', '07132233445'],
    ['داروخانه نیک‌سلامت', 'تبریز', 'خیابان امام، مقابل شهرداری', '04133344556']
  ]
  pharmacySeeds.forEach((p, i) => {
    pharmacies.push({
      id: `ph_${i + 1}`,
      name: p[0].includes('ruz') ? 'داروخانه شهرناز' : p[0],
      city: p[1],
      address: p[2],
      phone: p[3],
      openHours: i % 2 === 0 ? '۸:۰۰ تا ۲۳:۰۰' : '۲۴ ساعته',
      active: true,
      rating: 3.9 + ((i * 7) % 11) / 10
    })
  })

  // ---------- historical visits / prescriptions / orders / reviews ----------
  const COMPLAINTS = [
    'سردرد و خستگی', 'تب و گلودرد', 'سرفه خشک', 'درد شکم', 'سرگیجه', 'کمردرد',
    'خارش پوست', 'اضطراب و بی‌خوابی', 'کنترل فشار خون', 'کنترل قند خون', 'مشاوره تغذیه', 'درد زانو'
  ]
  const approvedDoctors = doctors.filter((d) => d.status === 'approved')
  const batchPatientIds = patients.map((p) => p.id)
  const poolPatients = batchPatientIds.slice(2) // exclude the two demo patients

  const makeMessages = (startedAt: Date, count: number): ChatMessage[] => {
    const msgs: ChatMessage[] = []
    let t = new Date(startedAt)
    msgs.push({ id: `msg_${msgs.length}_${R().toString(36).slice(2, 6)}`, by: 'patient', text: pk(PATIENT_OPENERS), at: iso(t) })
    for (let m = 1; m < count; m++) {
      t = new Date(t.getTime() + ri(2, 9) * 60000)
      msgs.push({
        id: `msg_${m}_${R().toString(36).slice(2, 6)}`,
        by: m % 2 === 1 ? 'doctor' : 'patient',
        text: pk(DOCTOR_REPLIES.concat(['ممنون از توضیحاتتان.', 'الان نسخه را برایتان صادر می‌کنم.'])),
        at: iso(t)
      })
    }
    return msgs
  }

  let visitSeq = 0
  let rxSeq = 0
  let orderSeq = 0
  let reviewSeq = 0

  const addHistoricalVisit = (patientId: string, doctorId: string, daysBack: number): void => {
    visitSeq++
    const doctor = doctors.find((d) => d.id === doctorId)!
    const startedAt = daysAgo(daysBack, ri(9, 18), ri(0, 59))
    const withRx = chance(0.55)
    const messages = makeMessages(startedAt, ri(3, 6))
    const vid = `vs_${String(visitSeq).padStart(5, '0')}`
    const visit: Visit = {
      id: vid,
      patientId,
      doctorId,
      slot: { dateKey: dateKey(startedAt), time: `${pad(ri(9, 12))}:${pk(['00', '30'])}` },
      status: 'completed',
      urgency: chance(0.15) ? 'urgent' : 'routine',
      chiefComplaint: pk(COMPLAINTS),
      startedAt: iso(startedAt),
      endedAt: iso(new Date(startedAt.getTime() + ri(12, 35) * 60000)),
      createdAt: iso(startedAt),
      messages,
      patientRating: undefined
    }
    visits.push(visit)

    if (withRx) {
      rxSeq++
      const itemCount = ri(1, 4)
      const chosen = pickN(DRUGS, itemCount)
      const items: PrescriptionItem[] = chosen.map((d) => ({
        drugId: d.id,
        name: d.name,
        dosage: d.strength,
        frequency: pk(['روزانه یک بار بعد از غذا', 'روزانه دو بار', 'هر ۸ ساعت', 'شب‌ها قبل از خواب', 'در صورت نیاز']),
        durationDays: ri(3, 14),
        instructions: chance(0.4) ? pk(['با معده پر مصرف شود', 'دوره کامل را finish کنید', 'از مصرف خودسرانه خودداری کنید']).replace('finish', 'تمام') : undefined
      }))
      const issuedAt = new Date(new Date(visit.endedAt!).getTime() + 5 * 60000)
      const rx: Prescription = {
        id: `rx_${String(rxSeq).padStart(5, '0')}`,
        trackingCode: `HA-${jalaliYear(issuedAt)}-${pad(100000 + rxSeq * 137, 6)}`,
        visitId: vid,
        patientId,
        doctorId,
        items,
        notes: chance(0.3) ? 'در صورت تشدید علائم مراجعه حضوری انجام شود.' : undefined,
        status: 'delivered',
        issuedAt: iso(issuedAt),
        expiresAt: iso(new Date(issuedAt.getTime() + 30 * 86400000))
      }
      prescriptions.push(rx)
      visit.prescriptionId = rx.id

      if (chance(0.5)) {
        orderSeq++
        const pharmacy = pk(pharmacies)
        const orderItems = items.map((it) => {
          const drug = DRUGS.find((d) => d.id === it.drugId)!
          return { drugId: it.drugId, name: it.name, qty: ri(1, 2), price: drug.price }
        })
        const subtotal = orderItems.reduce((s, oi) => s + oi.price * oi.qty, 0)
        const deliveryFee = ri(35000, 60000)
        const createdAt = new Date(issuedAt.getTime() + ri(10, 60) * 60000)
        const history: Order['statusHistory'] = [{ status: 'pending', at: iso(createdAt) }]
        const stages: OrderStatus[] = ['confirmed', 'preparing', 'ready', 'delivered']
        let st = new Date(createdAt)
        for (const s of stages) {
          st = new Date(st.getTime() + ri(20, 90) * 60000)
          history.push({ status: s, at: iso(st) })
        }
        orders.push({
          id: `or_${String(orderSeq).padStart(5, '0')}`,
          prescriptionId: rx.id,
          patientId,
          pharmacyId: pharmacy.id,
          items: orderItems,
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          status: 'delivered',
          address: `${pk(['تهران', 'مشهد', 'اصفهان'])}، ${pk(STREETS)}`,
          createdAt: iso(createdAt),
          statusHistory: history
        })
      }
    }

    if (chance(0.45)) {
      reviewSeq++
      reviews.push({
        id: `rw_${String(reviewSeq).padStart(5, '0')}`,
        visitId: vid,
        doctorId,
        patientId,
        rating: pk([3, 4, 4, 5, 5, 5]),
        comment: chance(0.6) ? pk(REVIEW_COMMENTS) : undefined,
        at: iso(new Date(startedAt.getTime() + 86400000))
      })
    }
    void doctor
  }

  // demo patient history (pt_1)
  addHistoricalVisit('pt_1', 'dr_1', 21)
  addHistoricalVisit('pt_1', 'dr_3', 45)
  addHistoricalVisit('pt_1', 'dr_5', 100)
  // doctor demo has a couple of extra recent visits
  addHistoricalVisit('pt_10', 'dr_1', 5)
  addHistoricalVisit('pt_25', 'dr_1', 2)
  // batch history
  for (let i = 0; i < 495; i++) {
    const patientId = pk(poolPatients)
    const doctorId = pk(approvedDoctors).id
    addHistoricalVisit(patientId, doctorId, ri(1, 180))
  }

  // live visit for demo patient (active chat, no prescription yet)
  const liveStart = new Date(Date.now() - 9 * 60000)
  visits.push({
    id: 'vs_live_demo',
    patientId: 'pt_1',
    doctorId: 'dr_1',
    slot: { dateKey: dateKey(new Date()), time: `${pad(new Date().getHours())}:00` },
    status: 'active',
    urgency: 'routine',
    chiefComplaint: 'سردرد و خستگی از دیشب',
    startedAt: iso(liveStart),
    createdAt: iso(liveStart),
    messages: [
      { id: 'm1', by: 'patient', text: 'سلام دکتر، از دیشب سردرد دارم و خیلی خسته‌ام.', at: iso(liveStart) },
      {
        id: 'm2',
        by: 'doctor',
        text: 'سلام، وقت بخیر. آیا تب هم دارید؟ آیا دارویی مصرف می‌کنید یا حساسیت دارویی دارید؟',
        at: iso(new Date(liveStart.getTime() + 90 * 1000))
      },
      { id: 'm3', by: 'patient', text: 'تب ندارم. حساسیت پنی‌سیلین دارم و اسپری آسم مصرف می‌کنم.', at: iso(new Date(liveStart.getTime() + 3 * 60 * 1000)) }
    ]
  })

  // two waiting visits in doctor demo queue
  for (let i = 0; i < 2; i++) {
    const patientId = pk(poolPatients)
    const wStart = new Date(Date.now() - ri(3, 15) * 60000)
    visits.push({
      id: `vs_wait_${i + 1}`,
      patientId,
      doctorId: 'dr_1',
      slot: { dateKey: dateKey(new Date()), time: `${pad(ri(10, 13))}:00` },
      status: 'waiting',
      urgency: i === 0 ? 'urgent' : 'routine',
      chiefComplaint: pk(COMPLAINTS),
      startedAt: iso(wStart),
      createdAt: iso(wStart),
      messages: [{ id: 'w1', by: 'patient', text: pk(PATIENT_OPENERS), at: iso(wStart) }]
    })
  }

  // ---------- doctor aggregates ----------
  const ratingBy = new Map<string, { sum: number; n: number }>()
  for (const r of reviews) {
    const cur = ratingBy.get(r.doctorId) ?? { sum: 0, n: 0 }
    cur.sum += r.rating
    cur.n++
    ratingBy.set(r.doctorId, cur)
  }
  for (const d of doctors) {
    const rv = ratingBy.get(d.id)
    const base = 30
    d.reviewCount = (rv?.n ?? 0) + base
    d.rating = Math.round(((rv?.sum ?? 0) + 4.5 * base) / ((rv?.n ?? 0) + base) * 10) / 10
    d.visitCount = visits.filter((v) => v.doctorId === d.id).length + ri(80, 400)
  }

  // ---------- notifications for demo patient ----------
  const demoNotifs: Array<[string, string, Notification['kind'], number, string | undefined]> = [
    ['به هلثامد خوش آمدید 🌿', 'پرونده پزشکی خود را کامل کنید تا بهترین خدمت را دریافت کنید.', 'system', 220, '/app/records'],
    ['نسخه جدید صادر شد', 'دکتر امیر حسینی برای شما نسخه‌ای با کد پیگیری صادر کرد.', 'prescription', 21, '/app/records?tab=prescriptions'],
    ['سفارش شما تحویل شد', 'سفارش داروهای شما از داروخانه دکتر عباسی تحویل داده شد.', 'order', 20, '/app/orders'],
    ['یادآوری ویزیت', 'شما یک ویزیت فعال با دکتر امیر حسینی دارید.', 'visit', 0, '/app/visits'],
    ['نکته سلامت امروز', 'روزانه ۳۰ دقیقه پیاده‌روی، بهترین دوست قلب شماست.', 'system', 1, undefined]
  ]
  demoNotifs.forEach((n, i) => {
    notifications.push({
      id: `nt_demo_${i + 1}`,
      userId: 'u_1',
      title: n[0],
      body: n[1],
      kind: n[2],
      read: i !== 3,
      at: iso(daysAgo(n[3], 10)),
      link: n[4]
    })
  })

  // ---------- audit log ----------
  const AUDIT_ACTIONS: Array<[string, string]> = [
    ['login', 'ورود مدیر'],
    ['doctor.approve', 'تأیید پزشک جدید'],
    ['patient.import', 'ورود گروهی ۵۰ بیمار از CSV'],
    ['pharmacy.create', 'ایجاد داروخانه جدید'],
    ['pharmacy.update', 'ویرایش اطلاعات داروخانه'],
    ['order.advance', 'تغییر وضعیت سفارش'],
    ['patient.view', 'مشاهده پرونده بیمار'],
    ['permissions.update', 'به‌روزرسانی سطوح دسترسی']
  ]
  for (let i = 0; i < 60; i++) {
    const [action, target] = pk(AUDIT_ACTIONS)
    audit.push({
      id: `au_${String(i + 1).padStart(4, '0')}`,
      actorId: 'u_4',
      actorName: 'مدیر سیستم هلثامد',
      action,
      target,
      at: iso(daysAgo(ri(0, 60), ri(8, 18), ri(0, 59))),
      meta: undefined
    })
  }

  void now

  return {
    users,
    patients,
    doctors,
    visits,
    prescriptions,
    orders,
    pharmacies,
    reviews,
    notifications,
    audit,
    seq: {},
    seededAt: iso(new Date())
  }
}

/** Admin permission matrix (module x level). */
export const PERMISSIONS: Record<string, Record<AdminLevel, boolean>> = {
  'داشبورد و گزارش‌ها': { super: true, standard: true, support: false },
  'مدیریت بیماران': { super: true, standard: true, support: true },
  'ورود گروهی بیماران (CSV)': { super: true, standard: true, support: false },
  'مدیریت پزشکان': { super: true, standard: true, support: false },
  'مدیریت داروخانه‌ها': { super: true, standard: false, support: false },
  'سطوح دسترسی': { super: true, standard: false, support: false },
  'گزارش حسابرسی': { super: true, standard: true, support: true }
}

export const LEVEL_PRESETS: Record<AdminLevel, string> = {
  super: 'دسترسی کامل به تمام بخش‌ها',
  standard: 'دسترسی عملیاتی بدون تغییر زیرساخت',
  support: 'پاسخگویی و پشتیبانی بیماران'
}
