import { Ban, Clock, Lock } from 'lucide-react'
import type { Slot } from '@/types'
import { toPersianDigits } from '@/lib/persian'
import { cn } from '@/lib/utils'

interface SlotPickerProps {
  slots: Slot[]
  value?: string
  onSelect: (slot: Slot) => void
}

const STATUS_LABEL: Record<Slot['status'], string> = {
  available: 'خالی',
  reserved: 'رزرو شده',
  booked: 'رزرو شده',
  blocked: 'مسدود',
  past: 'گذشته'
}

export function SlotPicker({ slots, value, onSelect }: SlotPickerProps) {
  if (slots.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        در این روز نوبتی وجود ندارد.
      </p>
    )
  }
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5" role="listbox" aria-label="ساعت‌های نوبت">
      {slots.map((slot) => {
        const disabled = slot.status !== 'available'
        return (
          <button
            key={slot.time}
            type="button"
            role="option"
            aria-selected={value === slot.time}
            aria-disabled={disabled}
            onClick={() => !disabled && onSelect(slot)}
            title={STATUS_LABEL[slot.status]}
            className={cn(
              'flex min-h-11 flex-col items-center justify-center rounded-lg border px-2 py-1.5 text-sm transition-colors',
              value === slot.time && 'border-primary bg-primary text-primary-foreground',
              disabled && 'cursor-not-allowed opacity-45',
              slot.status === 'available' && value !== slot.time && 'border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10',
              slot.status === 'reserved' && 'border-dashed'
            )}
          >
            <span className="font-semibold">{toPersianDigits(slot.time)}</span>
            <span className="flex items-center gap-0.5 text-[10px] opacity-80">
              {slot.status === 'reserved' && <Lock className="size-2.5" />}
              {slot.status === 'booked' && <Ban className="size-2.5" />}
              {slot.status === 'past' && <Clock className="size-2.5" />}
              {slot.mine ? 'نوبت شما' : STATUS_LABEL[slot.status]}
            </span>
          </button>
        )
      })}
    </div>
  )
}