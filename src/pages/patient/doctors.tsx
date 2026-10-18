// Doctors directory with specialty filter + search + pagination.
import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Stethoscope } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DoctorCard } from '@/components/shared/doctor-card'
import { SearchInput } from '@/components/shared/search-input'
import { TablePager } from '@/components/shared/data-table'
import { PageHeader, EmptyState } from '@/components/shared/states'
import { Skeleton } from '@/components/ui/skeleton'
import { SPECIALTIES } from '@/data/catalog'
import { listDoctors } from '@/services/patientService'
import { CITIES } from '@/lib/labels'
import { toPersianDigits } from '@/lib/persian'
import { useDocTitle } from '@/hooks'

export default function DoctorsPage() {
  useDocTitle('پزشکان')
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('all')
  const [city, setCity] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isFetching } = useQuery({
    queryKey: ['doctors', { search, specialty, city, page }],
    queryFn: () => listDoctors({ search, specialty, city, page, pageSize: 9 }),
    placeholderData: keepPreviousData
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="پزشکان و متخصصان"
        description="بر اساس تخصص و شهر، پزشک مناسب خود را انتخاب کنید."
        icon={Stethoscope}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          placeholder="جستجوی نام پزشک…"
          className="sm:w-64"
        />
        <div className="flex gap-3">
          <Select value={specialty} onValueChange={(v) => { setSpecialty(v); setPage(1) }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="تخصص" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه تخصص‌ها</SelectItem>
              {SPECIALTIES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={city} onValueChange={(v) => { setCity(v); setPage(1) }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="شهر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه شهرها</SelectItem>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-muted-foreground sm:ms-auto tabular-nums-fa">
          {toPersianDigits(data?.total ?? 0)} پزشک
        </span>
      </div>

      {isFetching && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className={`grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? 'opacity-60' : ''}`}>
            {data.items.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
          <TablePager page={data.page} pages={data.pages} total={data.total} onChange={setPage} />
        </>
      ) : (
        <EmptyState
          icon={Stethoscope}
          title="پزشکی یافت نشد"
          description="فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید."
        />
      )}
    </div>
  )
}
