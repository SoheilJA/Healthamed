// Admin pharmacies CRUD.
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, MapPin, Pencil, Phone, Plus, Power, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader, EmptyState } from '@/components/shared/states'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { adminApi } from '@/services'
import { CITIES } from '@/lib/labels'
import { toPersianDigits, toEnglishDigits } from '@/lib/persian'
import type { Pharmacy } from '@/types'
import { useDocTitle } from '@/hooks'

interface FormState {
  id?: string
  name: string
  city: string
  address: string
  phone: string
  openHours: string
  active: boolean
}

const EMPTY_FORM: FormState = { name: '', city: 'تهران', address: '', phone: '', openHours: '۹ تا ۲۱', active: true }

export default function AdminPharmacies() {
  useDocTitle('داروخانه‌ها')
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [toggleTarget, setToggleTarget] = useState<Pharmacy | null>(null)

  const { data: pharmacies } = useQuery({ queryKey: ['admin-pharmacies'], queryFn: () => adminApi.listPharmaciesAdmin() })

  const saveMutation = useMutation({
    mutationFn: () => adminApi.savePharmacy(form),
    onSuccess: () => {
      toast.success('داروخانه ذخیره شد')
      setFormOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-pharmacies'] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.togglePharmacy(id),
    onSuccess: () => {
      toast.success('وضعیت داروخانه تغییر کرد')
      setToggleTarget(null)
      queryClient.invalidateQueries({ queryKey: ['admin-pharmacies'] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const valid =
    form.name.trim().length >= 3 &&
    form.address.trim().length >= 10 &&
    /^0\d{9,10}$/.test(toEnglishDigits(form.phone))

  return (
    <div className="space-y-6">
      <PageHeader
        title="داروخانه‌های همکار"
        description="مدیریت شبکه داروخانه‌های طرف قرارداد."
        icon={Building2}
        actions={
          <Button
            onClick={() => {
              setForm(EMPTY_FORM)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            داروخانه جدید
          </Button>
        }
      />

      {pharmacies && pharmacies.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pharmacies.map((ph) => (
            <Card key={ph.id} className={!ph.active ? 'opacity-70' : ''}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{ph.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {ph.city}
                    </p>
                  </div>
                  <Badge variant={ph.active ? 'success' : 'muted'}>{ph.active ? 'فعال' : 'غیرفعال'}</Badge>
                </div>
                <p className="text-xs leading-6 text-muted-foreground">{ph.address}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1" dir="ltr">
                    <Phone className="h-3 w-3" />
                    {toPersianDigits(ph.phone)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    {toPersianDigits(ph.rating.toFixed(1))}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">ساعات کاری: {ph.openHours}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setForm({
                        id: ph.id,
                        name: ph.name,
                        city: ph.city,
                        address: ph.address,
                        phone: ph.phone,
                        openHours: ph.openHours,
                        active: ph.active
                      })
                      setFormOpen(true)
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    ویرایش
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive"
                    onClick={() => setToggleTarget(ph)}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {ph.active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={Building2} title="داروخانه‌ای ثبت نشده است" />
      )}

      {/* form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'ویرایش داروخانه' : 'ثبت داروخانه جدید'}</DialogTitle>
            <DialogDescription>اطلاعات داروخانه همکار را وارد کنید.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>نام داروخانه</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>شهر</Label>
                <Select value={form.city} onValueChange={(v) => setForm((f) => ({ ...f, city: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تلفن</Label>
                <Input dir="ltr" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="02112345678" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>نشانی کامل</Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>ساعات کاری</Label>
                <Input value={form.openHours} onChange={(e) => setForm((f) => ({ ...f, openHours: e.target.value }))} />
              </div>
              <div className="flex items-center justify-between rounded-xl border px-3">
                <Label>فعال در شبکه</Label>
                <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              انصراف
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!valid || saveMutation.isPending}>
              {saveMutation.isPending ? 'در حال ذخیره…' : 'ذخیره'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={(o) => !o && setToggleTarget(null)}
        title={toggleTarget?.active ? 'غیرفعال‌سازی داروخانه' : 'فعال‌سازی داروخانه'}
        description={
          toggleTarget?.active
            ? 'این داروخانه از فهرست داروخانه‌های بیماران حذف می‌شود.'
            : 'این داروخانه دوباره در فهرست بیماران نمایش داده می‌شود.'
        }
        confirmLabel={toggleTarget?.active ? 'غیرفعال کن' : 'فعال کن'}
        destructive={toggleTarget?.active}
        loading={toggleMutation.isPending}
        onConfirm={() => toggleTarget && toggleMutation.mutate(toggleTarget.id)}
      />
    </div>
  )
}
