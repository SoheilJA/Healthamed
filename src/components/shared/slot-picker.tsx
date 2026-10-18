// Slot picker: horizontal Jalali day chips + time grid for one day.
import { CalendarOff, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatJalali, fromKey } from '@/lib/jalali'
import { toPersianDigits } from '@/lib/persian'
import type { Slot } from '@/types'

export function SlotPicker({
  slotsByDay,
  selectedDay,
  onSelectDay,
  selectedSlot,
  onSelectSlot
}: {
  slotsByDay: Record<string, Slot[]>
  selectedDay: string
  onSelectDay: (key: string) => void
  selectedSlot: { dateKey: string; time: string } | null
  onSelectSlot: (slot: { dateKey: string; time: string } | null) => void
}) {
  const days = Object.keys(slotsByDay)
  const daySlots = slotsByDay[selectedDay] ?? []
  const freeCount = (slots: Slot[]) => slots.filter((s) => !s.taken).length

  return (
    <div className="space-y-4">
      {/* day chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scroll-thin" dir="rtl">
        {days.map((key) => {
          const slots = slotsByDay[key]
          const free = freeCount(slots)
          const date = fromKey(key)
          const parts = formatJalali(date, 'medium').split(' ')
          const isActive = key === selectedDay
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                onSelectDay(key)
                onSelectSlot(null)
              }}
              className={cn(
                'flex min-w-[4.5rem] shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3 py-2 text-xs transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground shadow'
                  : free === 0
                    ? 'opacity-50'
                    : 'hover:border-primary/50 hover:bg-accent'
              )}
            >
              <span className="font-semibold">{parts[0]}</span>
              <span className={cn('tabular-nums-fa', isActive ? 'opacity-80' : 'text-muted-foreground')}>
                {parts.slice(1).join(' ')}
              </span>
              <span className={cn('mt-0.5 rounded-full px-1.5 text-[10px]', isActive ? 'bg-white/20' : free === 0 ? 'bg-muted text-muted-foreground' : 'bg-success/15 text-success')}>
                {free === 0 ? 'تکمیل' : `${toPersianDigits(free)} نوبت`}
              </span>
            </button>
          )
        })}
      </div>

      {/* time grid */}
      {daySlots.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-center">
          <CalendarOff className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">این روز تعطیل است؛ روز دیگری انتخاب کنید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {daySlots.map((slot) => {
            const isSelected = selectedSlot?.dateKey === slot.dateKey && selectedSlot?.time === slot.time
            return (
              <Button
                key={slot.time}
                type="button"
                size="sm"
                variant={isSelected ? 'default' : 'outline'}
                disabled={slot.taken}
                className={cn('tabular-nums-fa', slot.taken && 'line-through opacity-40')}
                onClick={() => onSelectSlot(isSelected ? null : { dateKey: slot.dateKey, time: slot.time })}
              >
                <Clock className="h-3.5 w-3.5" />
                {toPersianDigits(slot.time)}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
