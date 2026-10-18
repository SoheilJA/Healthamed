// Doctor's patient list.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Search, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageHeader, EmptyState } from '@/components/shared/states'
import { getMyPatients } from '@/services/doctorService'
import { formatJalali } from '@/lib/jalali'
import { toPersianDigits, maskNationalId } from '@/lib/persian'
import { GENDER } from '@/lib/labels'
import { useDocTitle } from '@/hooks'

export default function DoctorPatients() {
  useDocTitle('بیماران من')
  const [search, setSearch] = useState('')
  const { data } = useQuery({ queryKey: ['doctor-patients', search], queryFn: () => getMyPatients(search) })

  return (
    <div className="space-y-6">
      <PageHeader title="بیماران من" description="بیمارانی که تاکنون به شما مراجعه کرده‌اند." icon={Users} />

      <div className="relative w-full sm:w-80">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو بر اساس نام یا کد ملی…"
          className="pr-9"
        />
      </div>

      {data && data.length > 0 ? (
        <div className="space-y-2">
          {data.map((row) => (
            <Link key={row.profile.id} to={`/panel/patients/${row.profile.id}`}>
              <Card className="p-4 transition-colors hover:bg-accent">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {row.profile.fullName}{' '}
                      <span className="text-xs font-normal text-muted-foreground">
                        {GENDER[row.profile.gender]} — کد ملی {maskNationalId(row.profile.nationalId)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      آخرین ویزیت: {row.lastVisitAt ? formatJalali(row.lastVisitAt, 'medium') : '—'} — {toPersianDigits(row.visitCount)} ویزیت
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {row.profile.allergies.length > 0 && (
                      <Badge variant="destructive">حساسیت دارویی</Badge>
                    )}
                    {row.profile.chronicConditions.length > 0 && (
                      <Badge variant="warning">{toPersianDigits(row.profile.chronicConditions.length)} بیماری زمینه‌ای</Badge>
                    )}
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="بیماری یافت نشد"
          description={search ? 'عبارت دیگری جستجو کنید.' : 'با پذیرش اولین بیمار، لیست شما تشکیل می‌شود.'}
        />
      )}
    </div>
  )
}
