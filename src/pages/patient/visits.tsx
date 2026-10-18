// Patient visits list.
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarRange, ChevronLeft, MessageCircle, Pill } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState } from '@/components/shared/states'
import { Skeleton } from '@/components/ui/skeleton'
import { getMyVisits } from '@/services/patientService'
import { specialtyName } from '@/data/catalog'
import { formatJalali } from '@/lib/jalali'
import { VISIT_STATUS, URGENCY } from '@/lib/labels'
import { useDocTitle } from '@/hooks'

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'destructive' | 'muted' | 'warning'> = {
  active: 'success',
  waiting: 'warning',
  completed: 'secondary',
  cancelled: 'destructive'
}

export default function VisitsPage() {
  useDocTitle('ویزیت‌ها')
  const { data: visits, isLoading } = useQuery({ queryKey: ['my-visits'], queryFn: getMyVisits })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="ویزیت‌های من"
        description="تاریخچه گفتگوها و نسخه‌های صادرشده."
        icon={CalendarRange}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : visits && visits.length > 0 ? (
        <div className="space-y-3">
          {visits.map((v) => (
            <Link key={v.id} to={`/app/visits/${v.id}`} className="block">
              <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {v.prescriptionId ? <Pill className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{v.chiefComplaint}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {v.doctorName} — {specialtyName(v.doctorSpecialty)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatJalali(v.startedAt, 'full')} — ساعت {formatJalali(v.startedAt, 'relative') === 'امروز' ? '' : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex gap-1.5">
                      {v.urgency === 'urgent' && <Badge variant="destructive">{URGENCY.urgent}</Badge>}
                      <Badge variant={STATUS_VARIANT[v.status]}>{VISIT_STATUS[v.status]}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-primary">
                      جزئیات
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarRange}
          title="هنوز وزیتی ثبت نشده است"
          description="برای شروع اولین مشاوره، پزشک مناسب خود را انتخاب کنید."
          action={
            <Button asChild>
              <Link to="/app/doctors">مشاهده پزشکان</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
