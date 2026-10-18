// Orders list with live status timeline.
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Circle, Package, ShoppingBag, Truck, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader, EmptyState } from '@/components/shared/states'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { cancelOrder, getMyOrders, listPharmacies } from '@/services/patientService'
import { formatDateTime, formatJalali } from '@/lib/jalali'
import { formatToman } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persian'
import { ORDER_STATUS } from '@/lib/labels'
import type { Order } from '@/types'
import { useDocTitle } from '@/hooks'
import { useState } from 'react'

const FLOW: Order['status'][] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered']

export default function OrdersPage() {
  useDocTitle('سفارش‌ها')
  const queryClient = useQueryClient()
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
    refetchInterval: 15000
  })
  const { data: pharmacies } = useQuery({ queryKey: ['pharmacies'], queryFn: listPharmacies })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: () => {
      toast.success('سفارش لغو شد')
      setCancelTarget(null)
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const pharmacyName = (id: string) => pharmacies?.find((p) => p.id === id)?.name ?? '—'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="سفارش‌های دارو"
        description="وضعیت سفارش‌های شما به‌صورت زنده به‌روزرسانی می‌شود."
        icon={ShoppingBag}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const stepIndex = FLOW.indexOf(order.status)
            const cancellable = order.status === 'pending' || order.status === 'confirmed'
            return (
              <Card key={order.id}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">{pharmacyName(order.pharmacyId)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatJalali(order.createdAt, 'full')} — {toPersianDigits(order.items.length)} قلم دارو
                      </p>
                    </div>
                    <div className="text-left">
                      <Badge
                        variant={
                          order.status === 'delivered'
                            ? 'success'
                            : order.status === 'cancelled'
                              ? 'destructive'
                              : order.status === 'pending'
                                ? 'warning'
                                : 'info'
                        }
                      >
                        {ORDER_STATUS[order.status]}
                      </Badge>
                      <p className="mt-1 text-sm font-bold text-primary">
                        {toPersianDigits(formatToman(order.total))} تومان
                      </p>
                    </div>
                  </div>

                  {order.status !== 'cancelled' && (
                    <div className="flex items-center justify-between" dir="rtl">
                      {FLOW.map((st, i) => (
                        <div key={st} className="flex flex-1 flex-col items-center gap-1.5">
                          <div className="flex w-full items-center">
                            {i > 0 && (
                              <span
                                className={`h-0.5 flex-1 ${i <= stepIndex ? 'bg-primary' : 'bg-border'}`}
                              />
                            )}
                            {i <= stepIndex ? (
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                            ) : (
                              <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                            )}
                            {i < FLOW.length - 1 && (
                              <span className={`h-0.5 flex-1 ${i < stepIndex ? 'bg-primary' : 'bg-border'}`} />
                            )}
                          </div>
                          <span
                            className={`text-center text-[10px] leading-3 ${
                              i <= stepIndex ? 'font-medium text-foreground' : 'text-muted-foreground/60'
                            }`}
                          >
                            {ORDER_STATUS[st]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5" />
                      {order.items.map((i) => i.name).join('، ')}
                    </span>
                    {order.address && (
                      <span className="flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5" />
                        {order.address}
                      </span>
                    )}
                  </div>

                  {order.statusHistory.length > 1 && (
                    <p className="text-[11px] text-muted-foreground">
                      آخرین تغییر: {formatDateTime(order.statusHistory[order.statusHistory.length - 1].at)}
                    </p>
                  )}

                  {cancellable && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setCancelTarget(order)}
                    >
                      <XCircle className="h-4 w-4" />
                      لغو سفارش
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="سفارشی ثبت نشده است"
          description="با نسخه فعال می‌توانید از داروخانه‌های همکار سفارش دهید."
          action={
            <Button asChild variant="outline">
              <Link to="/app/pharmacies">مشاهده داروخانه‌ها</Link>
            </Button>
          }
        />
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="لغو سفارش"
        description="آیا از لغو این سفارش اطمینان دارید؟ این عملیات قابل بازگشت نیست."
        destructive
        confirmLabel="بله، لغو کن"
        loading={cancelMutation.isPending}
        onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
      />
    </div>
  )
}
