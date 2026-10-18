// Star rating display + interactive rater.
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persian'

export function RatingStars({
  value,
  count,
  size = 'md',
  className
}: {
  value: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeCls = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              sizeCls,
              i <= Math.round(value) ? 'fill-warning text-warning' : 'fill-muted text-muted-foreground/30'
            )}
          />
        ))}
      </span>
      <span className="text-xs font-medium tabular-nums-fa">{toPersianDigits(value.toFixed(1))}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({toPersianDigits(count)} نظر)</span>
      )}
    </span>
  )
}

export function RatingInput({
  value,
  onChange,
  className
}: {
  value: number
  onChange: (v: number) => void
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-1', className)} dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${i} ستاره`}
        >
          <Star
            className={cn(
              'h-7 w-7 transition-colors',
              i <= value ? 'fill-warning text-warning' : 'fill-muted text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  )
}
