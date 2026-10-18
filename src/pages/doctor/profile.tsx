// Doctor profile editor: bio, fee, education.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, GraduationCap, Save, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/states'
import { RatingStars } from '@/components/shared/rating-stars'
import { getMyDoctor, updateMyProfile } from '@/services/doctorService'
import { specialtyName } from '@/data/catalog'
import { formatToman } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persian'
import { useDocTitle } from '@/hooks'
import { useState } from 'react'

export default function DoctorProfile() {
  useDocTitle('پروفایل پزشکی')
  const queryClient = useQueryClient()
  const { data: doctor } = useQuery({ queryKey: ['my-doctor'], queryFn: getMyDoctor })

  const [bio, setBio] = useState(doctor?.bio ?? '')
  const [fee, setFee] = useState(doctor?.fee ? String(doctor.fee) : '')
  const [education, setEducation] = useState(doctor?.education ?? '')

  const saveMutation = useMutation({
    mutationFn: () =>
      updateMyProfile({
        bio: bio || undefined,
        fee: fee ? Number(fee) : undefined,
        education: education || undefined
      }),
    onSuccess: () => {
      toast.success('پروفایل پزشکی شما به‌روزرسانی شد')
      queryClient.invalidateQueries({ queryKey: ['my-doctor'] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  if (!doctor) return null

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="پروفایل پزشکی" description="اطلاعاتی که بیماران از شما می‌بینند." icon={Stethoscope} />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold">دکتر {doctor.fullName}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge>{specialtyName(doctor.specialty)}</Badge>
                <span className="flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5 text-success" />
                  نظام پزشکی: {toPersianDigits(doctor.medicalCouncilNumber)}
                </span>
              </div>
            </div>
            <RatingStars value={doctor.rating} count={doctor.reviewCount} />
          </div>

          <div className="grid grid-cols-2 gap-3 border-t pt-4 text-center sm:grid-cols-4">
            <div>
              <p className="text-[11px] text-muted-foreground">سابقه</p>
              <p className="font-bold tabular-nums-fa">{toPersianDigits(doctor.experienceYears)} سال</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">ویزیت‌ها</p>
              <p className="font-bold tabular-nums-fa">{toPersianDigits(doctor.visitCount)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">شهر</p>
              <p className="font-bold">{doctor.city}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">هزینه ویزیت</p>
              <p className="font-bold text-primary">{toPersianDigits(formatToman(doctor.fee))} تومان</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ویرایش اطلاعات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>معرفی حرفه‌ای</Label>
            <Textarea rows={5} defaultValue={doctor.bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>هزینه ویزیت (تومان)</Label>
              <Input inputMode="numeric" dir="ltr" defaultValue={doctor.fee} onChange={(e) => setFee(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>
                <GraduationCap className="ml-1 inline h-3.5 w-3.5" />
                دانشگاه
              </Label>
              <Input defaultValue={doctor.education ?? ''} onChange={(e) => setEducation(e.target.value)} />
            </div>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
