// Jalali date picker inside a popover (birth dates, filters...).
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  buildJalaliMonthGrid,
  dateKey,
  formatJalali,
  fromKey,
  PERSIAN_WEEKDAYS_SHORT,
  toJalali
} from '@/lib/jalali'
import { toPersianDigits } from '@/lib/persian'
import { useState } from 'react'

export function JalaliDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  disablePast = false,
  className
}: {
  value?: string // jalali dateKey 'yyyy-mm-dd'
  onChange: (key: string) => void
  placeholder?: string
  disablePast?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const today = new Date()
  const initial = value ? toJalali(fromKey(value)) : toJalali(today)
  const [view, setView] = useState({ jy: initial.jy, jm: initial.jm })
  const grid = buildJalaliMonthGrid(view.jy, view.jm, today)

  const move = (delta: number) => {
    setView((v) => {
      let jm = v.jm + delta
      let jy = v.jy
      if (jm < 1) {
        jm = 12
        jy--
      }
      if (jm > 12) {
        jm = 1
        jy++
      }
      return { jy, jm }
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('h-10 w-full justify-between font-normal', className)}>
          {value ? formatJalali(fromKey(value), 'medium') : <span className="text-muted-foreground">{placeholder}</span>}
          <Calendar className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="mb-2 flex items-center justify-between">
          <Button variant="ghost" size="iconSm" onClick={() => move(-1)} aria-label="ماه قبل">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <p className="text-sm font-semibold">{grid.monthName}</p>
          <Button variant="ghost" size="iconSm" onClick={() => move(1)} aria-label="ماه بعد">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1" dir="rtl">
          {PERSIAN_WEEKDAYS_SHORT.map((d, i) => (
            <span key={i} className={cn('flex h-8 w-9 items-center justify-center text-[11px] text-muted-foreground', i === 6 && 'text-destructive/70')}>
              {d}
            </span>
          ))}
          {grid.weeks.flat().map((cell) => {
            const isSelected = value === cell.key
            const disabled = disablePast && (cell.isPast || cell.key < dateKey(today))
            return (
              <button
                key={cell.key}
                type="button"
                disabled={disabled || !cell.inMonth}
                onClick={() => {
                  onChange(cell.key)
                  setOpen(false)
                }}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-sm tabular-nums-fa transition-colors',
                  !cell.inMonth && 'invisible',
                  disabled && 'cursor-not-allowed opacity-30',
                  isSelected
                    ? 'bg-primary font-bold text-primary-foreground'
                    : cell.isToday
                      ? 'border border-primary/50 font-bold text-primary'
                      : 'hover:bg-accent',
                  cell.weekday === 6 && !isSelected && 'text-destructive/80'
                )}
              >
                {toPersianDigits(cell.day)}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
