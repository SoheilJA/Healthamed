// Doctor's view of a patient file: history + prescriptions.
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CalendarRange, FileHeart, Pill } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader, ErrorState } from '@/components/shared/states'
import { PrescriptionCard } from '@/components/shared/prescription-card'
import { getPatientFile } from '@/services/doctorService'
import { getMyDoctor } from '@/services/doctorService'
import { formatJalali } from '@/lib/jalali'
import { toPersianDigits, maskNationalId } from '@/lib/persian'
import { GENDER, SEVERITY, VISIT_STATUS } from '@/lib/labels'
import { useDocTitle } from '@/hooks'

export default function DoctorPatientFile() {
  const { id = '' } = useParams()
  useDocTitle('پرونده بیمار')
  const { data, error } = useQuery({ queryKey: ['doctor-patient-file', id], queryFn: () => getPatientFile(id) })
  const { data: me } = useQuery({ queryKey: ['my-doctor'], queryFn: getMyDoctor })

  if (error) return <ErrorState message="پرونده یافت نشد یا دسترسی ندارید." />
  if (!data) return null

  const { profile, visits, prescriptions } = data

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/panel/patients">
          <ArrowRight className="h-4 w-4" />
          بازگشت به بیماران
        </Link>
      </Button>

      <PageHeader
        title={profile.fullName}
        description={`${GENDER[profile.gender]} — کد ملی ${maskNationalId(profile.nationalId)} — ${profile.city || '—'}`}
        icon={FileHeart}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <InfoBox label="گروه خونی" value={profile.bloodType ?? '—'} />
        <InfoBox label="سن" value={`${toPersianDigits(new Date().getFullYear() - new Date(profile.birthDate).getFullYear())} سال`} />
        <InfoBox label="ویزیت‌ها" value={toPersianDigits(visits.length)} />
        <InfoBox label="نسخه‌ها" value={toPersianDigits(prescriptions.length)} />
      </div>

      {(profile.allergies.length > 0 || profile.chronicConditions.length > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="border-destructive/40">
            <CardContent className="p-4">
              <p className="mb-2 text-xs font-bold text-destructive">حساسیت‌ها</p>
              {profile.allergies.map((a, i) => (
                <p key={i} className="text-sm">
                  • {a.substance} <Badge variant="destructive" className="ml-1">{SEVERITY[a.severity]}</Badge>
                </p>
              ))}
            </CardContent>
          </Card>
          <Card className="border-warning/40">
            <CardContent className="p-4">
              <p className="mb-2 text-xs font-bold text-warning">بیماری‌های زمینه‌ای</p>
              {profile.chronicConditions.map((c, i) => (
                <p key={i} className="text-sm">
                  • {c.name} {c.controlled && <Badge variant="success" className="ml-1">کنترل‌شده</Badge>}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="visits">
        <TabsList>
          <TabsTrigger value="visits">سابقه ویزیت‌ها</TabsTrigger>
          <TabsTrigger value="rx">نسخه‌های صادرشده</TabsTrigger>
        </TabsList>
        <TabsContent value="visits" className="space-y-2">
          {visits.map((v) => (
            <Card key={v.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">«{v.chiefComplaint}»</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatJalali(v.startedAt, 'full')} — {toPersianDigits(v.messages.length)} پیام
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {v.prescriptionId && <Badge variant="info"><Pill className="h-3 w-3" /> نسخه صادر شده</Badge>}
                  <Badge variant={v.status === 'completed' ? 'secondary' : 'success'}>{VISIT_STATUS[v.status]}</Badge>
                </div>
              </div>
            </Card>
          ))}
          {visits.length === 0 && (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              <CalendarRange className="mx-auto mb-2 h-6 w-6" />
              سابقه‌ای موجود نیست
            </p>
          )}
        </TabsContent>
        <TabsContent value="rx" className="space-y-4">
          {prescriptions.map((rx) => (
            <PrescriptionCard key={rx.id} prescription={rx} doctorName={me?.fullName ?? '—'} compact />
          ))}
          {prescriptions.length === 0 && (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              <Pill className="mx-auto mb-2 h-6 w-6" />
              نسخه‌ای صادر نشده است
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="mt-1 font-bold tabular-nums-fa" dir="auto">{value}</p>
      </CardContent>
    </Card>
  )
}
