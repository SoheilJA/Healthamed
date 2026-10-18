// Doctor detail: profile + slot booking + start visit dialog.
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, BadgeCheck, CalendarClock, GraduationCap, MapPin, Send, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { RatingStars } from '@/components/shared/rating-stars'
import { SlotPicker } from '@/components/shared/slot-picker'
import { ErrorState } from '@/components/shared/states'
import { Skeleton } from '@/components/ui/skeleton'
import { specialtyName } from '@/data/catalog'
import { specialtyIcon } from '@/lib/icons'
import { formatToman } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persian'
import { GENDER, URGENCY } from '@/lib/labels'
import { getDoctor, getDoctorSlots, startVisit } from '@/services/patientService'
import { useDocTitle } from '@/hooks'

export default function DoctorDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  useDocTitle('رزرو نوبت')

  const { data: doctor, error } = useQuery({ queryKey: ['doctor', id], queryFn: () => getDoctor(id) })
  const { data: slotsByDay } = useQuery({ queryKey: ['doctor-slots', id], queryFn: () => getDoctorSlots(id) })

  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ dateKey: string; time: string } | null>(null)
  const [booking, setBooking] = useState(false)
  const [complaint, setComplaint] = useState('')
  const [urgency, setUrgency] = useState<'routine' | 'urgent'>('routine')

  const firstAvailableDay = useMemo(() => {
    if (!slotsByDay) return null
    const entry = Object.entries(slotsByDay).find(([, slots]) => slots.some((s) => !s.taken))
    return entry?.[0] ?? null
  }, [slotsByDay])

  const activeDay = selectedDay ?? firstAvailableDay

  const bookMutation = useMutation({
    mutationFn: () =>
      startVisit({
        doctorId: id,
        dateKey: selectedSlot!.dateKey,
        time: selectedSlot!.time,
        chiefComplaint: complaint,
        urgency
      }),
    onSuccess: (visit) => {
      toast.success('ویزیت شما ثبت شد؛ گفتگو را شروع کنید.')
      queryClient.invalidateQueries({ queryKey: ['my-visits'] })
      navigate(`/app/visits/${visit.id}`)
    },
    onError: (e: Error) => toast.error(e.message)
  })

  if (error) return <ErrorState message="پزشک یافت نشد." />
  if (!doctor || !slotsByDay) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  const Icon = specialtyIcon(doctor.specialty)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/app/doctors">
          <ArrowRight className="h-4 w-4" />
          بازگشت به فهرست پزشکان
        </Link>
      </Button>

      {/* profile header */}
      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
              {doctor.fullName.split(' ').slice(0, 2).map((w) => w[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold">دکتر {doctor.fullName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge className="gap-1">
                  <Icon className="h-3 w-3" />
                  {specialtyName(doctor.specialty)}
                </Badge>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {doctor.city}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5 text-success" />
                  {toPersianDigits(doctor.experienceYears)} سال سابقه
                </span>
                <span>{GENDER[doctor.gender as 'male' | 'female']}</span>
              </div>
            </div>
            <RatingStars value={doctor.rating} count={doctor.reviewCount} />
            <p className="text-sm leading-7 text-muted-foreground">{doctor.bio}</p>
            {doctor.education && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <GraduationCap className="h-4 w-4 text-primary" />
                {doctor.education}
              </p>
            )}
            <div className="flex items-center gap-4 border-t pt-3">
              <div>
                <p className="text-xs text-muted-foreground">هزینه ویزیت</p>
                <p className="font-bold text-primary">
                  {toPersianDigits(formatToman(doctor.fee))} تومان
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ویزیت‌های انجام‌شده</p>
                <p className="font-bold tabular-nums-fa">{toPersianDigits(doctor.visitCount)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* slots */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="h-4 w-4 text-primary" />
            انتخاب نوبت (۱۴ روز آینده)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SlotPicker
            slotsByDay={slotsByDay}
            selectedDay={activeDay ?? ''}
            onSelectDay={setSelectedDay}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
          <Button
            className="w-full sm:w-auto"
            size="lg"
            disabled={!selectedSlot}
            onClick={() => setBooking(true)}
          >
            <Stethoscope className="h-4 w-4" />
            {selectedSlot ? `رزرو نوبت ساعت ${toPersianDigits(selectedSlot.time)}` : 'ابتدا ساعت را انتخاب کنید'}
          </Button>
        </CardContent>
      </Card>

      {/* booking dialog */}
      <Dialog open={booking} onOpenChange={setBooking}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>شروع ویزیت با دکتر {doctor.fullName}</DialogTitle>
            <DialogDescription>
              شرح کوتاهی از مشکل خود بنویسید؛ پزشک پیش از پاسخ، پرونده پزشکی شما را بررسی می‌کند.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label>شرح شکایت اصلی</Label>
              <Textarea
                rows={4}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="مثلاً: از دیشب سردرد شدید دارم و نور چشم‌هایم را تحمل نمی‌کنم…"
              />
            </div>
            <div className="space-y-2">
              <Label>فوریت</Label>
              <RadioGroup
                value={urgency}
                onValueChange={(v) => setUrgency(v as 'routine' | 'urgent')}
                className="grid grid-cols-2 gap-2"
              >
                {(['routine', 'urgent'] as const).map((u) => (
                  <Label
                    key={u}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <span className="text-sm font-medium">{URGENCY[u]}</span>
                    <RadioGroupItem value={u} />
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBooking(false)}>
              انصراف
            </Button>
            <Button
              disabled={complaint.trim().length < 5 || bookMutation.isPending}
              onClick={() => bookMutation.mutate()}
            >
              <Send className="h-4 w-4" />
              {bookMutation.isPending ? 'در حال ثبت…' : 'ثبت و شروع گفتگو'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
