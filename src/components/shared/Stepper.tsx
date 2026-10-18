// Horizontal stepper for multi-step wizards.
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persian'

export interface Step {
  id: string
  title: string
}

export function Stepper({
  steps,
  current,
  onStepClick,
  className
}: {
  steps: Step[]
  current: number // 0-based
  onStepClick?: (index: number) => void
  className?: string
}) {
  return (
    <div className={cn('w-full overflow-x-auto scroll-thin', className)} dir="rtl">
      <ol className="flex min-w-max items-center gap-1 px-1 py-2">
        {steps.map((step, i) => {
          const done = i < current
          const active = i === current
          const clickable = !!onStepClick && (done || i <= current)
          return (
            <li key={step.id} className="flex items-center">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(i)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  active && 'bg-primary text-primary-foreground shadow',
                  done && 'text-primary hover:bg-primary/10',
                  !active && !done && 'text-muted-foreground',
                  clickable ? 'cursor-pointer' : 'cursor-default'
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border text-[10px] tabular-nums-fa',
                    active && 'border-primary-foreground/40',
                    done && 'border-primary bg-primary text-primary-foreground',
                    !active && !done && 'border-muted-foreground/40'
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : toPersianDigits(i + 1)}
                </span>
                <span className="whitespace-nowrap">{step.title}</span>
              </button>
              {i < steps.length - 1 && (
                <span className={cn('mx-1 h-px w-6 sm:w-10', done ? 'bg-primary' : 'bg-border')} />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
