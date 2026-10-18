// Admin audit log with search + pagination.
import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { FileClock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SearchInput } from '@/components/shared/search-input'
import { TablePager } from '@/components/shared/data-table'
import { PageHeader, EmptyState } from '@/components/shared/states'
import { adminApi } from '@/services'
import { formatDateTime } from '@/lib/jalali'
import { auditActionLabel } from '@/lib/labels'
import { toPersianDigits } from '@/lib/persian'
import { useDocTitle } from '@/hooks'

export default function AdminAudit() {
  useDocTitle('گزارش حسابرسی')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isFetching } = useQuery({
    queryKey: ['admin-audit', { search, page }],
    queryFn: () => adminApi.listAudit({ search, page, pageSize: 15 }),
    placeholderData: keepPreviousData
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="گزارش حسابرسی"
        description="تمام اقدامات حساس مدیران به همراه زمان و عامل ثبت می‌شود."
        icon={FileClock}
      />

      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        placeholder="جستجوی عملیات، مدیر یا هدف…"
        className="sm:w-80"
      />

      {data && data.items.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-14">#</TableHead>
                  <TableHead>عملیات</TableHead>
                  <TableHead>عامل</TableHead>
                  <TableHead>هدف</TableHead>
                  <TableHead>زمان</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={isFetching ? 'opacity-60' : ''}>
                {data.items.map((entry, i) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs text-muted-foreground tabular-nums-fa">
                      {toPersianDigits((data.page - 1) * data.pageSize + i + 1)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.action.includes('delete') || entry.action.includes('suspend') ? 'destructive' : 'secondary'}>
                        {auditActionLabel(entry.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{entry.actorName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.target ?? '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(entry.at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <TablePager page={data.page} pages={data.pages} total={data.total} onChange={setPage} />
        </>
      ) : (
        <EmptyState icon={FileClock} title="رکوردی یافت نشد" description="عبارت دیگری جستجو کنید." />
      )}
    </div>
  )
}
