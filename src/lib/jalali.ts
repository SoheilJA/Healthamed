// Jalali (Solar Hijri) calendar utilities.
// Conversion algorithm: the canonical jalaali-js algorithm (public domain).
// Additional formatting uses date-fns-jalali for calendar-day math.
import { differenceInCalendarDays } from 'date-fns-jalali'
import { pad } from './utils'
import { toPersianDigits } from './persian'

export interface JalaliDate {
  jy: number
  jm: number
  jd: number
}

export const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
]

/** Persian week starts on Saturday. Index 0 = شنبه ... 6 = جمعه */
export const PERSIAN_WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
export const PERSIAN_WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

// ---------- core conversion (jalaali-js algorithm) ----------
const div = (a: number, b: number) => Math.trunc(a / b)
const mod = (a: number, b: number) => a - Math.trunc(a / b) * b

const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394,
  2456, 3178
]

function jalCal(jy: number): { leap: number; gy: number; march: number } {
  const bl = BREAKS.length
  const gy = jy + 621
  let leapJ = -14
  let jp = BREAKS[0]
  let jm = 0
  let jump = 0
  if (jy < jp || jy >= BREAKS[bl - 1]) throw new Error('Invalid Jalali year ' + jy)
  for (let i = 1; i < bl; i += 1) {
    jm = BREAKS[i]
    jump = jm - jp
    if (jy < jm) break
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }
  let n = jy - jp
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150
  const march = 20 + leapJ - leapG
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33
  let leap = mod(mod(n + 1, 33) - 1, 4)
  if (leap === -1) leap = 4
  return { leap, gy, march }
}

function g2d(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
  return d
}

function d2g(jdn: number): { gy: number; gm: number; gd: number } {
  let j = 4 * jdn + 139361631
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
  const i = div(mod(j, 1461), 4) * 5 + 308
  const gd = div(mod(i, 153), 5) + 1
  const gm = mod(div(i, 153), 12) + 1
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6)
  return { gy, gm, gd }
}

function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy)
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
}

function d2j(jdn: number): JalaliDate {
  const gy = d2g(jdn).gy
  let jy = gy - 621
  const r = jalCal(jy)
  const jdn1f = g2d(gy, 3, r.march)
  let k = jdn - jdn1f
  if (k >= 0) {
    if (k <= 185) {
      const jm = 1 + div(k, 31)
      const jd = mod(k, 31) + 1
      return { jy, jm, jd }
    }
    k -= 186
  } else {
    jy -= 1
    k += 179
    if (r.leap === 1) k += 1
  }
  const jm = 7 + div(k, 30)
  const jd = mod(k, 30) + 1
  return { jy, jm, jd }
}

// ---------- public API ----------

export function toJalali(date: Date): JalaliDate {
  return d2j(g2d(date.getFullYear(), date.getMonth() + 1, date.getDate()))
}

export function toGregorian(jy: number, jm: number, jd: number): Date {
  const g = d2g(j2d(jy, jm, jd))
  return new Date(g.gy, g.gm - 1, g.gd)
}

export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  return jalCal(jy).leap === 1 ? 30 : 29
}

export function jalaliYear(date: Date): number {
  return toJalali(date).jy
}

/** JS getDay(): 0=Sunday..6=Saturday -> Persian week index 0=شنبه..6=جمعه */
export function persianWeekday(date: Date): number {
  return (date.getDay() + 1) % 7
}

/** Date -> Jalali key 'yyyy-m-d' (ISO-like, Latin digits, zero padded). */
export function dateKey(date: Date): string {
  const j = toJalali(date)
  return `${j.jy}-${pad(j.jm)}-${pad(j.jd)}`
}

/** Jalali key -> Date (local midnight). */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return toGregorian(y, m, d)
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export interface GridCell {
  key: string
  day: number
  inMonth: boolean
  isToday: boolean
  isPast: boolean
  weekday: number
  date: Date
}

export interface MonthGrid {
  jy: number
  jm: number
  monthName: string
  weeks: GridCell[][]
}

/** Build a Jalali month grid aligned to Persian week (شنبه first). */
export function buildJalaliMonthGrid(jy: number, jm: number, today = new Date()): MonthGrid {
  const total = jalaliMonthLength(jy, jm)
  const cells: GridCell[] = []
  const todayKey = dateKey(today)
  for (let d = 1; d <= total; d++) {
    const date = toGregorian(jy, jm, d)
    cells.push({
      key: `${jy}-${pad(jm)}-${pad(d)}`,
      day: d,
      inMonth: true,
      isToday: `${jy}-${pad(jm)}-${pad(d)}` === todayKey,
      isPast: date < new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      weekday: persianWeekday(date),
      date
    })
  }
  // leading days from previous month
  const first = cells[0]
  const prevMonth = jm === 1 ? { jy: jy - 1, jm: 12 } : { jy, jm: jm - 1 }
  const prevLen = jalaliMonthLength(prevMonth.jy, prevMonth.jm)
  for (let w = first.weekday - 1; w >= 0; w--) {
    const d = prevLen - w
    const date = toGregorian(prevMonth.jy, prevMonth.jm, d)
    cells.unshift({
      key: `${prevMonth.jy}-${pad(prevMonth.jm)}-${pad(d)}`,
      day: d,
      inMonth: false,
      isToday: false,
      isPast: true,
      weekday: persianWeekday(date),
      date
    })
  }
  // trailing days from next month
  const nextMonth = jm === 12 ? { jy: jy + 1, jm: 1 } : { jy, jm: jm + 1 }
  let nd = 1
  while (cells.length % 7 !== 0) {
    const date = toGregorian(nextMonth.jy, nextMonth.jm, nd)
    cells.push({
      key: `${nextMonth.jy}-${pad(nextMonth.jm)}-${pad(nd)}`,
      day: nd,
      inMonth: false,
      isToday: false,
      isPast: false,
      weekday: persianWeekday(date),
      date
    })
    nd++
  }
  const weeks: GridCell[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return { jy, jm, monthName: `${JALALI_MONTHS[jm - 1]} ${toPersianDigits(jy)}`, weeks }
}

// ---------- formatting ----------

export type JalaliStyle = 'full' | 'medium' | 'short' | 'monthYear' | 'relative'

/** Format a Date in Jalali with Persian digits. */
export function formatJalali(date: Date | string, style: JalaliStyle = 'medium'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const j = toJalali(d)
  switch (style) {
    case 'full':
      return `${PERSIAN_WEEKDAYS[persianWeekday(d)]} ${toPersianDigits(j.jd)} ${
        JALALI_MONTHS[j.jm - 1]
      } ${toPersianDigits(j.jy)}`
    case 'short':
      return toPersianDigits(`${j.jy}/${pad(j.jm)}/${pad(j.jd)}`)
    case 'monthYear':
      return `${JALALI_MONTHS[j.jm - 1]} ${toPersianDigits(j.jy)}`
    case 'relative': {
      const diff = differenceInCalendarDays(new Date(), d)
      if (diff === 0) return 'امروز'
      if (diff === 1) return 'دیروز'
      if (diff === -1) return 'فردا'
      if (diff > 0 && diff < 7) return `${toPersianDigits(diff)} روز پیش`
      if (diff < 0 && diff > -7) return `${toPersianDigits(-diff)} روز آینده`
      return `${toPersianDigits(j.jd)} ${JALALI_MONTHS[j.jm - 1]}`
    }
    default:
      return `${toPersianDigits(j.jd)} ${JALALI_MONTHS[j.jm - 1]} ${toPersianDigits(j.jy)}`
  }
}

/** Format time as HH:mm with Persian digits. */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return toPersianDigits(`${pad(d.getHours())}:${pad(d.getMinutes())}`)
}

/** Full datetime: «۱۲ آبان ۱۴۰۳، ۱۴:۳۰» */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${formatJalali(d, 'medium')}، ${formatTime(d)}`
}

/** Age in years from Jalali birth date. */
export function ageFromBirth(birthDate: string): number {
  const b = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return Math.max(0, age)
}

/** Next N date keys starting today (positive = future, negative = past, inclusive). */
export function nextDateKeys(n: number, from = new Date()): string[] {
  const keys: string[] = []
  const step = n >= 0 ? 1 : -1
  const count = Math.abs(n)
  for (let i = 0; i < count; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i * step)
    keys.push(dateKey(d))
  }
  return keys
}
