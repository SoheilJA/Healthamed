// Header widgets: theme toggle, sync indicator, notification bell.
import { Link } from 'react-router-dom'
import { Bell, CloudOff, Moon, RefreshCw, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useOnline } from '@/hooks'
import { useTheme } from './theme-provider'
import { formatJalali } from '@/lib/jalali'
import { NOTIFICATION_KIND } from '@/lib/labels'
import { cn } from '@/lib/utils'
import { notificationService } from '@/services/notificationService'
import { useAuthStore } from '@/stores'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export function ThemeToggle() {
  const { resolved, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="تغییر تم"
      onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
    >
      {resolved === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

export function SyncIndicator({ lastSyncedAt, onSync, syncing }: { lastSyncedAt?: string | null; onSync?: () => void; syncing?: boolean }) {
  const online = useOnline()
  if (online) return null
  return (
    <Badge variant="warning" className="gap-1.5">
      <CloudOff className="h-3 w-3" />
      آفلاین
      {lastSyncedAt && <span className="hidden sm:inline">— آخرین همگام‌سازی {formatJalali(lastSyncedAt, 'relative')}</span>}
      {onSync && (
        <button type="button" onClick={onSync} className="ms-1 underline underline-offset-2" aria-label="همگام‌سازی مجدد">
          <RefreshCw className={cn('h-3 w-3', syncing && 'animate-spin')} />
        </button>
      )}
    </Badge>
  )
}

export function NotificationBell() {
  const userId = useAuthStore((s) => s.userId)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => notificationService.listFor(userId!),
    enabled: !!userId,
    refetchInterval: 15000
  })

  const unread = (data ?? []).filter((n) => !n.read).length

  const markAll = () => {
    notificationService.markAllRead(userId!)
    queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
  }

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="اعلان‌ها">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -left-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? '۹+' : String(unread).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>اعلان‌ها</span>
          {unread > 0 && (
            <button type="button" className="text-xs font-normal text-primary hover:underline" onClick={markAll}>
              علامت‌گذاری همه به عنوان خوانده‌شده
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto scroll-thin">
          {(data ?? []).slice(0, 10).map((n) => (
            <DropdownMenuItem key={n.id} asChild disabled={!n.link}>
              <Link to={n.link ?? '#'} className={cn('flex-col items-start gap-0.5 py-2', !n.read && 'bg-primary/5')}>
                <span className="flex w-full items-center gap-1.5 text-sm font-medium">
                  <span>{NOTIFICATION_KIND[n.kind].emoji}</span>
                  <span className="min-w-0 flex-1 truncate">{n.title}</span>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </span>
                <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>
                <span className="text-[10px] text-muted-foreground">{formatJalali(n.at, 'relative')}</span>
              </Link>
            </DropdownMenuItem>
          ))}
          {(data ?? []).length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">اعلانی ندارید</p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
