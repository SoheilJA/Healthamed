// Generic data table: sorting, pagination, loading, empty states.
import type { LucideIcon } from 'lucide-react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { EmptyState } from './states'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persian'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  className?: string
  render: (row: T) => React.ReactNode
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  emptyTitle = 'موردی یافت نشد',
  emptyDescription,
  sortKey,
  sortDir,
  onSort,
  onRowClick,
  skeletonRows = 8
}: {
  columns: Column<T>[]
  rows: T[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
  onRowClick?: (row: T) => void
  skeletonRows?: number
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {columns.map((col) => {
              const active = sortKey === col.key
              return (
                <TableHead key={col.key} className={col.className}>
                  {col.sortable && onSort ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                      onClick={() => onSort(col.key)}
                    >
                      {col.header}
                      {active ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton className="h-5 w-full max-w-32" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-0">
                <EmptyState className="border-0" title={emptyTitle} description={emptyDescription} />
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(onRowClick && 'cursor-pointer')}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export function TablePager({
  page,
  pages,
  total,
  onChange
}: {
  page: number
  pages: number
  total: number
  onChange: (page: number) => void
}) {
  if (pages <= 1) {
    return (
      <p className="py-2 text-center text-xs text-muted-foreground">
        {toPersianDigits(total)} مورد
      </p>
    )
  }
  const window = 2
  const nums: number[] = []
  for (let p = Math.max(1, page - window); p <= Math.min(pages, page + window); p++) nums.push(p)

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2">
      <p className="text-xs text-muted-foreground">
        نمایش {toPersianDigits(((page - 1) * Math.ceil(total / pages) || 0) + 1)}–
        {toPersianDigits(Math.min(page * Math.ceil(total / pages), total))} از {toPersianDigits(total)} مورد
      </p>
      <div className="flex items-center gap-1" dir="ltr">
        <Button variant="outline" size="iconSm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="قبلی">
          ‹
        </Button>
        {nums[0] > 1 && <span className="px-1 text-xs text-muted-foreground">…</span>}
        {nums.map((p) => (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="iconSm"
            onClick={() => onChange(p)}
            className="tabular-nums-fa"
          >
            {toPersianDigits(p)}
          </Button>
        ))}
        {nums[nums.length - 1] < pages && <span className="px-1 text-xs text-muted-foreground">…</span>}
        <Button variant="outline" size="iconSm" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="بعدی">
          ›
        </Button>
      </div>
    </div>
  )
}
