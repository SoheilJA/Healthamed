// Doctor weekly schedule: Jalali calendar (14 days) + weekly hours editor.
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarRange, CalendarX2, Clock3, Power } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/states'
import { getScheduleRange, getWeeklySchedule, toggleDayOff, updateDaySchedule } from '@/services/doctorService'
import { PERSIAN_WEEKDAYS, fromKey, formatJalali } from '@/lib/jalali'
import { toPersianDigits } from '@/lib/persian'
import { cn } from '@/lib/utils'
import { useDocTitle } from '@/hooks'

export default function DoctorSchedule() {
  useDocTitle('برنامه هفتگی')
  const queryClient = useQueryClient()
  const { data: range } = useQuery({ queryKey: ['doctor-schedule'], queryFn: getScheduleRange })
  const { data: weekly } = useQuery({ queryKey: ['doctor-weekly'], queryFn: getWeeklySchedule })
  const [editDay, setEditDay] = useState<number | null>(null)

  const offMutation = useMutation({
    mutationFn: (key: string) => toggleDayOff(key),
    onSuccess: () => {
      toast.success('برنامه به‌روزرسانی شد')
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule'] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const dayMutation = useMutation({
    mutationFn: (input: { weekday: number; patch: Record<string, unknown> }) =>
      updateDaySchedule(input.weekday, input.patch),
    onSuccess: () => {
      toast.success('برنامه هفتگی ذخیره شد')
      queryClient.invalidateQueries({ queryKey: ['doctor-weekly'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule'] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  if (!weekly) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="برنامه هفتگی و نوبت‌ها"
        description="روزهای کاری و ساعات پذیرش خود را مدیریت کنید."
        icon={CalendarRange}
      />

      {/* weekly hours editor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock3 className="h-4 w-4 text-primary" />
            ساعات کاری هفتگی
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 7 }).map((_, w) => {
            const day = weekly[w] ?? { enabled: false, start: '09:00', end: '13:00', slotMinutes: 30 }
            return (
              <div key={w} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={day.enabled}
                      onCheckedChange={(v) => dayMutation.mutate({ weekday: w, patch: { enabled: v } })}
                    />
                    <span className={cn('w-24 font-medium', !day.enabled && 'text-muted-foreground line-through')}>
                      {PERSIAN_WEEKDAYS[w]}
                    </span>
                  </div>
                  {day.enabled && (
                    <>
                      <div className="flex items-center gap-2 text-sm tabular-nums-fa">
                        <Input
                          type="time"
                          dir="ltr"
                          className="h-9 w-28 text-center"
                          defaultValue={day.start}
                          disabled={editDay !== w}
                          onChange={(e) => dayMutation.mutate({ weekday: w, patch: { start: e.target.value } })}
                        />
                        <span className="text-muted-foreground">تا</span>
                        <Input
                          type="time"
                          dir="ltr"
                          className="h-9 w-28 text-center"
                          defaultValue={day.end}
                          disabled={editDay !== w}
                          onChange={(e) => dayMutation.mutate({ weekday: w, patch: { end: e.target.value } })}
                        />
                      </div>
                      <Badge variant="muted">هر نوبت {toPersianDigits(day.slotMinutes)} دقیقه</Badge>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setEditDay(editDay === w ? null : w)}>
                    {editDay === w ? 'بستن' : 'ویرایش'}
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* 14-day calendar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarX2 className="h-4 w-4 text-primary" />
            تقویم ۱۴ روز آینده
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" dir="rtl">
            {(range ?? []).map((day) => {
              const free = day.slots.filter((s) => !s.taken).length
              const total = day.slots.length
              return (
                <div
                  key={day.dateKey}
                  className={cn(
                    'space-y-2 rounded-xl border p-3',
                    day.isOff ? 'bg-muted/40' : 'bg-card'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold">{formatJalali(fromKey(day.dateKey), 'medium')}</p>
                      <p className="text-[11px] text-muted-foreground">{PERSIAN_WEEKDAYS[day.weekday]}</p>
                    </div>
                    {day.isOff ? (
                      <Badge variant="muted">تعطیل</Badge>
                    ) : (
                      <Badge variant={free === 0 ? 'destructive' : free < 4 ? 'warning' : 'success'}>
                        {free === 0 ? 'تکمیل' : `${toPersianDigits(free)} آزاد`}
                      </Badge>
                    )}
                  </div>
                  {!day.isOff && total > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {day.slots.slice(0, 8).map((s) => (
                        <span
                          key={s.time}
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[10px] tabular-nums-fa',
                            s.taken ? 'bg-muted text-muted-foreground line-through' : 'bg-success/15 text-success'
                          )}
                        >
                          {toPersianDigits(s.time)}
                        </span>
                      ))}
                      {total > 8 && <span className="text-[10px] text-muted-foreground">…</span>}
                    </div>
                  )}
                  <Button
                    variant={day.isOff ? 'secondary' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={() => offMutation.mutate(day.dateKey)}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {day.isOff ? 'فعال‌سازی روز' : 'تعطیل کردن روز'}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Label className="text-xs text-muted-foreground">
        نکته: با تعطیل کردن یک روز، نوبت‌های رزروشده آن روز به بیماران اطلاع‌رسانی می‌شود.
      </Label>
    </div>
  )
}
