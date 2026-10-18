// Shared page-level building blocks: PageHeader, EmptyState, ErrorState, StatCard.
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className
}: {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center', className)}>
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 py-12 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-destructive" />
      <p className="font-medium text-destructive">خطایی رخ داد</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message ?? 'لطفاً دوباره تلاش کنید.'}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          تلاش مجدد
        </Button>
      )}
    </div>
  )
}

export function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  trend,
  className
}: {
  title: string
  value: string | number
  icon?: LucideIcon
  hint?: string
  trend?: { value: number; positive?: boolean }
  className?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="flex items-center gap-4 p-5">
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-muted-foreground">{title}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums-fa">{value}</p>
          {(hint || trend) && (
            <p className={cn('mt-0.5 text-xs', trend ? (trend.positive ? 'text-success' : 'text-destructive') : 'text-muted-foreground')}>
              {trend
                ? `${trend.positive ? '▲' : '▼'} ${Math.abs(trend.value)}٪ ${trend.positive ? 'رشد' : 'کاهش'}`
                : hint}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
