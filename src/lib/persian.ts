// Persian digit + Iran-specific validators (national id checksum, mobile format).

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const EN_DIGITS = '0123456789'

/** Convert all Latin digits in a string to Persian digits. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)])
}

/** Convert all Persian/Arabic digits in a string to Latin digits. */
export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

/** Iran mobile format: 09xxxxxxxxx (normalizes Persian digits). */
export function isValidIranMobile(input: string): boolean {
  return /^09\d{9}$/.test(toEnglishDigits(input).trim())
}

/** Format mobile for display: ۰۹۱۹ *** ۱۲۳۴ */
export function formatMobile(masked = false): (input: string) => string {
  return (input: string) => {
    const d = toEnglishDigits(input)
    if (masked && d.length === 11) {
      return toPersianDigits(`${d.slice(0, 4)}***${d.slice(8)}`)
    }
    return toPersianDigits(d)
  }
}

/**
 * Iranian national ID (کد ملی) validation using the official checksum.
 * 10 digits; not all identical; check digit = weighted sum mod 11 rule.
 */
export function isValidNationalId(input: string): boolean {
  const code = toEnglishDigits(input).trim()
  if (!/^\d{10}$/.test(code)) return false
  if (/^(\d)\1{9}$/.test(code)) return false
  const sum = code
    .slice(0, 9)
    .split('')
    .reduce((acc, digit, i) => acc + Number(digit) * (10 - i), 0)
  const rem = sum % 11
  const check = Number(code[9])
  return rem < 2 ? check === rem : check === 11 - rem
}

/** Generate a valid national id (for seed data). */
export function generateNationalId(rand: () => number): string {
  let base = ''
  for (let i = 0; i < 9; i++) base += Math.floor(rand() * 10)
  while (/^(\d)\1{8}/.test(base) && new Set(base).size === 1) {
    base = base.slice(0, 8) + String((Number(base[8]) + 1) % 10)
  }
  const sum = base.split('').reduce((acc, d, i) => acc + Number(d) * (10 - i), 0)
  const rem = sum % 11
  const check = rem < 2 ? rem : 11 - rem
  return base + String(check)
}

/** Mask national id for display: ۰۰۱۲***۶۷۸۹ */
export function maskNationalId(id: string): string {
  const d = toEnglishDigits(id)
  if (d.length !== 10) return toPersianDigits(d)
  return toPersianDigits(`${d.slice(0, 4)}***${d.slice(7)}`)
}

/** Validate Iranian postal code (10 digits). */
export function isValidPostalCode(input: string): boolean {
  return /^\d{10}$/.test(toEnglishDigits(input).trim())
}
