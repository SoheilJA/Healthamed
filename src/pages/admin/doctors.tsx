// Admin doctors: approve / reject / suspend.
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, Search, ShieldX, Stethoscope, UserRoundX } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader, EmptyState } from '@/components/shared/states'
import { adminApi, type AdminDoctorRow } from '@/services'
import { specialtyName } from '@/data/catalog'
import { formatJalali } from '@/lib/jalali'
import { toPersianDigits } from '@/lib/persian'
import { DOCTOR_STATUS } from '@/lib/labels'
import { useDocTitle } from '@/hooks'

type Action = { type: 'rejected' | 'suspended'; doctor: AdminDoctorRow } | null

export default function AdminDoctors() {
  useDocTitle('مدیریت پزشکان')
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'pending' | 'approved' | 'all'>('pending')
  const [search, setSearch] = useState('')
  const [action, setAction] = useState<Action>(null)
  const [reason, setReason] = useState('')

  const { data: doctors } = useQuery({
    queryKey: ['admin-doctors', tab, search],
    queryFn: () => adminApi.listDoctors(tab === 'all' ? 'all' : tab, search)
  })

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: 'approved' | 'rejected' | 'suspended'; reason?: string }) =>
      adminApi.setDoctorStatus(input.id, input.status, input.reason),
    onSuccess: (_d, input) => {
      toast.success(
        input.status === 'approved'
          ? 'پزشک تأیید شد و به شبکه اضافه شد'
          : input.status === 'rejected'
            ? 'درخواست پزشک رد شد'
            : 'حساب پزشک معلق شد'
      )
      setAction(null)
      setReason('')
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const renderCard = (d: AdminDoctorRow) => (
    <Card key={d.id}>
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-bold">دکتر {d.fullName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {specialtyName(d.specialty)} — {d.city} — نظام پزشکی {toPersianDigits(d.medicalCouncilNumber)}
            </p>
          </div>
          <Badge
            variant={
              d.status === 'approved'
                ? 'success'
                : d.status === 'pending'
                  ? 'warning'
                  : d.status === 'suspended'
                    ? 'destructive'
                    : 'muted'
            }
          >
            {DOCTOR_STATUS[d.status]}
          </Badge>
        </div>

        {d.bio && <p className="line-clamp-2 text-xs leading-6 text-muted-foreground">{d.bio}</p>}

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {toPersianDigits(d.experienceYears)} سال سابقه — امتیاز {toPersianDigits(d.rating.toFixed(1))} — ثبت‌نام{' '}
            {formatJalali(d.createdAt, 'short')}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {d.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="success"
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate({ id: d.id, status: 'approved' })}
              >
                <BadgeCheck className="h-4 w-4" />
                تأیید و فعال‌سازی
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={statusMutation.isPending}
                onClick={() => setAction({ type: 'rejected', doctor: d })}
              >
                <ShieldX className="h-4 w-4" />
                رد درخواست
              </Button>
            </>
          )}
          {d.status === 'approved' && (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              disabled={statusMutation.isPending}
              onClick={() => setAction({ type: 'suspended', doctor: d })}
            >
              <UserRoundX className="h-4 w-4" />
              تعلیق حساب
            </Button>
          )}
          {d.status === 'suspended' && (
            <Button
              size="sm"
              variant="outline"
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate({ id: d.id, status: 'approved' })}
            >
              <BadgeCheck className="h-4 w-4" />
              رفع تعلیق
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت پزشکان"
        description="بررسی درخواست‌های همکاری و مدیریت پزشکان شبکه."
        icon={Stethoscope}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="pending">در انتظار تأیید</TabsTrigger>
          <TabsTrigger value="approved">تأییدشده</TabsTrigger>
          <TabsTrigger value="all">همه</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <div className="relative mb-4 w-full sm:w-80">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی نام یا شماره نظام پزشکی…"
              className="pr-9"
            />
          </div>

          <TabsContent value="pending" className="space-y-3">
            {(doctors ?? []).filter((d) => d.status === 'pending').map(renderCard)}
            {(doctors ?? []).filter((d) => d.status === 'pending').length === 0 && (
              <EmptyState icon={BadgeCheck} title="درخواست جدیدی در انتظار نیست" />
            )}
          </TabsContent>
          <TabsContent value="approved" className="space-y-3">
            {(doctors ?? []).filter((d) => d.status === 'approved').map(renderCard)}
          </TabsContent>
          <TabsContent value="all" className="space-y-3">
            {(doctors ?? []).map(renderCard)}
          </TabsContent>
        </div>
      </Tabs>

      {/* reject/suspend dialog */}
      <Dialog open={!!action} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action?.type === 'rejected' ? 'رد درخواست' : 'تعلیق حساب'} — دکتر {action?.doctor.fullName}
            </DialogTitle>
            <DialogDescription>دلیل خود را بنویسید (به پزشک اطلاع داده می‌شود):</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>دلیل</Label>
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="مثلاً: مدارک ناقص است…" />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAction(null)}>
              انصراف
            </Button>
            <Button
              variant="destructive"
              disabled={reason.trim().length < 5 || statusMutation.isPending}
              onClick={() =>
                action &&
                statusMutation.mutate({
                  id: action.doctor.id,
                  status: action.type === 'rejected' ? 'rejected' : 'suspended',
                  reason: reason.trim()
                })
              }
            >
              {statusMutation.isPending ? 'در حال ثبت…' : 'ثبت'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
