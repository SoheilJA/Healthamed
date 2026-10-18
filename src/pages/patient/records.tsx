// Patient medical record: summary + prescriptions + edit entry.
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  AlertTriangle,
  Cigarette,
  ClipboardList,
  Droplets,
  FileHeart,
  HeartPulse,
  Pill,
  Syringe,
  UserRound,
  Users
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader, EmptyState } from '@/components/shared/states'
import { PrescriptionCard } from '@/components/shared/prescription-card'
import { getMyPatient, getMyPrescriptions } from '@/services/patientService'
import { formatJalali } from '@/lib/jalali'
import { toPersianDigits, maskNationalId } from '@/lib/persian'
import { GENDER, SEVERITY, LIFESTYLE, BLOOD_TYPES } from '@/lib/labels'
import { useNavigate } from 'react-router-dom'
import { useDocTitle } from '@/hooks'

export default function RecordsPage() {
  useDocTitle('پرونده پزشکی')
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const tab = params.get('tab') ?? 'summary'

  const { data: patient } = useQuery({ queryKey: ['my-patient'], queryFn: getMyPatient })
  const { data: prescriptions } = useQuery({ queryKey: ['my-rx'], queryFn: getMyPrescriptions })

  if (!patient) return null

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="پرونده پزشکی من"
        description="اطلاعات پایه سلامت شما که برای پزشکان قابل مشاهده است."
        icon={FileHeart}
        actions={
          <Button asChild>
            <Link to="/app/records/wizard">ویرایش / تکمیل پرونده</Link>
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => navigate(`/app/records?tab=${v}`)}>
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-3">
          <TabsTrigger value="summary">خلاصه پرونده</TabsTrigger>
          <TabsTrigger value="prescriptions">نسخه‌ها</TabsTrigger>
          <TabsTrigger value="lifestyle">سبک زندگی</TabsTrigger>
        </TabsList>

        {/* summary */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UserRound className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold">{patient.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {GENDER[patient.gender]} — کد ملی {maskNationalId(patient.nationalId)} — شهر {patient.city}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">تکمیل پرونده</p>
                  <p className="text-lg font-black text-primary tabular-nums-fa">{toPersianDigits(patient.completion)}٪</p>
                </div>
              </div>
              <Progress value={patient.completion} />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'تاریخ تولد', value: patient.birthDate ? formatJalali(patient.birthDate, 'short') : '—' },
                  { label: 'گروه خونی', value: patient.bloodType ?? '—', dir: 'ltr' },
                  { label: 'قد', value: patient.heightCm ? `${toPersianDigits(patient.heightCm)} سانتی‌متر` : '—' },
                  { label: 'وزن', value: patient.weightKg ? `${toPersianDigits(patient.weightKg)} کیلوگرم` : '—' }
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border p-3 text-center">
                    <p className="text-[11px] text-muted-foreground">{item.label}</p>
                    <p className="mt-1 font-bold tabular-nums-fa" dir={item.dir ?? 'rtl'}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* allergies */}
            <Card className={patient.allergies.length > 0 ? 'border-destructive/40' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  حساسیت‌ها
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.allergies.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {patient.allergies.map((a, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-destructive/5 p-2">
                        <span>{a.substance}</span>
                        <Badge variant={a.severity === 'severe' ? 'destructive' : 'warning'}>
                          {SEVERITY[a.severity]}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">حساسیتی ثبت نشده است.</p>
                )}
              </CardContent>
            </Card>

            {/* chronic */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <HeartPulse className="h-4 w-4 text-warning" />
                  بیماری‌های زمینه‌ای
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.chronicConditions.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {patient.chronicConditions.map((c, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-warning/5 p-2">
                        <span>{c.name}</span>
                        <Badge variant={c.controlled ? 'success' : 'warning'}>
                          {c.controlled ? 'کنترل‌شده' : 'نیازمند پیگیری'}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">بیماری زمینه‌ای ثبت نشده است.</p>
                )}
              </CardContent>
            </Card>

            {/* medications */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Pill className="h-4 w-4 text-info" />
                  داروهای مصرفی
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medications.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {patient.medications.map((m, i) => (
                      <li key={i} className="rounded-lg bg-info/5 p-2">
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.dosage} — {m.frequency}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">داروی ثابتی مصرف نمی‌کنید.</p>
                )}
              </CardContent>
            </Card>

            {/* history */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  سوابق جراحی و خانوادگی
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Syringe className="h-3.5 w-3.5" />
                    جراحی‌ها
                  </p>
                  {patient.surgeries.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {patient.surgeries.map((s, i) => (
                        <Badge key={i} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">سابقه جراحی ثبت نشده.</p>
                  )}
                </div>
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    سابقه خانوادگی
                  </p>
                  {patient.familyHistory.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {patient.familyHistory.map((s, i) => (
                        <Badge key={i} variant="muted">{s}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">سابقه‌ای ثبت نشده.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* prescriptions */}
        <TabsContent value="prescriptions" className="space-y-4">
          {(prescriptions ?? []).length > 0 ? (
            prescriptions!.map((rx) => <PrescriptionCard key={rx.id} prescription={rx} doctorName="—" />)
          ) : (
            <EmptyState
              icon={Pill}
              title="نسخه‌ای ثبت نشده است"
              description="پس از مشاوره، نسخه‌های شما به‌طور خودکار اینجا ذخیره می‌شوند."
              action={
                <Button asChild variant="outline">
                  <Link to="/app/doctors">مشاوره جدید</Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        {/* lifestyle */}
        <TabsContent value="lifestyle">
          <Card>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              {patient.lifestyle ? (
                <>
                  <LifestyleRow icon={Cigarette} label="سیگار" value={LIFESTYLE.smoking[patient.lifestyle.smoking]} />
                  <LifestyleRow icon={Activity} label="تحرک و ورزش" value={LIFESTYLE.exercise[patient.lifestyle.exercise]} />
                  <LifestyleRow icon={Droplets} label="مصرف الکل" value={LIFESTYLE.alcohol[patient.lifestyle.alcohol]} />
                  <LifestyleRow
                    icon={HeartPulse}
                    label="میانگین خواب شبانه"
                    value={patient.lifestyle.sleepHours ? `${toPersianDigits(patient.lifestyle.sleepHours)} ساعت` : '—'}
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  اطلاعات سبک زندگی ثبت نشده است.{' '}
                  <Link to="/app/records/wizard" className="text-primary hover:underline">
                    تکمیل پرونده
                  </Link>
                </p>
              )}
              {patient.insurance && (
                <div className="rounded-xl border p-4 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">بیمه</p>
                  <p className="mt-1 font-semibold">
                    {patient.insurance.provider} — شماره بیمه:{' '}
                    <span className="tabular-nums-fa" dir="ltr">
                      {toPersianDigits(patient.insurance.number)}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LifestyleRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  )
}

export { BLOOD_TYPES }
