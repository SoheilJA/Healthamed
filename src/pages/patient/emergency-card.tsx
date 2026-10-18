// Emergency card page: view + print + offline sync.
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileHeart, Printer, ShieldCheck, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/states'
import { EmergencyCardView } from '@/components/shared/emergency-card-view'
import { getEmergencyCard } from '@/services/patientService'
import { syncApi } from '@/services'
import { useAuthStore } from '@/stores'
import { useDocTitle, useInstallPrompt, useOnline } from '@/hooks'
import { formatDateTime } from '@/lib/jalali'

export default function EmergencyCardPage() {
  useDocTitle('کارت اضطراری')
  const queryClient = useQueryClient()
  const online = useOnline()
  const userId = useAuthStore((s) => s.userId)!
  const { canInstall, promptInstall, isStandalone } = useInstallPrompt()
  const [snapshotAt, setSnapshotAt] = useState<string | null>(null)

  const { data: card } = useQuery({
    queryKey: ['emergency-card'],
    queryFn: getEmergencyCard,
    enabled: online
  })

  // load offline snapshot (re-fetch when connectivity changes)
  const { data: offlineSnapshot } = useQuery({
    queryKey: ['offline-snapshot', userId, online],
    queryFn: () => syncApi.loadSnapshot(userId)
  })

  const syncMutation = useMutation({
    mutationFn: () => syncApi.buildOfflineSnapshot(userId),
    onSuccess: (snap) => {
      setSnapshotAt(snap.syncedAt)
      queryClient.setQueryData(['offline-snapshot', userId, online], snap)
      queryClient.invalidateQueries({ queryKey: ['offline-snapshot'] })
      toast.success('کارت اضطراری و نسخه‌های فعال برای استفاده آفلاین ذخیره شدند')
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const effectiveCard = online ? card : offlineSnapshot?.emergencyCard
  const lastSynced = snapshotAt ?? offlineSnapshot?.syncedAt ?? null

  const print = () => {
    window.print()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader
        title="کارت اضطراری پزشکی"
        description="در شرایط بحرانی، این اطلاعات جان شما را نجات می‌دهد."
        icon={FileHeart}
        actions={
          <Button variant="outline" onClick={print} className="no-print">
            <Printer className="h-4 w-4" />
            چاپ کارت
          </Button>
        }
      />

      {online ? (
        <Alert variant="info" className="no-print">
          برای اطمینان از دسترسی بدون اینترنت، هر بار پس از تغییر پرونده، دکمه «همگام‌سازی برای آفلاین» را بزنید.
          نسخه اخیر در حافظه دستگاه ذخیره می‌شود.
        </Alert>
      ) : (
        <Alert variant="warning" className="no-print">
          <span className="flex items-center gap-2 font-medium text-warning">
            <WifiOff className="h-4 w-4" />
            حالت آفلاین
          </span>
          {offlineSnapshot
            ? `در حال نمایش نسخه ذخیره‌شده در ${formatDateTime(offlineSnapshot.syncedAt)}`
            : 'نسخه آفلاین ذخیره نشده است.'}
        </Alert>
      )}

      {effectiveCard ? (
        <div className="print-area">
          <EmergencyCardView
            card={effectiveCard}
            lastSyncedAt={lastSynced}
            onSync={() => syncMutation.mutate()}
            syncing={syncMutation.isPending}
          />
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            برای ساخت کارت اضطراری، ابتدا پرونده پزشکی خود را تکمیل کنید.
          </CardContent>
        </Card>
      )}

      {/* offline prescriptions list */}
      {offlineSnapshot && offlineSnapshot.activePrescriptions.length > 0 && (
        <Card className="no-print">
          <CardContent className="space-y-2 p-5">
            <p className="flex items-center gap-2 text-sm font-bold">
              <ShieldCheck className="h-4 w-4 text-success" />
              نسخه‌های فعال موجود در حالت آفلاین
            </p>
            {offlineSnapshot.activePrescriptions.map((rx) => (
              <div key={rx.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                <span className="font-mono text-primary" dir="ltr">{rx.trackingCode}</span>
                <span className="text-xs text-muted-foreground">{rx.items.length} قلم دارو</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* PWA install hint */}
      {!isStandalone && canInstall && (
        <Card className="no-print border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold">هلثامد را روی گوشی نصب کنید</p>
              <p className="text-xs text-muted-foreground">
                نصب اپلیکیشن، دسترسی آفلاین به کارت اضطراری را سریع‌تر می‌کند.
              </p>
            </div>
            <Button size="sm" onClick={promptInstall}>
              نصب برنامه
            </Button>
          </CardContent>
        </Card>
      )}

      {/* iOS install hint */}
      {!isStandalone && !canInstall && (
        <p className="text-center text-xs leading-6 text-muted-foreground no-print">
          برای نصب روی iOS: در مرورگر Safari دکمه اشتراک‌گذاری را بزنید و «Add to Home Screen» را انتخاب کنید.
        </p>
      )}
    </div>
  )
}
