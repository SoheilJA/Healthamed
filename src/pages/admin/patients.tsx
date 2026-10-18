// Admin patients: server-style paginated DataTable + search/sort/filter + CSV import/export.
import { useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpDown, Download, Upload, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SearchInput } from '@/components/shared/search-input'
import { DataTable, TablePager, type Column } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/states'
import { FileUploader } from '@/components/shared/file-uploader'
import { adminApi, type AdminPatientRow, type ImportRow } from '@/services'
import { downloadCsv, parseCsv, toCsv } from '@/lib/csv'
import { formatJalali } from '@/lib/jalali'
import { toPersianDigits, maskNationalId } from '@/lib/persian'
import { GENDER } from '@/lib/labels'
import { useDocTitle } from '@/hooks'

const FIELD_OPTIONS = [
  { value: 'fullName', label: 'نام و نام خانوادگی' },
  { value: 'mobile', label: 'شماره موبایل' },
  { value: 'nationalId', label: 'کد ملی' },
  { value: 'gender', label: 'جنسیت' },
  { value: 'birthDate', label: 'تاریخ تولد (میلادی)' },
  { value: 'city', label: 'شهر' }
]

const TARGET_FIELDS = ['fullName', 'mobile', 'nationalId', 'gender', 'birthDate', 'city']

export default function AdminPatients() {
  useDocTitle('مدیریت بیماران')
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [completion, setCompletion] = useState<'all' | 'complete' | 'incomplete'>('all')
  const [sortKey, setSortKey] = useState<'fullName' | 'createdAt' | 'visits' | 'age'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)

  // CSV import state
  const [importOpen, setImportOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importResult, setImportResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null)

  const { data, isFetching } = useQuery({
    queryKey: ['admin-patients', { search, completion, sortKey, sortDir, page }],
    queryFn: () => adminApi.listPatients({ search, completion, sortKey, sortDir, page, pageSize: 20 }),
    placeholderData: keepPreviousData
  })

  const importMutation = useMutation({
    mutationFn: () => {
      const mapped: ImportRow[] = parsedRows.map((row) => {
        const out: ImportRow = {}
        for (const target of TARGET_FIELDS) {
          const source = mapping[target]
          if (source && row[source]) out[target] = row[source]
        }
        return out
      })
      return adminApi.importPatients(mapped)
    },
    onSuccess: (result) => {
      setImportResult(result)
      queryClient.invalidateQueries({ queryKey: ['admin-patients'] })
      toast.success(`${toPersianDigits(result.created)} بیمار وارد شد`)
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const onSort = (key: string) => {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key as typeof sortKey)
      setSortDir('desc')
    }
    setPage(1)
  }

  const exportCsv = async () => {
    const rows = await adminApi.exportPatients()
    const csv = toCsv(
      rows.map((r) => ({
        'نام و نام خانوادگی': r.fullName,
        'کد ملی': r.nationalId,
        'موبایل': r.mobile,
        'جنسیت': GENDER[r.gender],
        'سن': r.age,
        'شهر': r.city,
        'تکمیل پرونده': `${r.completion}%`,
        'تعداد ویزیت': r.visits,
        'تاریخ عضویت': r.createdAt.slice(0, 10)
      }))
    )
    downloadCsv(`healthamed-patients-${new Date().toISOString().slice(0, 10)}.csv`, csv)
    toast.success(`${toPersianDigits(rows.length)} رکورد خروجی گرفته شد`)
  }

  const handleCsv = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setCsvFile(file)
    setImportResult(null)
    try {
      const text = await file.text()
      const rows = parseCsv(text)
      if (rows.length === 0) {
        toast.error('فایل CSV خالی یا نامعتبر است')
        return
      }
      setParsedRows(rows)
      // auto-map columns by fuzzy match
      const headers = Object.keys(rows[0])
      const auto: Record<string, string> = {}
      for (const target of TARGET_FIELDS) {
        const match = headers.find((h) =>
          h.includes(target) ||
          (target === 'fullName' && (h.includes('نام') || h.includes('name'))) ||
          (target === 'mobile' && (h.includes('موبایل') || h.includes('phone') || h.includes('mobile'))) ||
          (target === 'nationalId' && (h.includes('ملی') || h.includes('national'))) ||
          (target === 'gender' && (h.includes('جنس') || h.includes('gender'))) ||
          (target === 'birthDate' && (h.includes('تولد') || h.includes('birth'))) ||
          (target === 'city' && (h.includes('شهر') || h.includes('city')))
        )
        if (match) auto[target] = match
      }
      setMapping(auto)
      toast.success(`${toPersianDigits(rows.length)} ردیف خوانده شد — ستون‌ها را بررسی کنید`)
    } catch {
      toast.error('خواندن فایل ناموفق بود')
    }
  }

  const columns: Column<AdminPatientRow>[] = [
    {
      key: 'fullName',
      header: 'نام و نام خانوادگی',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-medium">{r.fullName}</p>
          <p className="text-[11px] text-muted-foreground" dir="ltr">{toPersianDigits(r.mobile)}</p>
        </div>
      )
    },
    {
      key: 'nationalId',
      header: 'کد ملی',
      render: (r) => <span className="tabular-nums-fa">{maskNationalId(r.nationalId)}</span>
    },
    {
      key: 'gender',
      header: 'جنسیت',
      render: (r) => GENDER[r.gender]
    },
    { key: 'age', header: 'سن', sortable: true, render: (r) => <span className="tabular-nums-fa">{toPersianDigits(r.age)}</span> },
    { key: 'city', header: 'شهر', render: (r) => r.city || '—' },
    {
      key: 'completion',
      header: 'تکمیل پرونده',
      render: (r) => (
        <Badge variant={r.completion >= 100 ? 'success' : r.completion >= 50 ? 'warning' : 'destructive'}>
          {toPersianDigits(r.completion)}٪
        </Badge>
      )
    },
    {
      key: 'visits',
      header: 'ویزیت‌ها',
      sortable: true,
      render: (r) => <span className="tabular-nums-fa">{toPersianDigits(r.visits)}</span>
    },
    {
      key: 'createdAt',
      header: 'عضویت',
      sortable: true,
      render: (r) => <span className="text-xs text-muted-foreground">{formatJalali(r.createdAt, 'short')}</span>
    }
  ]

  const previewRows = useMemo(() => parsedRows.slice(0, 5), [parsedRows])

  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت بیماران"
        description={`${toPersianDigits(data?.total ?? 0)} بیمار ثبت‌شده در سامانه`}
        icon={Users}
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              خروجی CSV
            </Button>
            <Button onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" />
              ورود گروهی
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          placeholder="جستجوی نام، موبایل یا کد ملی…"
          className="sm:w-80"
        />
        <Select value={completion} onValueChange={(v) => { setCompletion(v as typeof completion); setPage(1) }}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه پرونده‌ها</SelectItem>
            <SelectItem value="complete">تکمیل‌شده</SelectItem>
            <SelectItem value="incomplete">ناقص</SelectItem>
          </SelectContent>
        </Select>
        <span className="flex items-center gap-1 text-xs text-muted-foreground sm:ms-auto">
          <ArrowUpDown className="h-3 w-3" />
          برای مرتب‌سازی روی عنوان ستون کلیک کنید
        </span>
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        loading={isFetching && !data}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={onSort}
        emptyTitle="بیماری یافت نشد"
      />

      {data && <TablePager page={data.page} pages={data.pages} total={data.total} onChange={setPage} />}

      {/* import dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>ورود گروهی بیماران از CSV</DialogTitle>
            <DialogDescription>
              فایل CSV را بارگذاری کنید، ستون‌ها را به فیلدهای سامانه نگاشت کنید و سپس وارد کنید.
              ردیف‌های تکراری (موبایل یا کد ملی) به‌صورت خودکار رد می‌شوند.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto scroll-thin">
            {!csvFile && <FileUploader accept={{ 'text/csv': ['.csv'] }} multiple={false} onFiles={handleCsv} />}

            {csvFile && parsedRows.length > 0 && (
              <>
                <div className="flex items-center justify-between rounded-xl border p-3 text-sm">
                  <span className="truncate">{csvFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCsvFile(null)
                      setParsedRows([])
                      setImportResult(null)
                    }}
                  >
                    تغییر فایل
                  </Button>
                </div>

                {/* mapping */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {FIELD_OPTIONS.map((f) => (
                    <div key={f.value} className="space-y-1.5">
                      <p className="text-xs font-medium">{f.label}</p>
                      <Select
                        value={mapping[f.value] ?? 'none'}
                        onValueChange={(v) => setMapping((m) => ({ ...m, [f.value]: v === 'none' ? '' : v }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="— نامهم —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— بدون نگاشت —</SelectItem>
                          {Object.keys(parsedRows[0]).map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                {/* preview */}
                <div className="overflow-hidden rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        {['#', ...TARGET_FIELDS.map((f) => FIELD_OPTIONS.find((o) => o.value === f)?.label ?? f)].map((h) => (
                          <TableHead key={h} className="text-xs">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs tabular-nums-fa">{toPersianDigits(i + 1)}</TableCell>
                          {TARGET_FIELDS.map((f) => (
                            <TableCell key={f} className="text-xs">
                              {mapping[f] ? row[mapping[f]] ?? '—' : '—'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground">
                  پیش‌نمایش ۵ ردیف اول از {toPersianDigits(parsedRows.length)} ردیف
                </p>

                {importResult && (
                  <Card className={importResult.errors.length > 0 ? 'border-warning/40' : 'border-success/40'}>
                    <CardContent className="p-4 text-sm">
                      <p>
                        ✅ {toPersianDigits(importResult.created)} بیمار جدید — ⏭️ {toPersianDigits(importResult.skipped)} رد رد شد
                      </p>
                      {importResult.errors.length > 0 && (
                        <ul className="mt-2 max-h-28 space-y-0.5 overflow-y-auto text-xs text-muted-foreground scroll-thin">
                          {importResult.errors.slice(0, 10).map((e, i) => (
                            <li key={i}>• {e}</li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Button
                  className="w-full"
                  onClick={() => importMutation.mutate()}
                  disabled={!mapping.fullName || !mapping.mobile || importMutation.isPending}
                >
                  {importMutation.isPending
                    ? 'در حال وارد کردن…'
                    : `ورود ${toPersianDigits(parsedRows.length)} بیمار`}
                </Button>
                {!mapping.fullName && (
                  <p className="text-center text-xs text-destructive">
                    نگاشت «نام و نام خانوادگی» و «شماره موبایل» الزامی است
                  </p>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
