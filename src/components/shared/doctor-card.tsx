// Doctor directory card.
import { Link } from 'react-router-dom'
import { CalendarCheck, MapPin, Stethoscope } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RatingStars } from './rating-stars'
import { specialtyName } from '@/data/catalog'
import { specialtyIcon } from '@/lib/icons'
import { toPersianDigits } from '@/lib/persian'
import { formatToman } from '@/lib/utils'
import { GENDER } from '@/lib/labels'
import type { DoctorCardData } from '@/services/patientService'

export function DoctorCard({ doctor }: { doctor: DoctorCardData }) {
  const Icon = specialtyIcon(doctor.specialty)
  const isFemale = doctor.gender === 'female'
  return (
    <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 border">
            <AvatarFallback className={isFemale ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-primary/10 text-primary'}>
              {doctor.fullName.split(' ').slice(0, 2).map((w) => w[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <Link to={`/app/doctors/${doctor.id}`} className="block truncate font-semibold hover:text-primary">
              دکتر {doctor.fullName}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="gap-1">
                <Icon className="h-3 w-3" />
                {specialtyName(doctor.specialty)}
              </Badge>
              <Badge variant="muted">{GENDER[doctor.gender as 'male' | 'female'] ?? ''}</Badge>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {doctor.city}
              </span>
              <span className="inline-flex items-center gap-1">
                <Stethoscope className="h-3 w-3" />
                {toPersianDigits(doctor.experienceYears)} سال سابقه
              </span>
            </div>
          </div>
        </div>

        <p className="line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-muted-foreground">{doctor.bio}</p>

        <div className="flex items-center justify-between">
          <RatingStars value={doctor.rating} count={doctor.reviewCount} size="sm" />
          <span className="text-sm font-bold text-primary">
            {toPersianDigits(formatToman(doctor.fee))} <span className="text-xs font-normal">تومان</span>
          </span>
        </div>

        <Button asChild className="w-full">
          <Link to={`/app/doctors/${doctor.id}`}>
            <CalendarCheck className="h-4 w-4" />
            رزرو نوبت و مشاوره
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
