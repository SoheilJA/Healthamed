// Patient home dashboard.
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  ArrowLeft,
  CalendarRange,
  FileHeart,
  HeartPulse,
  MessageCircle,
  Pill,
  ShieldCheck,
  ShoppingBag,
  Stethoscope
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader, StatCard, EmptyState } from '@/components/shared/states'
import { HEALTH_TIPS, specialtyName } from '@/data/catalog'
import { getMyPatient, getMyVisits, getMyPrescriptions, getMyOrders } from '@/services/patientService'
import { getEmergencyCardSync } from '@/services/patientService'
import { formatJalali } from '@/lib/jalali'
import { toPersianDigits } from '@/lib/persian'
import { VISIT_STATUS, ORDER_STATUS, GENDER } from '@/lib/labels'
import { useDocTitle } from '@/hooks'

export default function DashboardPage() {
  useDocTitle('خانه')
  const { data: patient } = useQuery({ queryKey: ['my-patient'], queryFn: getMyPatient })
  const { data: visits, isLoading: visitsLoading } = useQuery({
    queryKey: ['my-visits'],
    queryFn: getMyVisits
  })
  const { data: prescriptions } = useQuery({ queryKey: ['my-rx'], queryFn: getMyPrescriptions })
  const { data: orders } = useQuery({ queryKey: ['my-orders'], queryFn: getMyOrders })

  const activeVisit = visits?.find((v) => v.status === 'active' || v.status === 'waiting')
  const activeRx = prescriptions?.filter((r) => r.status === 'active') ?? []
  const activeOrders = orders?.filter((o) => !['delivered', 'cancelled'].includes(o.status)) ?? []
  const card = patient ? getEmergencyCardSync() : null

  const firstName = patient?.fullName.split(' ')[0] ?? ''

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={`${firstName} عزیز، خوش آمدید 👋`}
        description="وضعیت سلامت خود را یک‌جا مدیریت کنید."
        icon={HeartPulse}
      />

      {/* completion / emergency card readiness */}
      {patient && patient.completion < 100 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-56 flex-1">
              <p className="text-sm font-semibold">پرونده پزشکی شما ناقص است</p>
              <Progress value={patient.completion} className="mt-2" />
              <p className="mt-1 text-xs text-muted-foreground tabular-nums-fa">
                {toPersianDigits(patient.completion)}٪ تکمیل شده
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/app/records/wizard">
                تکمیل پرونده
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="ویزیت‌های من" value={toPersianDigits(visits?.length ?? 0)} icon={CalendarRange} />
        <StatCard title="نسخه‌های فعال" value={toPersianDigits(activeRx.length)} icon={Pill} />
        <StatCard title="سفارش‌های جاری" value={toPersianDigits(activeOrders.length)} icon={ShoppingBag} />
        <StatCard
          title="کارت اضطراری"
          value={card && patient?.completion === 100 ? 'آماده' : 'ناقص'}
          icon={ShieldCheck}
        />
      </div>

      {/* active visit */}
      {visitsLoading ? (
        <Skeleton className="h-32" />
      ) : activeVisit ? (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Stethoscope className="h-6 w-6 text-primary" />
                <span className="absolute -left-0.5 -top-0.5 h-3 w-3 animate-pulse-soft rounded-full bg-success ring-2 ring-background" />
              </div>
              <div>
                <p className="font-bold">ویزیت در حال انجام</p>
                <p className="text-sm text-muted-foreground">
                  {activeVisit.doctorName} — {specialtyName(activeVisit.doctorSpecialty)}
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to={`/app/visits/${activeVisit.id}`}>
                <MessageCircle className="h-4 w-4" />
                ادامه گفتگو
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* recent visits */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="h-4 w-4 text-primary" />
              آخرین ویزیت‌ها
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/visits">همه</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(visits ?? []).slice(0, 3).map((v) => (
              <Link
                key={v.id}
                to={`/app/visits/${v.id}`}
                className="flex items-center justify-between gap-2 rounded-xl border p-3 transition-colors hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{v.chiefComplaint}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {v.doctorName} — {formatJalali(v.createdAt, 'medium')}
                  </p>
                </div>
                <Badge variant={v.status === 'completed' ? 'secondary' : v.status === 'active' ? 'success' : 'muted'}>
                  {VISIT_STATUS[v.status]}
                </Badge>
              </Link>
            ))}
            {visits && visits.length === 0 && (
              <EmptyState
                icon={Stethoscope}
                title="هنوز وزیتی نداشته‌اید"
                description="اولین مشاوره خود را از پزشکان متخصص شروع کنید."
                action={
                  <Button asChild size="sm">
                    <Link to="/app/doctors">انتخاب پزشک</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* active prescriptions */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-4 w-4 text-primary" />
              نسخه‌های فعال
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/records?tab=prescriptions">همه</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeRx.slice(0, 3).map((rx) => (
              <div key={rx.id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm font-bold text-primary" dir="ltr">
                    {rx.trackingCode}
                  </p>
                  <Badge variant="success">{toPersianDigits(rx.items.length)} قلم دارو</Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>صدور: {formatJalali(rx.issuedAt, 'medium')}</span>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/app/pharmacies">سفارش دارو</Link>
                  </Button>
                </div>
              </div>
            ))}
            {prescriptions && activeRx.length === 0 && (
              <EmptyState
                icon={Pill}
                title="نسخه فعالی ندارید"
                description="پس از مشاوره، پزشک در صورت نیاز نسخه صادر می‌کند."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">دسترسی سریع</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Button asChild variant="secondary" className="h-auto flex-col gap-2 py-4">
            <Link to="/app/doctors">
              <Stethoscope className="h-6 w-6" />
              مشاوره جدید
            </Link>
          </Button>
          <Button asChild variant="secondary" className="h-auto flex-col gap-2 py-4">
            <Link to="/app/emergency-card">
              <FileHeart className="h-6 w-6" />
              کارت اضطراری
            </Link>
          </Button>
          <Button asChild variant="secondary" className="h-auto flex-col gap-2 py-4">
            <Link to="/app/pharmacies">
              <ShoppingBag className="h-6 w-6" />
              داروخانه‌ها
            </Link>
          </Button>
          <Button asChild variant="secondary" className="h-auto flex-col gap-2 py-4">
            <Link to="/app/records">
              <Activity className="h-6 w-6" />
              پرونده پزشکی
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* health tip */}
      <Card className="overflow-hidden border-primary/20">
        <CardContent className="flex items-start gap-3 bg-primary/5 p-5">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-bold">نکته سلامت</p>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">
              {HEALTH_TIPS[new Date().getDate() % HEALTH_TIPS.length].body}
            </p>
          </div>
        </CardContent>
      </Card>

      {patient && (
        <p className="text-center text-xs text-muted-foreground">
          {patient.fullName} — {GENDER[patient.gender]} — {toPersianDigits(card?.age ?? 0)} سال
        </p>
      )}
    </div>
  )
}
