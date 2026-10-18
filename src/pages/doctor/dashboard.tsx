// Doctor dashboard: today's KPIs + week chart + queue.
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  CalendarRange,
  ChevronLeft,
  ClipboardList,
  MessageCircle,
  Star,
  TrendingUp,
  Users
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, StatCard } from '@/components/shared/states'
import { getDashboard } from '@/services/doctorService'
import { toPersianDigits } from '@/lib/persian'
import { VISIT_STATUS, GENDER, URGENCY } from '@/lib/labels'
import { useDocTitle } from '@/hooks'

export default function DoctorDashboard() {
  useDocTitle('داشبورد پزشک')
  const { data } = useQuery({ queryKey: ['doctor-dashboard'], queryFn: getDashboard, refetchInterval: 20000 })

  if (!data) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="داشبورد پزشک"
        description="خلاصه فعالیت امروز و صف بیماران."
        icon={ClipboardList}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="ویزیت‌های امروز" value={toPersianDigits(data.todayCount)} icon={CalendarRange} />
        <StatCard title="در انتظار پاسخ" value={toPersianDigits(data.waitingCount)} icon={MessageCircle} />
        <StatCard title="بیماران من" value={toPersianDigits(data.totalPatients)} icon={Users} />
        <StatCard title="امتیاز شما" value={toPersianDigits(data.rating.toFixed(1))} icon={Star} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* week chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              ویزیت‌های ۷ روز گذشته
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weekVisits} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(157 95% 34%)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(157 95% 34%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    fontSize: 12
                  }}
                />
                <Area dataKey="count" stroke="hsl(157 95% 34%)" strokeWidth={2} fill="url(#fillVisits)" name="ویزیت" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* queue */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">صف امروز</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/panel/visits">
                همه
                <ChevronLeft className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.queue.slice(0, 5).map((v) => (
              <Link
                key={v.id}
                to={`/panel/visits/${v.id}`}
                className="block rounded-xl border p-3 transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{v.patientName}</p>
                  <Badge variant={v.status === 'active' ? 'success' : 'warning'}>
                    {VISIT_STATUS[v.status]}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {GENDER[v.patientGender as 'male' | 'female']} — {toPersianDigits(v.patientAge)} سال — «{v.chiefComplaint}»
                </p>
                {v.urgency === 'urgent' && (
                  <Badge variant="destructive" className="mt-1.5">
                    {URGENCY.urgent}
                  </Badge>
                )}
              </Link>
            ))}
            {data.queue.length === 0 && (
              <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                بیماری در صف نیست
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
