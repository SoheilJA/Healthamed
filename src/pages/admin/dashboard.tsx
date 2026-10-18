// Admin dashboard: KPI cards + recharts (visits trend, specialty bar, orders donut).
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { Activity, Building2, Pill, ShoppingBag, Stethoscope, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader, StatCard } from '@/components/shared/states'
import { adminApi } from '@/services'
import { specialtyName } from '@/data/catalog'
import { ORDER_STATUS } from '@/lib/labels'
import { toPersianDigits } from '@/lib/persian'
import { formatToman } from '@/lib/utils'
import { useDocTitle } from '@/hooks'

const CHART_COLORS = ['hsl(157 95% 34%)', 'hsl(190 80% 40%)', 'hsl(38 92% 50%)', 'hsl(262 70% 55%)', 'hsl(340 75% 55%)', 'hsl(0 72% 51%)']

export default function AdminDashboard() {
  useDocTitle('داشبورد مدیریت')
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminApi.getStats() })

  if (!stats) return null

  const specialtyData = stats.specialtyDist
    .map((s) => ({ ...s, label: specialtyName(s.label) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const orderData = stats.orderStatusDist.map((s) => ({
    ...s,
    label: ORDER_STATUS[s.label as keyof typeof ORDER_STATUS] ?? s.label
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="داشبورد مدیریت"
        description="نمای کلی پلتفرم هلثامد"
        icon={TrendingUp}
        actions={
          stats.pendingDoctors > 0 ? (
            <Badge variant="warning" className="gap-1">
              <Stethoscope className="h-3 w-3" />
              {toPersianDigits(stats.pendingDoctors)} درخواست پزشک در انتظار
            </Badge>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="بیماران" value={toPersianDigits(stats.patients)} icon={Users} />
        <StatCard title="پزشکان فعال" value={toPersianDigits(stats.doctors)} icon={Stethoscope} />
        <StatCard title="ویزیت‌ها" value={toPersianDigits(stats.visits)} icon={Activity} />
        <StatCard title="نسخه‌ها" value={toPersianDigits(stats.prescriptions)} icon={Pill} />
        <StatCard title="سفارش‌ها" value={toPersianDigits(stats.orders)} icon={ShoppingBag} />
        <StatCard
          title="درآمد سفارش‌ها"
          value={`${toPersianDigits(formatToman(stats.revenue))} ت`}
          icon={Building2}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* visits trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">روند ویزیت‌ها (۱۴ روز)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.visitsByDay} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    fontSize: 12,
                    direction: 'rtl'
                  }}
                />
                <Line type="monotone" dataKey="count" name="ویزیت" stroke="hsl(157 95% 34%)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* specialty distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">توزیع تخصص پزشکان</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specialtyData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    fontSize: 12,
                    direction: 'rtl'
                  }}
                />
                <Bar dataKey="value" name="پزشک" fill="hsl(157 95% 34%)" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* orders donut */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">وضعیت سفارش‌های دارو</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderData} dataKey="value" nameKey="label" innerRadius={60} outerRadius={90} paddingAngle={3}>
                  {orderData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="middle"
                  layout="vertical"
                  align="right"
                  wrapperStyle={{ fontSize: 12, direction: 'rtl' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    fontSize: 12,
                    direction: 'rtl'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
