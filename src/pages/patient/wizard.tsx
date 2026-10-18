// 8-step medical profile wizard with localStorage draft autosave.
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Droplets,
  HeartPulse,
  Home,
  Pill,
  PhoneCall,
  Save,
  UserRound
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Stepper, type Step } from '@/components/shared/stepper'
import { JalaliDatePicker } from '@/components/shared/jalali-date-picker'
import { getMyPatient, saveMedicalProfile } from '@/services/patientService'
import type { MedicalProfileInput } from '@/services/syncService'
import { useLocalDraft, useDocTitle } from '@/hooks'
import { toEnglishDigits } from '@/lib/persian'
import { toGregorian } from '@/lib/jalali'
import { BLOOD_TYPES, CITIES, INSURANCE_PROVIDERS, LIFESTYLE, SEVERITY, GENDER } from '@/lib/labels'
import { COMMON_ALLERGENS, DRUGS, CHRONIC_CONDITIONS_POOL } from '@/data/catalog'

const STEPS: Step[] = [
  { id: 'base', title: 'اطلاعات پایه' },
  { id: 'body', title: 'قد و وزن' },
  { id: 'contact', title: 'آدرس' },
  { id: 'emergency', title: 'تماس اضطراری' },
  { id: 'allergy', title: 'حساسیت‌ها' },
  { id: 'chronic', title: 'بیماری‌ها' },
  { id: 'meds', title: 'داروها' },
  { id: 'style', title: 'سبک زندگی' }
]

interface Draft {
  fullName: string
  gender: 'male' | 'female'
  birthKey: string
  nationalId: string
  bloodType: string
  heightCm: string
  weightKg: string
  city: string
  address: string
  ecName: string
  ecPhone: string
  ecRelation: string
  allergies: { substance: string; severity: 'mild' | 'moderate' | 'severe'; reaction: string }[]
  allergiesKnownEmpty: boolean
  chronic: { name: string; sinceYear: string; controlled: boolean }[]
  chronicKnownEmpty: boolean
  medications: { drugId: string; dosage: string; frequency: string }[]
  medsKnownEmpty: boolean
  smoking: 'never' | 'former' | 'current'
  exercise: 'none' | 'light' | 'regular' | 'intense'
  sleepHours: string
  insuranceProvider: string
  insuranceNumber: string
}

const EMPTY: Draft = {
  fullName: '',
  gender: 'male',
  birthKey: '',
  nationalId: '',
  bloodType: '',
  heightCm: '',
  weightKg: '',
  city: '',
  address: '',
  ecName: '',
  ecPhone: '',
  ecRelation: '',
  allergies: [],
  allergiesKnownEmpty: false,
  chronic: [],
  chronicKnownEmpty: false,
  medications: [],
  medsKnownEmpty: false,
  smoking: 'never',
  exercise: 'light',
  sleepHours: '7',
  insuranceProvider: 'فاقد بیمه',
  insuranceNumber: ''
}

export default function WizardPage() {
  useDocTitle('تکمیل پرونده پزشکی')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useLocalDraft<Draft>('medical-profile', EMPTY)
  const patient = getMyPatient()

  // prefill once from existing profile
  useMemo(() => {
    if (patient) {
      setDraft((d) => ({
        ...d,
        fullName: d.fullName || patient.fullName,
        nationalId: d.nationalId || patient.nationalId,
        gender: patient.gender,
        city: d.city || patient.city,
        allergies: patient.allergies.map((a) => ({ substance: a.substance, severity: a.severity, reaction: a.reaction ?? '' })),
        chronic: patient.chronicConditions.map((c) => ({ name: c.name, sinceYear: String(c.sinceYear ?? ''), controlled: c.controlled })),
        medications: patient.medications.map((m) => ({ drugId: m.drugId, dosage: m.dosage, frequency: m.frequency })),
        bloodType: d.bloodType || patient.bloodType || '',
        heightCm: d.heightCm || (patient.heightCm ? String(patient.heightCm) : ''),
        weightKg: d.weightKg || (patient.weightKg ? String(patient.weightKg) : '')
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: MedicalProfileInput = {
        fullName: draft.fullName.trim(),
        gender: draft.gender,
        birthDate: draft.birthKey ? toGregorian(...(draft.birthKey.split('-').map(Number) as [number, number, number])).toISOString() : '',
        nationalId: toEnglishDigits(draft.nationalId),
        bloodType: draft.bloodType || undefined,
        heightCm: draft.heightCm ? Number(draft.heightCm) : undefined,
        weightKg: draft.weightKg ? Number(draft.weightKg) : undefined,
        city: draft.city,
        address: draft.address || undefined,
        emergencyContact:
          draft.ecName && draft.ecPhone
            ? { name: draft.ecName, phone: toEnglishDigits(draft.ecPhone), relation: draft.ecRelation || 'خانواده' }
            : undefined,
        allergies: draft.allergies
          .filter((a) => a.substance.trim())
          .map((a) => ({ substance: a.substance.trim(), severity: a.severity, reaction: a.reaction || undefined })),
        chronicConditions: draft.chronic
          .filter((c) => c.name.trim())
          .map((c) => ({ name: c.name.trim(), sinceYear: c.sinceYear ? Number(c.sinceYear) : undefined, controlled: c.controlled })),
        medications: draft.medications
          .filter((m) => m.drugId)
          .map((m) => ({ drugId: m.drugId, name: DRUGS.find((d) => d.id === m.drugId)?.name ?? '', dosage: m.dosage, frequency: m.frequency })),
        surgeries: patient?.surgeries ?? [],
        familyHistory: patient?.familyHistory ?? [],
        lifestyle: {
          smoking: draft.smoking,
          alcohol: 'never',
          exercise: draft.exercise,
          sleepHours: draft.sleepHours ? Number(draft.sleepHours) : undefined
        },
        insurance: draft.insuranceProvider !== 'فاقد بیمه' && draft.insuranceNumber
          ? { provider: draft.insuranceProvider, number: toEnglishDigits(draft.insuranceNumber) }
          : undefined,
        allergiesKnownEmpty: draft.allergiesKnownEmpty && draft.allergies.length === 0,
        chronicKnownEmpty: draft.chronicKnownEmpty && draft.chronic.length === 0,
        medsKnownEmpty: draft.medsKnownEmpty && draft.medications.length === 0
      }
      return saveMedicalProfile(payload)
    },
    onSuccess: () => {
      toast.success('پرونده پزشکی شما ذخیره شد 🌿')
      queryClient.invalidateQueries({ queryKey: ['my-patient'] })
      navigate('/app/records')
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const stepValid = (i: number): boolean => {
    switch (i) {
      case 0:
        return draft.fullName.trim().length >= 3 && !!draft.birthKey && toEnglishDigits(draft.nationalId).length === 10
      case 1:
        return true
      case 2:
        return draft.city.trim().length > 0
      case 3:
        return true
      case 4:
        return draft.allergies.length > 0 || draft.allergiesKnownEmpty
      case 5:
        return draft.chronic.length > 0 || draft.chronicKnownEmpty
      case 6:
        return draft.medications.length > 0 || draft.medsKnownEmpty
      default:
        return true
    }
  }

  const next = () => {
    if (!stepValid(step)) {
      toast.error('لطفاً فیلدهای این مرحله را کامل کنید')
      return
    }
    if (step < STEPS.length - 1) setStep(step + 1)
  }

  const progress = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">تکمیل پرونده پزشکی</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            پیشرفت شما ذخیره می‌شود؛ می‌توانید بعداً ادامه دهید.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <Save className="h-3.5 w-3.5" />
          ذخیره خودکار
        </span>
      </div>

      <Progress value={progress} />
      <Stepper steps={STEPS} current={step} onStepClick={setStep} />

      <Card>
        <CardContent className="min-h-[22rem] space-y-5 p-6">
          {/* STEP 1: base */}
          {step === 0 && (
            <>
              <Field label="نام و نام خانوادگی">
                <Input value={draft.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="نام کامل" />
              </Field>
              <Field label="جنسیت">
                <RadioGroup
                  value={draft.gender}
                  onValueChange={(v) => set('gender', v as 'male' | 'female')}
                  className="grid grid-cols-2 gap-2"
                >
                  {(['male', 'female'] as const).map((g) => (
                    <Label key={g} className="flex cursor-pointer items-center justify-between rounded-xl border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                      <span className="font-medium">{GENDER[g]}</span>
                      <RadioGroupItem value={g} />
                    </Label>
                  ))}
                </RadioGroup>
              </Field>
              <Field label="تاریخ تولد (شمسی)">
                <JalaliDatePicker value={draft.birthKey} onChange={(k) => set('birthKey', k)} placeholder="انتخاب تاریخ تولد" />
              </Field>
              <Field label="کد ملی">
                <Input
                  value={draft.nationalId}
                  onChange={(e) => set('nationalId', e.target.value)}
                  inputMode="numeric"
                  dir="ltr"
                  placeholder="0012345678"
                />
              </Field>
            </>
          )}

          {/* STEP 2: body */}
          {step === 1 && (
            <>
              <Field label="گروه خونی">
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map((b) => (
                    <Label
                      key={b}
                      className="flex cursor-pointer items-center justify-center rounded-xl border py-2.5 text-sm font-bold has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                      dir="ltr"
                    >
                      <RadioGroup value={draft.bloodType} onValueChange={(v) => set('bloodType', v)} className="sr-only">
                        <RadioGroupItem value={b} />
                      </RadioGroup>
                      {b}
                    </Label>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="قد (سانتی‌متر)">
                  <Input inputMode="numeric" dir="ltr" value={draft.heightCm} onChange={(e) => set('heightCm', e.target.value)} placeholder="170" />
                </Field>
                <Field label="وزن (کیلوگرم)">
                  <Input inputMode="numeric" dir="ltr" value={draft.weightKg} onChange={(e) => set('weightKg', e.target.value)} placeholder="65" />
                </Field>
              </div>
            </>
          )}

          {/* STEP 3: address */}
          {step === 2 && (
            <>
              <Field label="شهر">
                <Select value={draft.city} onValueChange={(v) => set('city', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب شهر" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="نشانی (اختیاری)">
                <Input value={draft.address} onChange={(e) => set('address', e.target.value)} placeholder="خیابان، کوچه، پلاک" />
              </Field>
            </>
          )}

          {/* STEP 4: emergency contact */}
          {step === 3 && (
            <>
              <p className="rounded-xl bg-destructive/5 p-3 text-xs leading-6 text-muted-foreground">
                در شرایط اضطراری، این فرد تماس گرفته می‌شود و کارت اضطراری شما نمایش داده می‌شود.
              </p>
              <Field label="نام مخاطب اضطراری">
                <Input value={draft.ecName} onChange={(e) => set('ecName', e.target.value)} placeholder="مثلاً: محمد محمدی" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="شماره تماس">
                  <Input inputMode="numeric" dir="ltr" value={draft.ecPhone} onChange={(e) => set('ecPhone', e.target.value)} placeholder="09121112233" />
                </Field>
                <Field label="نسبت">
                  <Input value={draft.ecRelation} onChange={(e) => set('ecRelation', e.target.value)} placeholder="همسر، پدر، …" />
                </Field>
              </div>
            </>
          )}

          {/* STEP 5: allergies */}
          {step === 4 && (
            <>
              <KnownEmpty
                checked={draft.allergiesKnownEmpty}
                onChange={(v) => set('allergiesKnownEmpty', v)}
                label="هیچ حساسیت شناخته‌شده‌ای ندارم"
              />
              {draft.allergies.map((a, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 sm:grid-cols-[1fr_auto_auto]">
                  <Input
                    value={a.substance}
                    onChange={(e) => {
                      const list = [...draft.allergies]
                      list[i] = { ...a, substance: e.target.value }
                      set('allergies', list)
                    }}
                    placeholder="ماده حساسیت‌زا (مثلاً پنی‌سیلین)"
                  />
                  <Select
                    value={a.severity}
                    onValueChange={(v) => {
                      const list = [...draft.allergies]
                      list[i] = { ...a, severity: v as 'mild' | 'moderate' | 'severe' }
                      set('allergies', list)
                    }}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['mild', 'moderate', 'severe'] as const).map((s) => (
                        <SelectItem key={s} value={s}>{SEVERITY[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => set('allergies', draft.allergies.filter((_, j) => j !== i))}
                    aria-label="حذف"
                  >
                    ✕
                  </Button>
                </div>
              ))}
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGENS.filter((c) => !draft.allergies.some((a) => a.substance === c)).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      set('allergies', [...draft.allergies, { substance: c, severity: 'moderate', reaction: '' }])
                    }
                    className="rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    + {c}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set('allergies', [...draft.allergies, { substance: '', severity: 'moderate', reaction: '' }])}
              >
                <AlertTriangle className="h-4 w-4" />
                افزودن حساسیت
              </Button>
            </>
          )}

          {/* STEP 6: chronic */}
          {step === 5 && (
            <>
              <KnownEmpty
                checked={draft.chronicKnownEmpty}
                onChange={(v) => set('chronicKnownEmpty', v)}
                label="بیماری زمینه‌ای ندارم"
              />
              {draft.chronic.map((c, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-warning/30 bg-warning/5 p-3 sm:grid-cols-[1fr_auto_auto]">
                  <Input
                    value={c.name}
                    onChange={(e) => {
                      const list = [...draft.chronic]
                      list[i] = { ...c, name: e.target.value }
                      set('chronic', list)
                    }}
                    placeholder="نام بیماری"
                  />
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={c.controlled}
                      onCheckedChange={(v) => {
                        const list = [...draft.chronic]
                        list[i] = { ...c, controlled: v === true }
                        set('chronic', list)
                      }}
                    />
                    کنترل‌شده
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => set('chronic', draft.chronic.filter((_, j) => j !== i))}
                    aria-label="حذف"
                  >
                    ✕
                  </Button>
                </div>
              ))}
              <div className="flex flex-wrap gap-1.5">
                {CHRONIC_CONDITIONS_POOL.filter((c) => !draft.chronic.some((x) => x.name === c)).slice(0, 14).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('chronic', [...draft.chronic, { name: c, sinceYear: '', controlled: true }])}
                    className="rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    + {c}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set('chronic', [...draft.chronic, { name: '', sinceYear: '', controlled: false }])}
              >
                <HeartPulse className="h-4 w-4" />
                افزودن بیماری
              </Button>
            </>
          )}

          {/* STEP 7: medications */}
          {step === 6 && (
            <>
              <KnownEmpty
                checked={draft.medsKnownEmpty}
                onChange={(v) => set('medsKnownEmpty', v)}
                label="داروی ثابتی مصرف نمی‌کنم"
              />
              {draft.medications.map((m, i) => {
                const drug = DRUGS.find((d) => d.id === m.drugId)
                return (
                  <div key={i} className="space-y-2 rounded-xl border border-info/30 bg-info/5 p-3">
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <Select
                        value={m.drugId}
                        onValueChange={(v) => {
                          const list = [...draft.medications]
                          list[i] = { ...m, drugId: v, dosage: list[i].dosage || DRUGS.find((d) => d.id === v)?.strength || '' }
                          set('medications', list)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب دارو" />
                        </SelectTrigger>
                        <SelectContent>
                          {DRUGS.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name} ({d.strength})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => set('medications', draft.medications.filter((_, j) => j !== i))}
                        aria-label="حذف"
                      >
                        ✕
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={m.dosage}
                        onChange={(e) => {
                          const list = [...draft.medications]
                          list[i] = { ...m, dosage: e.target.value }
                          set('medications', list)
                        }}
                        placeholder={drug ? `دوز (پیش‌فرض: ${drug.strength})` : 'دوز'}
                      />
                      <Input
                        value={m.frequency}
                        onChange={(e) => {
                          const list = [...draft.medications]
                          list[i] = { ...m, frequency: e.target.value }
                          set('medications', list)
                        }}
                        placeholder="دفعات مصرف (مثلاً روزی دو بار)"
                      />
                    </div>
                  </div>
                )
              })}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set('medications', [...draft.medications, { drugId: '', dosage: '', frequency: '' }])}
              >
                <Pill className="h-4 w-4" />
                افزودن دارو
              </Button>
            </>
          )}

          {/* STEP 8: lifestyle + insurance */}
          {step === 7 && (
            <>
              <Field label="وضعیت سیگار">
                <RadioGroup value={draft.smoking} onValueChange={(v) => set('smoking', v as Draft['smoking'])} className="grid grid-cols-3 gap-2">
                  {(['never', 'former', 'current'] as const).map((s) => (
                    <Label key={s} className="flex cursor-pointer items-center justify-center rounded-xl border p-2.5 text-xs font-medium has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                      <RadioGroupItem value={s} className="sr-only" />
                      {LIFESTYLE.smoking[s]}
                    </Label>
                  ))}
                </RadioGroup>
              </Field>
              <Field label="میزان تحرک و ورزش">
                <RadioGroup value={draft.exercise} onValueChange={(v) => set('exercise', v as Draft['exercise'])} className="grid grid-cols-4 gap-2">
                  {(['none', 'light', 'regular', 'intense'] as const).map((s) => (
                    <Label key={s} className="flex cursor-pointer items-center justify-center rounded-xl border p-2.5 text-xs font-medium has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                      <RadioGroupItem value={s} className="sr-only" />
                      {LIFESTYLE.exercise[s]}
                    </Label>
                  ))}
                </RadioGroup>
              </Field>
              <Field label="میانگین خواب شبانه (ساعت)">
                <Input inputMode="numeric" dir="ltr" value={draft.sleepHours} onChange={(e) => set('sleepHours', e.target.value)} placeholder="7" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="بیمه">
                  <Select value={draft.insuranceProvider} onValueChange={(v) => set('insuranceProvider', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INSURANCE_PROVIDERS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="شماره بیمه">
                  <Input
                    dir="ltr"
                    value={draft.insuranceNumber}
                    onChange={(e) => set('insuranceNumber', e.target.value)}
                    placeholder="—"
                    disabled={draft.insuranceProvider === 'فاقد بیمه'}
                  />
                </Field>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* nav */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ArrowRight className="h-4 w-4" />
          مرحله قبل
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>
            مرحله بعد
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Check className="h-4 w-4" />
            {saveMutation.isPending ? 'در حال ذخیره…' : 'ذخیره پرونده'}
          </Button>
        )}
      </div>

      <StepIcon step={step} />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function KnownEmpty({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed p-3 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      {label}
    </label>
  )
}

function StepIcon({ step }: { step: number }) {
  const icons = [UserRound, Activity, Home, PhoneCall, AlertTriangle, HeartPulse, Pill, Droplets]
  const Icon = icons[step] ?? UserRound
  return <Icon className="hidden" />
}
