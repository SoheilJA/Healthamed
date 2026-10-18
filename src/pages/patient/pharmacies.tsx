// Pharmacies list + order creation dialog from a prescription.
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Clock3, MapPin, Phone, ShoppingBag, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader, EmptyState } from '@/components/shared/states'
import { Skeleton } from '@/components/ui/skeleton'
import { listPharmacies, getMyPrescriptions, createOrder } from '@/services/patientService'
import { formatToman } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persian'
import type { Pharmacy, Prescription } from '@/types'
import { useDocTitle } from '@/hooks'
import { drugById } from '@/data/catalog'

export default function PharmaciesPage() {
  useDocTitle('داروخانه‌ها')
  const queryClient = useQueryClient()
  const { data: pharmacies, isLoading } = useQuery({ queryKey: ['pharmacies'], queryFn: listPharmacies })
  const { data: prescriptions } = useQuery({ queryKey: ['my-rx'], queryFn: getMyPrescriptions })
  const activeRx = useMemo(() => (prescriptions ?? []).filter((r) => r.status === 'active'), [prescriptions])

  const [orderRx, setOrderRx] = useState<Prescription | null>(null)
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [address, setAddress] = useState('')

  const openOrder = (rx: Prescription, ph: Pharmacy) => {
    setOrderRx(rx)
    setPharmacy(ph)
    setQuantities(Object.fromEntries(rx.items.map((i) => [i.drugId, 1])))
  }

  const orderMutation = useMutation({
    mutationFn: () =>
      createOrder({
        prescriptionId: orderRx!.id,
        pharmacyId: pharmacy!.id,
        quantities,
        address: address || undefined
      }),
    onSuccess: () => {
      toast.success('سفارش شما ثبت شد و در حال پیگیری است')
      setOrderRx(null)
      setPharmacy(null)
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const subtotal = orderRx
    ? orderRx.items.reduce((s, it) => s + (drugById(it.drugId)?.price ?? 0) * (quantities[it.drugId] ?? 1), 0)
    : 0

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="داروخانه‌های همکار"
        description="سفارش دارو بر اساس نسخه فعال، یا دریافت حضوری با کد پیگیری."
        icon={Building2}
      />

      {activeRx.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm">
              شما <b>{toPersianDigits(activeRx.length)} نسخه فعال</b> دارید — داروخانه مورد نظر را انتخاب و روی «سفارش» بزنید.
            </p>
            <Badge variant="success">{activeRx[0].trackingCode}</Badge>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : pharmacies && pharmacies.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {pharmacies.map((ph) => (
            <Card key={ph.id} className="transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{ph.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {ph.city}
                    </p>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    {toPersianDigits(ph.rating.toFixed(1))}
                  </Badge>
                </div>
                <p className="text-xs leading-6 text-muted-foreground">{ph.address}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock3 className="h-3 w-3" />
                    {ph.openHours}
                  </span>
                  <span className="flex items-center gap-1" dir="ltr">
                    <Phone className="h-3 w-3" />
                    {toPersianDigits(ph.phone)}
                  </span>
                </div>
                {activeRx.length > 0 ? (
                  <Button className="w-full" size="sm" onClick={() => openOrder(activeRx[0], ph)}>
                    <ShoppingBag className="h-4 w-4" />
                    سفارش با نسخه {activeRx[0].trackingCode.slice(-6)}
                  </Button>
                ) : (
                  <p className="rounded-lg bg-muted p-2 text-center text-xs text-muted-foreground">
                    برای سفارش آنلاین، ابتدا نیاز به نسخه فعال دارید
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={Building2} title="داروخانه‌ای یافت نشد" />
      )}

      {/* order dialog */}
      <Dialog open={!!orderRx && !!pharmacy} onOpenChange={(o) => !o && (setOrderRx(null), setPharmacy(null))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>سفارش دارو از {pharmacy?.name}</DialogTitle>
            <DialogDescription>
              کد پیگیری نسخه: <span className="font-mono font-bold text-primary" dir="ltr">{orderRx?.trackingCode}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 space-y-2 overflow-y-auto scroll-thin">
            {orderRx?.items.map((item) => {
              const drug = drugById(item.drugId)
              const qty = quantities[item.drugId] ?? 1
              return (
                <div key={item.drugId} className="flex items-center gap-3 rounded-xl border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {toPersianDigits(formatToman(drug?.price ?? 0))} تومان
                    </p>
                  </div>
                  <div className="flex items-center gap-1" dir="ltr">
                    <Button
                      type="button"
                      variant="outline"
                      size="iconSm"
                      onClick={() => setQuantities((q) => ({ ...q, [item.drugId]: Math.max(1, qty - 1) }))}
                    >
                      −
                    </Button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums-fa">{toPersianDigits(qty)}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="iconSm"
                      onClick={() => setQuantities((q) => ({ ...q, [item.drugId]: Math.min(5, qty + 1) }))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="space-y-2">
            <Label>آدرس تحویل (اختیاری — در صورت خالی بودن، تحویل حضوری)</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="نشانی کامل" />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">جمع سفارش + ارسال: </span>
              <span className="font-bold text-primary">{toPersianDigits(formatToman(subtotal + 45000))} تومان</span>
            </div>
            <Button onClick={() => orderMutation.mutate()} disabled={orderMutation.isPending}>
              {orderMutation.isPending ? 'در حال ثبت…' : 'ثبت سفارش'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
