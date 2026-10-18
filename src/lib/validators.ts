// Zod schemas shared between wizard forms and services.
import { z } from 'zod'
import { isValidIranMobile, isValidNationalId, toEnglishDigits } from './persian'

const mobileField = z
  .string()
  .min(1, 'شماره موبایل الزامی است')
  .transform(toEnglishDigits)
  .refine(isValidIranMobile, 'شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)')

const nationalIdField = z
  .string()
  .min(1, 'کد ملی الزامی است')
  .transform(toEnglishDigits)
  .refine(isValidNationalId, 'کد ملی معتبر نیست')

const nameField = z
  .string()
  .min(3, 'نام و نام خانوادگی باید حداقل ۳ حرف باشد')
  .max(60, 'نام طولانی است')

export const otpSchema = z.object({
  mobile: mobileField,
  code: z
    .string()
    .transform(toEnglishDigits)
    .refine((v) => /^\d{5}$/.test(v), 'کد تأیید ۵ رقمی است')
})

export const loginSchema = otpSchema

export const registerPatientSchema = z
  .object({
    fullName: nameField,
    mobile: mobileField,
    nationalId: nationalIdField,
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    confirm: z.string()
  })
  .refine((d) => d.password === d.confirm, {
    message: 'تکرار رمز عبور مطابقت ندارد',
    path: ['confirm']
  })

export const registerDoctorSchema = z.object({
  fullName: nameField,
  mobile: mobileField,
  email: z.string().email('ایمیل معتبر نیست').optional().or(z.literal('')),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  specialty: z.string().min(1, 'انتخاب تخصص الزامی است'),
  medicalCouncilNumber: z
    .string()
    .transform(toEnglishDigits)
    .refine((v) => /^\d{5,6}$/.test(v), 'شماره نظام پزشکی ۵ یا ۶ رقمی است'),
  city: z.string().min(1, 'انتخاب شهر الزامی است'),
  experienceYears: z.coerce.number().int().min(0, 'حداقل ۰').max(60, 'حداکثر ۶۰'),
  bio: z.string().min(20, 'توضیحات حداقل ۲۰ کاراکتر').max(600)
})

export const allergySchema = z.object({
  substance: z.string().min(1, 'نام ماده حساسیت‌زا الزامی است'),
  severity: z.enum(['mild', 'moderate', 'severe']),
  reaction: z.string().max(200).optional()
})

export const chronicSchema = z.object({
  name: z.string().min(1, 'نام بیماری الزامی است'),
  sinceYear: z.coerce.number().int().min(1300).max(1500).optional(),
  controlled: z.boolean(),
  notes: z.string().max(300).optional()
})

export const medicationSchema = z.object({
  drugId: z.string().min(1, 'انتخاب دارو الزامی است'),
  dosage: z.string().min(1, 'دوز دارو الزامی است (مثال: ۵۰۰ میلی‌گرم)'),
  frequency: z.string().min(1, 'تعداد دفعات مصرف الزامی است')
})

export const emergencyContactSchema = z.object({
  name: z.string().min(3, 'نام الزامی است'),
  phone: z.string().transform(toEnglishDigits).refine(isValidIranMobile, 'شماره موبایل معتبر نیست'),
  relation: z.string().min(2, 'نسبت الزامی است')
})

export const pharmacySchema = z.object({
  name: z.string().min(3, 'نام داروخانه الزامی است'),
  city: z.string().min(1, 'شهر الزامی است'),
  address: z.string().min(10, 'آدرس حداقل ۱۰ کاراکتر'),
  phone: z
    .string()
    .transform(toEnglishDigits)
    .refine((v) => /^0\d{9,10}$/.test(v), 'تلفن معتبر نیست (مثال: ۰۲۱۱۲۳۴۵۶۷۸)'),
  openHours: z.string().min(3, 'ساعات کاری الزامی است')
})

export const complaintSchema = z.object({
  complaint: z.string().min(5, 'شرح شکایت حداقل ۵ کاراکتر است').max(500),
  urgency: z.enum(['routine', 'urgent'])
})

export const prescriptionItemSchema = z.object({
  drugId: z.string().min(1, 'انتخاب دارو الزامی است'),
  dosage: z.string().min(1, 'دوز الزامی است'),
  frequency: z.string().min(1, 'تعداد دفعات الزامی است'),
  durationDays: z.coerce.number().int().min(1, 'حداقل ۱ روز').max(90, 'حداکثر ۹۰ روز'),
  instructions: z.string().max(200).optional()
})

export const passwordSchema = z
  .object({
    mobile: mobileField,
    password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر'),
    confirm: z.string()
  })
  .refine((d) => d.password === d.confirm, {
    message: 'تکرار رمز عبور مطابقت ندارد',
    path: ['confirm']
  })

export type OtpInput = z.infer<typeof otpSchema>
export type RegisterPatientInput = z.infer<typeof registerPatientSchema>
export type RegisterDoctorInput = z.infer<typeof registerDoctorSchema>
export type PharmacyInput = z.infer<typeof pharmacySchema>
