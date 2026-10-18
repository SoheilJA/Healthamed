import * as React from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type AlertVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info'

const ALERT_STYLES: Record<AlertVariant, { container: string; icon: React.ReactNode }> = {
  default: {
    container: 'border-primary/30 bg-primary/5 text-foreground',
    icon: <Info className="h-4 w-4 text-primary" />
  },
  success: {
    container: 'border-success/30 bg-success/10 text-foreground',
    icon: <CheckCircle2 className="h-4 w-4 text-success" />
  },
  warning: {
    container: 'border-warning/40 bg-warning/10 text-foreground',
    icon: <AlertTriangle className="h-4 w-4 text-warning" />
  },
  destructive: {
    container: 'border-destructive/40 bg-destructive/10 text-foreground',
    icon: <XCircle className="h-4 w-4 text-destructive" />
  },
  info: {
    container: 'border-info/30 bg-info/10 text-foreground',
    icon: <Info className="h-4 w-4 text-info" />
  }
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title?: string
  children?: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative flex w-full items-start gap-3 rounded-lg border p-4 text-sm [&>svg]:mt-0.5',
        ALERT_STYLES[variant].container,
        className
      )}
      {...props}
    >
      {ALERT_STYLES[variant].icon}
      <div className="flex-1 space-y-1">
        {title && <h5 className="mb-0 font-semibold leading-none">{title}</h5>}
        {children && <div className="text-[0.9rem] leading-6 text-muted-foreground">{children}</div>}
      </div>
    </div>
  )
)
Alert.displayName = 'Alert'

export { Alert }
