// Prescription card with tracking code + QR (qrcode.react, fully local).
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Pill, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PRESCRIPTION_STATUS } from '@/lib/labels'
import { formatJalali } from '@/lib/jalali'
import { toPersianDigits } from '@/lib/persian'
import type { Prescription } from '@/types'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'muted' | 'success'> = {
  active: 'success',
  delivered: 'secondary',
  cancelled: 'destructive',
  expired: 'muted'
}

export function PrescriptionCard({
  prescription,
  doctorName,
  onOrder,
  onPrint,
  compact = false
}: {
  prescription: Prescription
  doctorName: string
  onOrder?: (rx: Prescription) => void
  onPrint?: (rx: Prescription) => void
  compact?: boolean
}) {
  const copyCode = () => {
    navigator.clipboard?.writeText(prescription.trackingCode).then(
      () => toast.success('کد پیگیری کپی شد'),
      () => toast.error('کپی انجام نشد')
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Pill className="h-4 w-4 text-primary" />
            نسخه الکترونیک
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[prescription.status] ?? 'secondary'}>
              {PRESCRIPTION_STATUS[prescription.status]}
            </Badge>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>پزشک: {doctorName}</span>
          <span>تاریخ صدور: {formatJalali(prescription.issuedAt)}</span>
          <span>اعتبار تا: {formatJalali(prescription.expiresAt)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* tracking code */}
        <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-3">
          <div>
            <p className="text-[11px] text-muted-foreground">کد پیگیری نسخه (برای خرید از هر داروخانه)</p>
            <p className="mt-0.5 select-all font-mono text-lg font-bold tracking-wider text-primary" dir="ltr">
              {prescription.trackingCode}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <QRCodeSVG
              value={JSON.stringify({
                t: 'healthamed-rx',
                code: prescription.trackingCode,
                n: prescription.items.length
              })}
              size={compact ? 56 : 68}
              bgColor="#ffffff"
              fgColor="#04AB6C"
              level="M"
            />
            <Button type="button" variant="ghost" size="iconSm" onClick={copyCode} aria-label="کپی کد پیگیری">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* items */}
        <div>
          <p className="mb-2 text-sm font-semibold">اقلام نسخه ({toPersianDigits(prescription.items.length)} قلم)</p>
          <ul className="space-y-2">
            {prescription.items.map((item, i) => (
              <li key={i} className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {toPersianDigits(i + 1)}. {item.name} <span className="text-muted-foreground">({item.dosage})</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.frequency} — {toPersianDigits(item.durationDays)} روز
                    {item.instructions ? ` — ${item.instructions}` : ''}
                  </p>
                </div>
                <Pill className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              </li>
            ))}
          </ul>
        </div>

        {prescription.notes && (
          <>
            <Separator />
            <p className="rounded-lg bg-warning/10 p-3 text-xs leading-6 text-foreground">
              <span className="font-semibold">توصیه پزشک: </span>
              {prescription.notes}
            </p>
          </>
        )}

        <div className="flex flex-wrap gap-2">
          {onOrder && prescription.status === 'active' && (
            <Button size="sm" onClick={() => onOrder(prescription)}>
              سفارش از داروخانه
            </Button>
          )}
          {onPrint && (
            <Button size="sm" variant="outline" onClick={() => onPrint(prescription)}>
              <Printer className="h-4 w-4" />
              چاپ نسخه
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
