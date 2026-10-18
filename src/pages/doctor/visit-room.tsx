// Doctor visit room: chat + patient summary panel + prescription writer
// with live allergy/interaction (red) warnings.
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  FileHeart,
  HeartPulse,
  Pill,
  Plus,
  Send,
  ShieldAlert,
  Trash2,
  UserRound
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ChatBubble } from '@/components/shared/chat-bubble'
import { PrescriptionCard } from '@/components/shared/prescription-card'
import { ErrorState } from '@/components/shared/states'
import { getVisitForDoctor, getMyDoctor } from '@/services/doctorService'
import { visitApi } from '@/services'
import { prescriptionService as prescriptionApi } from '@/services/prescriptionService'
import type { PrescriptionItem } from '@/types'
import { DRUGS, drugById } from '@/data/catalog'
import { formatJalali } from '@/lib/jalali'
import { toPersianDigits, toEnglishDigits } from '@/lib/persian'
import { GENDER, SEVERITY, URGENCY, VISIT_STATUS } from '@/lib/labels'
import { initialsOf } from '@/lib/utils'
import { useAutoScrollBottom, useDocTitle } from '@/hooks'

type DraftItem = {
  drugId: string
  dosage: string
  frequency: string
  durationDays: string
  instructions: string
}

const EMPTY_ITEM: DraftItem = { drugId: '', dosage: '', frequency: '', durationDays: '۷', instructions: '' }

export default function DoctorVisitRoom() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  useDocTitle('اتاق ویزیت')

  const [text, setText] = useState('')
  const [writerOpen, setWriterOpen] = useState(false)
  const [draftItems, setDraftItems] = useState<DraftItem[]>([{ ...EMPTY_ITEM }])
  const [notes, setNotes] = useState('')
  const [dangerAck, setDangerAck] = useState(false)

  const { data, error } = useQuery({ queryKey: ['doctor-visit', id], queryFn: () => getVisitForDoctor(id) })
  const { data: me } = useQuery({ queryKey: ['my-doctor'], queryFn: getMyDoctor })

  const { data: live } = useQuery({
    queryKey: ['doctor-visit-live', id],
    queryFn: () => visitApi.getMessages(id),
    refetchInterval: (q) => (q.state.data?.status === 'active' ? 3000 : false)
  })

  const messages = live?.messages ?? data?.visit.messages ?? []
  const chatRef = useAutoScrollBottom<HTMLDivElement>(messages.length)

  const sendMutation = useMutation({
    mutationFn: (msg: string) => visitApi.doctorSend(id, msg),
    onSuccess: () => {
      setText('')
      queryClient.invalidateQueries({ queryKey: ['doctor-visit-live', id] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  // build items for validation on the fly
  const itemsForValidation: PrescriptionItem[] = useMemo(
    () =>
      draftItems
        .filter((d) => d.drugId)
        .map((d) => ({
          drugId: d.drugId,
          name: drugById(d.drugId)?.name ?? '',
          dosage: d.dosage,
          frequency: d.frequency,
          durationDays: Number(toEnglishDigits(d.durationDays)) || 7,
          instructions: d.instructions || undefined
        })),
    [draftItems]
  )

  const warnings = useMemo(
    () => prescriptionApi.validate(itemsForValidation, data?.patient),
    [itemsForValidation, data?.patient]
  )
  const hasDanger = warnings.some((w) => w.level === 'danger')

  const issueMutation = useMutation({
    mutationFn: async () => {
      const items = itemsForValidation
      if (items.length === 0) throw new Error('حداقل یک دارو اضافه کنید')
      if (items.some((i) => !i.dosage || !i.frequency)) throw new Error('دوز و دفعات مصرف برای همه داروها الزامی است')
      return prescriptionApi.create(id, items, notes || undefined)
    },
    onSuccess: () => {
      toast.success('نسخه صادر شد و برای بیمار ارسال شد 💊')
      setWriterOpen(false)
      setDraftItems([{ ...EMPTY_ITEM }])
      setNotes('')
      setDangerAck(false)
      queryClient.invalidateQueries({ queryKey: ['doctor-visit', id] })
      queryClient.invalidateQueries({ queryKey: ['doctor-visit-live', id] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  if (error) return <ErrorState message="ویزیت یافت نشد." />
  if (!data || !me) return null

  const { visit, patient, prescription } = data
  const status = live?.status ?? visit.status
  const isActive = status === 'active' || status === 'waiting'

  const updateItem = (i: number, patch: Partial<DraftItem>) => {
    setDraftItems((list) => list.map((item, j) => (j === i ? { ...item, ...patch } : item)))
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      {/* chat column */}
      <div className="min-w-0 space-y-4">
        <Card className="overflow-hidden">
          {/* header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
            <div>
              <p className="font-bold">{patient.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {GENDER[patient.gender]} — {toPersianDigits(new Date().getFullYear() - new Date(patient.birthDate).getFullYear())} سال —{' '}
                «{visit.chiefComplaint}»
              </p>
            </div>
            <div className="flex items-center gap-2">
              {visit.urgency === 'urgent' && <Badge variant="destructive">{URGENCY.urgent}</Badge>}
              <Badge variant={isActive ? 'success' : 'secondary'}>{VISIT_STATUS[status]}</Badge>
            </div>
          </div>

          <div ref={chatRef} className="h-[52vh] space-y-3 overflow-y-auto bg-muted/20 p-4 scroll-thin">
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                message={m}
                peerName={patient.fullName}
                peerInitials={initialsOf(patient.fullName)}
                isOwn={m.by === 'doctor'}
              />
            ))}
          </div>

          <div className="space-y-2 border-t p-3">
            <div className="flex items-end gap-2">
              <Textarea
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (text.trim() && isActive) sendMutation.mutate(text.trim())
                  }
                }}
                placeholder="پاسخ خود را بنویسید…"
                className="max-h-32 min-h-11 flex-1 resize-none"
                disabled={!isActive}
              />
              <Button
                size="icon"
                disabled={!isActive || !text.trim() || sendMutation.isPending}
                onClick={() => sendMutation.mutate(text.trim())}
                aria-label="ارسال"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {isActive && (
              <Button variant="secondary" className="w-full" onClick={() => setWriterOpen((v) => !v)}>
                <Pill className="h-4 w-4" />
                {prescription || live?.prescriptionId ? 'نسخه صادر شده' : 'صدور نسخه الکترونیک'}
              </Button>
            )}
          </div>
        </Card>

        {/* issued prescription */}
        {(prescription || live?.prescriptionId) && prescription && (
          <PrescriptionCard prescription={prescription} doctorName={me.fullName} compact />
        )}

        {/* prescription writer */}
        {writerOpen && !prescription && (
          <Card className="border-primary/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="h-4 w-4 text-primary" />
                صدور نسخه برای {patient.fullName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.allergies.length > 0 && (
                <Alert variant="destructive" title="حساسیت‌های ثبت‌شده بیمار:">
                  <ul className="list-inside space-y-0.5">
                    {patient.allergies.map((a, i) => (
                      <li key={i}>
                        {a.substance} ({SEVERITY[a.severity]}){a.reaction ? ` — واکنش: ${a.reaction}` : ''}
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              {draftItems.map((item, i) => (
                <div key={i} className="space-y-2 rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label>داروی {toPersianDigits(i + 1)}</Label>
                    {draftItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="iconSm"
                        className="text-destructive"
                        onClick={() => setDraftItems((list) => list.filter((_, j) => j !== i))}
                        aria-label="حذف دارو"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Select
                    value={item.drugId}
                    onValueChange={(v) =>
                      updateItem(i, { drugId: v, dosage: item.dosage || drugById(v)?.strength || '' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب دارو" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {DRUGS.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} — {d.strength}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="دوز (مثلاً ۵۰۰ میلی‌گرم)"
                      value={item.dosage}
                      onChange={(e) => updateItem(i, { dosage: e.target.value })}
                    />
                    <Input
                      placeholder="دفعات (مثلاً روزی ۲ بار)"
                      value={item.frequency}
                      onChange={(e) => updateItem(i, { frequency: e.target.value })}
                    />
                    <Input
                      inputMode="numeric"
                      placeholder="مدت (روز)"
                      value={item.durationDays}
                      onChange={(e) => updateItem(i, { durationDays: e.target.value })}
                    />
                    <Input
                      placeholder="توضیح تکمیلی (اختیاری)"
                      value={item.instructions}
                      onChange={(e) => updateItem(i, { instructions: e.target.value })}
                    />
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={() => setDraftItems((l) => [...l, { ...EMPTY_ITEM }])}>
                <Plus className="h-4 w-4" />
                افزودن دارو
              </Button>

              {/* live warnings */}
              {warnings.map((w, idx) => (
                <Alert key={idx} variant={w.level === 'danger' ? 'destructive' : 'warning'}>
                  <span className="flex items-start gap-2">
                    {w.level === 'danger' ? (
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    {w.message}
                  </span>
                </Alert>
              ))}

              <div className="space-y-2">
                <Label>توصیه کلی نسخه (اختیاری)</Label>
                <Textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثلاً: در صورت تشدید علائم مراجعه حضوری…"
                />
              </div>

              {hasDanger && (
                <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-xs leading-5">
                  <input
                    type="checkbox"
                    checked={dangerAck}
                    onChange={(e) => setDangerAck(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-red-600"
                  />
                  هشدارهای قرمز (حساسیت/تداخل) را بررسی کرده‌ام و با صلاحدید حرفه‌ای خود این نسخه را صادر می‌کنم.
                </label>
              )}

              <div className="flex items-center justify-between gap-2">
                <Button variant="ghost" onClick={() => setWriterOpen(false)}>
                  انصراف
                </Button>
                <Button
                  onClick={() => issueMutation.mutate()}
                  disabled={issueMutation.isPending || itemsForValidation.length === 0 || (hasDanger && !dangerAck)}
                >
                  <Pill className="h-4 w-4" />
                  {issueMutation.isPending ? 'در حال صدور…' : 'صدور نهایی نسخه'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* patient summary panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileHeart className="h-4 w-4 text-primary" />
              خلاصه پرونده بیمار
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniStat label="گروه خونی" value={patient.bloodType ?? '—'} />
              <MiniStat label="سن" value={`${toPersianDigits(new Date().getFullYear() - new Date(patient.birthDate).getFullYear())}`} />
              <MiniStat label="شهر" value={patient.city || '—'} />
            </div>

            <div>
              <p className="mb-1.5 text-xs font-bold text-destructive">حساسیت‌ها</p>
              {patient.allergies.length > 0 ? (
                <div className="space-y-1">
                  {patient.allergies.map((a, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-destructive/5 p-2 text-xs">
                      <span>{a.substance}</span>
                      <Badge variant="destructive">{SEVERITY[a.severity]}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">ثبت نشده</p>
              )}
            </div>

            <div>
              <p className="mb-1.5 text-xs font-bold text-warning">بیماری‌های زمینه‌ای</p>
              {patient.chronicConditions.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {patient.chronicConditions.map((c, i) => (
                    <Badge key={i} variant="secondary">{c.name}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">ثبت نشده</p>
              )}
            </div>

            <div>
              <p className="mb-1.5 text-xs font-bold text-info">داروهای مصرفی</p>
              {patient.medications.length > 0 ? (
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {patient.medications.map((m, i) => (
                    <li key={i}>• {m.name} — {m.dosage}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">مصرف ندارد</p>
              )}
            </div>

            <Separator />

            <div>
              <p className="mb-1.5 text-xs font-bold">سوابق ویزیت بیمار</p>
              <p className="text-xs text-muted-foreground">
                {toPersianDigits(formatJalali(patient.createdAt, 'short'))} عضویت — تکمیل پرونده{' '}
                {toPersianDigits(patient.completion)}٪
              </p>
            </div>

            {patient.emergencyContact && (
              <p className="rounded-lg bg-muted p-2 text-xs">
                <UserRound className="ml-1 inline h-3 w-3" />
                تماس اضطراری: {patient.emergencyContact.name} ({patient.emergencyContact.relation}) —{' '}
                <span dir="ltr">{toPersianDigits(patient.emergencyContact.phone)}</span>
              </p>
            )}

            {patient.lifestyle && (
              <p className="flex items-center gap-1.5 rounded-lg bg-muted p-2 text-xs">
                <HeartPulse className="h-3.5 w-3.5 text-primary" />
                سبک زندگی: ورزش {patient.lifestyle.exercise === 'regular' ? 'منظم' : 'کم'} — خواب{' '}
                {toPersianDigits(patient.lifestyle.sleepHours ?? '—')} ساعت
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-bold tabular-nums-fa" dir="auto">{value}</p>
    </div>
  )
}
