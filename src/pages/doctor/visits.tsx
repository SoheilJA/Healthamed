// Doctor visit queue: waiting / active / recent tabs.
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ChevronLeft, ClipboardList, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader, EmptyState } from '@/components/shared/states'
import { getVisitQueue, type QueueItem } from '@/services/doctorService'
import { formatJalali } from '@/lib/jalali'
import { toPersianDigits } from '@/lib/persian'
import { GENDER, URGENCY, VISIT_STATUS } from '@/lib/labels'
import { useDocTitle } from '@/hooks'

export default function DoctorVisits() {
  useDocTitle('صف ویزیت‌ها')
  const { data } = useQuery({ queryKey: ['doctor-queue'], queryFn: getVisitQueue, refetchInterval: 15000 })

  const renderItem = (v: QueueItem) => (
    <Link key={v.id} to={`/panel/visits/${v.id}`} className="block">
      <Card className="mb-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start gap-4 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{v.patientName}</p>
              <span className="text-xs text-muted-foreground">
                {GENDER[v.patientGender as 'male' | 'female']} — {toPersianDigits(v.patientAge)} سال
              </span>
              {v.hasAllergies && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  حساسیت دارویی
                </Badge>
              )}
              {v.urgency === 'urgent' && <Badge variant="warning">{URGENCY.urgent}</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">«{v.chiefComplaint}»</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{formatJalali(v.startedAt, 'full')}</p>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-primary">
            {v.status === 'waiting' ? 'پاسخ‌دهی' : 'ادامه'}
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>
    </Link>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="صف ویزیت‌ها"
        description="بیماران در انتظار پاسخ و گفتگوهای جاری."
        icon={ClipboardList}
      />

      <Tabs defaultValue="waiting">
        <TabsList>
          <TabsTrigger value="waiting">
            در انتظار {data ? `(${toPersianDigits(data.waiting.length)})` : ''}
          </TabsTrigger>
          <TabsTrigger value="active">
            جاری {data ? `(${toPersianDigits(data.active.length)})` : ''}
          </TabsTrigger>
          <TabsTrigger value="recent">تاریخچه</TabsTrigger>
        </TabsList>

        <TabsContent value="waiting">
          {data && data.waiting.length > 0 ? (
            data.waiting.map(renderItem)
          ) : (
            <EmptyState icon={ClipboardList} title="بیماری در انتظار نیست" description="صف شما خالی است." />
          )}
        </TabsContent>
        <TabsContent value="active">
          {data && data.active.length > 0 ? (
            data.active.map(renderItem)
          ) : (
            <EmptyState icon={MessageCircle} title="گفتگوی جاری ندارید" />
          )}
        </TabsContent>
        <TabsContent value="recent">
          {data && data.recent.length > 0 ? (
            <div className="space-y-2">
              {data.recent.map((v) => (
                <Link key={v.id} to={`/panel/visits/${v.id}`} className="block">
                  <Card className="p-4 transition-colors hover:bg-accent">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {v.patientName} — «{v.chiefComplaint}»
                        </p>
                        <p className="text-xs text-muted-foreground">{formatJalali(v.startedAt, 'medium')}</p>
                      </div>
                      <Badge variant={v.status === 'completed' ? 'secondary' : 'destructive'}>
                        {VISIT_STATUS[v.status]}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="تاریخچه‌ای موجود نیست" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
