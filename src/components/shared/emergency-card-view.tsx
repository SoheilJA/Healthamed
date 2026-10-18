// Printable emergency card with QR + offline snapshot state.
import { QRCodeSVG } from 'qrcode.react'
import { AlertTriangle, HeartPulse, Phone, RefreshCw, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatJalali, formatDateTime } from '@/lib/jalali'
import { maskNationalId, toPersianDigits } from '@/lib/persian'
import { GENDER, SEVERITY } from '@/lib/labels'
import type { EmergencyCard as EmergencyCardType } from '@/types'

export function EmergencyCardView({
  card,
  lastSyncedAt,
  onSync,
  syncing,
  className,
  printMode = false
}: {
  card: EmergencyCardType
  lastSyncedAt?: string | null
  onSync?: () => void
  syncing?: boolean
  className?: string
  printMode?: boolean
}) {
  const qrPayload = JSON.stringify({
    t: 'healthamed-emergency',
    name: card.fullName,
    age: card.age,
    blood: card.bloodType ?? '',
    allergies: card.allergies.map((a) => a.substance),
    chronic: card.chronicConditions,
    contact: card.emergencyContact?.phone ?? ''
  })

  return (
    <Card className={className}>
      <CardHeader className="rounded-t-xl bg-gradient-to-l from-destructive to-rose-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <HeartPulse className="h-5 w-5" />
            کارت اضطراری پزشکی
          </CardTitle>
          <Badge className="border-white/30 bg-white/15 text-white">هلثامد</Badge>
        </div>
        <p className="text-xs text-white/80">
          در موارد اورژانسی، این کارت را به امدادگر یا پزشک نشان دهید
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold">{card.fullName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {GENDER[card.gender]} — {toPersianDigits(card.age)} سال — کد ملی: {maskNationalId(card.nationalId)}
            </p>
          </div>
          {card.bloodType && (
            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-destructive/50 bg-destructive/5 text-destructive">
              <span className="text-[10px]">گروه خونی</span>
              <span className="text-xl font-black" dir="ltr">{card.bloodType}</span>
            </div>
          )}
        </div>

        {(card.allergies.length > 0 || card.chronicConditions.length > 0 || card.medications.length > 0) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {card.allergies.length > 0 && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3">
                <p className="mb-1.5 flex items-center gap-1 text-xs font-bold text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  حساسیت‌های دارویی
                </p>
                <ul className="space-y-1 text-xs">
                  {card.allergies.map((a, i) => (
                    <li key={i}>
                      • {a.substance} <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-[10px]">{SEVERITY[a.severity]}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {card.chronicConditions.length > 0 && (
              <div className="rounded-xl border border-warning/40 bg-warning/5 p-3">
                <p className="mb-1.5 text-xs font-bold text-warning">بیماری‌های زمینه‌ای</p>
                <ul className="space-y-1 text-xs">
                  {card.chronicConditions.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            )}
            {card.medications.length > 0 && (
              <div className="rounded-xl border border-info/40 bg-info/5 p-3">
                <p className="mb-1.5 text-xs font-bold text-info">داروهای مصرفی</p>
                <ul className="space-y-1 text-xs">
                  {card.medications.map((m, i) => (
                    <li key={i}>• {m}</li>
                  ))}
                </ul>
              </div>
            )}
            {card.emergencyContact && (
              <div className="rounded-xl border p-3">
                <p className="mb-1.5 flex items-center gap-1 text-xs font-bold text-primary">
                  <Phone className="h-3.5 w-3.5" />
                  تماس اضطراری
                </p>
                <p className="text-xs">
                  {card.emergencyContact.name} ({card.emergencyContact.relation}) —{' '}
                  <span className="tabular-nums-fa font-medium text-primary" dir="ltr">
                    {toPersianDigits(card.emergencyContact.phone)}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
          <div className="text-xs text-muted-foreground">
            <p className="flex items-center gap-1 font-medium text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              دسترسی آفلاین
            </p>
            <p className="mt-0.5">
              {lastSyncedAt
                ? `آخرین همگام‌سازی: ${formatDateTime(lastSyncedAt)}`
                : 'هنوز همگام‌سازی نشده — برای دسترسی آفلاین همگام کنید.'}
            </p>
          </div>
          <QRCodeSVG value={qrPayload} size={72} fgColor="#1a1a1a" level="M" />
        </div>

        {!printMode && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>تاریخ صدور کارت: {formatJalali(card.generatedAt)}</span>
            {onSync && (
              <Button size="sm" variant="outline" onClick={onSync} disabled={syncing}>
                <RefreshCw className={syncing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                {syncing ? 'در حال همگام‌سازی…' : 'همگام‌سازی برای آفلاین'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
