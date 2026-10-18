// Patient profile settings: contact info, theme, session.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LogOut, Moon, Save, Sun, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/states'
import { getMyPatient, getMyUser, updatePatientContact } from '@/services/patientService'
import { auth } from '@/services'
import { useTheme } from '@/components/layout/theme-provider'
import { CITIES } from '@/lib/labels'
import { toPersianDigits } from '@/lib/persian'
import { useDocTitle } from '@/hooks'
import { useState } from 'react'

export default function ProfilePage() {
  useDocTitle('پروفایل')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { resolved, setTheme } = useTheme()
  const { data: patient } = useQuery({ queryKey: ['my-patient'], queryFn: getMyPatient })
  const user = getMyUser()

  const [city, setCity] = useState(patient?.city ?? '')
  const [address, setAddress] = useState(patient?.address ?? '')
  const [ecName, setEcName] = useState(patient?.emergencyContact?.name ?? '')
  const [ecPhone, setEcPhone] = useState(patient?.emergencyContact?.phone ?? '')
  const [ecRelation, setEcRelation] = useState(patient?.emergencyContact?.relation ?? '')

  const saveMutation = useMutation({
    mutationFn: () =>
      updatePatientContact({
        city,
        address: address || undefined,
        emergencyContact: ecName && ecPhone ? { name: ecName, phone: ecPhone, relation: ecRelation || 'خانواده' } : undefined
      }),
    onSuccess: () => {
      toast.success('اطلاعات تماس ذخیره شد')
      queryClient.invalidateQueries({ queryKey: ['my-patient'] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="پروفایل من" description="اطلاعات حساب و تنظیمات برنامه." icon={UserRound} />

      {/* account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">اطلاعات حساب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="نام کامل" value={patient?.fullName ?? user?.fullName ?? '—'} />
          <Row
            label="شماره موبایل"
            value={<span dir="ltr">{toPersianDigits(user?.mobile ?? '')}</span>}
          />
          <Row label="نقش" value="بیمار" />
          {patient && <Row label="تاریخ عضویت" value={toPersianDigits(patient.createdAt.slice(0, 10))} />}
        </CardContent>
      </Card>

      {/* contact info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">اطلاعات تماس</CardTitle>
          <CardDescription>برای ارسال سفارش‌های دارو استفاده می‌شود.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>شهر</Label>
              <Select value={city || patient?.city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب شهر" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نشانی</Label>
              <Input
                defaultValue={patient?.address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="خیابان، کوچه، پلاک"
              />
            </div>
          </div>
          <Separator />
          <p className="text-sm font-medium">مخاطب اضطراری</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>نام</Label>
              <Input defaultValue={patient?.emergencyContact?.name} onChange={(e) => setEcName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>شماره تماس</Label>
              <Input dir="ltr" defaultValue={patient?.emergencyContact?.phone} onChange={(e) => setEcPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>نسبت</Label>
              <Input defaultValue={patient?.emergencyContact?.relation} onChange={(e) => setEcRelation(e.target.value)} />
            </div>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
          </Button>
        </CardContent>
      </Card>

      {/* appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ظاهر برنامه</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              حالت فعلی: {resolved === 'dark' ? 'تاریک' : 'روشن'}
            </p>
            <Button
              variant="outline"
              onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
            >
              {resolved === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              تغییر به {resolved === 'dark' ? 'روشن' : 'تاریک'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* danger */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">خروج از حساب</CardTitle>
          <CardDescription>برای ورود مجدد، شماره موبایل و کد تأیید لازم است.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => {
              auth.logout()
              navigate('/login', { replace: true })
            }}
          >
            <LogOut className="h-4 w-4" />
            خروج
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
