// Visit room (patient side): live chat + prescription + rating.
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, CheckCircle2, Send, Star, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ChatBubble, TypingBubble } from '@/components/shared/chat-bubble'
import { PrescriptionCard } from '@/components/shared/prescription-card'
import { RatingInput } from '@/components/shared/rating-stars'
import { ErrorState } from '@/components/shared/states'
import { Skeleton } from '@/components/ui/skeleton'
import { getVisit, rateVisit } from '@/services/patientService'
import { visitApi } from '@/services'
import { specialtyName } from '@/data/catalog'
import { formatJalali } from '@/lib/jalali'
import { VISIT_STATUS } from '@/lib/labels'
import { initialsOf } from '@/lib/utils'
import { useAutoScrollBottom, useDocTitle, useOnline } from '@/hooks'
import { useNavigate } from 'react-router-dom'

export default function VisitDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const online = useOnline()
  useDocTitle('گفتگو با پزشک')

  const [text, setText] = useState('')
  const [rating, setRating] = useState(0)

  const { data: visit, error } = useQuery({ queryKey: ['visit', id], queryFn: () => getVisit(id) })

  const { data: live } = useQuery({
    queryKey: ['visit-live', id],
    queryFn: () => visitApi.getMessages(id),
    refetchInterval: (query) =>
      query.state.data?.status === 'active' || query.state.data?.typing ? 2500 : false
  })

  const messages = live?.messages ?? visit?.messages ?? []
  const typing = live?.typing ?? false
  const chatRef = useAutoScrollBottom<HTMLDivElement>(`${messages.length}-${typing}`)

  const sendMutation = useMutation({
    mutationFn: (msg: string) => visitApi.patientSend(id, msg),
    onSuccess: () => {
      setText('')
      queryClient.invalidateQueries({ queryKey: ['visit-live', id] })
      queryClient.invalidateQueries({ queryKey: ['my-visits'] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const rateMutation = useMutation({
    mutationFn: () => rateVisit(id, rating),
    onSuccess: () => {
      toast.success('امتیاز شما ثبت شد؛ سپاس از بازخوردتان 🌿')
      queryClient.invalidateQueries({ queryKey: ['visit', id] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const endMutation = useMutation({
    mutationFn: () => visitApi.endVisit(id, 'patient'),
    onSuccess: () => {
      toast.success('ویزیت پایان یافت')
      queryClient.invalidateQueries({ queryKey: ['visit-live', id] })
      queryClient.invalidateQueries({ queryKey: ['visit', id] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const rx = live?.prescriptionId ?? visit?.prescriptionId
  const { data: rxData } = useQuery({
    queryKey: ['visit-rx', id],
    queryFn: () => import('@/services/prescriptionService').then((m) => m.prescriptionService.getByVisit(id)),
    enabled: !!rx
  })

  if (error) return <ErrorState message="ویزیت یافت نشد." />
  if (!visit) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  const status = live?.status ?? visit.status
  const isActive = status === 'active' || status === 'waiting'

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/app/visits">
          <ArrowRight className="h-4 w-4" />
          بازگشت به ویزیت‌ها
        </Link>
      </Button>

      {/* doctor header */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Avatar className="h-12 w-12 border">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initialsOf(visit.doctorName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{visit.doctorName}</p>
            <p className="text-xs text-muted-foreground">{specialtyName(visit.doctorSpecialty)}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant={isActive ? 'success' : status === 'completed' ? 'secondary' : 'destructive'}>
              {VISIT_STATUS[status]}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{formatJalali(visit.startedAt, 'medium')}</span>
          </div>
        </CardContent>
      </Card>

      {/* chat area */}
      <Card className="overflow-hidden">
        <div ref={chatRef} className="h-[55vh] space-y-3 overflow-y-auto bg-muted/20 p-4 scroll-thin">
          <div className="mx-auto max-w-md rounded-xl border border-dashed p-3 text-center text-xs leading-6 text-muted-foreground">
            <Stethoscope className="mx-auto mb-1 h-4 w-4 text-primary" />
            موضوع گفتگو: «{visit.chiefComplaint}» — پزشک شما پس از بررسی پرونده پاسخ می‌دهد.
          </div>
          {messages.map((m) => (
            <ChatBubble
              key={m.id}
              message={m}
              peerName={`دکتر ${visit.doctorName}`}
              peerInitials={initialsOf(visit.doctorName)}
              isOwn={m.by === 'patient'}
            />
          ))}
          {typing && (
            <TypingBubble peerName={`دکتر ${visit.doctorName}`} peerInitials={initialsOf(visit.doctorName)} />
          )}
        </div>

        {/* composer */}
        <div className="border-t bg-background p-3">
          {isActive ? (
            <div className="flex items-end gap-2">
              <Textarea
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (text.trim()) sendMutation.mutate(text.trim())
                  }
                }}
                placeholder={online ? 'پیام خود را بنویسید… (Enter برای ارسال)' : 'برای ارسال پیام به اینترنت نیاز دارید'}
                className="max-h-32 min-h-11 flex-1 resize-none"
                disabled={!online}
              />
              <Button
                size="icon"
                disabled={!online || !text.trim() || sendMutation.isPending}
                onClick={() => sendMutation.mutate(text.trim())}
                aria-label="ارسال"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              این گفتگو پایان یافته است.
            </div>
          )}
          {isActive && (
            <div className="mt-2 text-left">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => endMutation.mutate()}
                disabled={endMutation.isPending}
              >
                پایان گفتگو
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* prescription */}
      {rxData && (
        <PrescriptionCard
          prescription={rxData}
          doctorName={visit.doctorName}
          onOrder={() => navigate('/app/pharmacies')}
        />
      )}

      {/* rating */}
      {status === 'completed' && !visit.patientRating && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6">
            <p className="flex items-center gap-2 font-semibold">
              <Star className="h-4 w-4 fill-warning text-warning" />
              از مشاوره خود چه فکر می‌کنید؟
            </p>
            <RatingInput value={rating} onChange={setRating} />
            <Button size="sm" disabled={rating === 0 || rateMutation.isPending} onClick={() => rateMutation.mutate()}>
              ثبت امتیاز
            </Button>
          </CardContent>
        </Card>
      )}

      {visit.patientRating && (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-warning text-warning" />
            امتیاز ثبت‌شده شما: {visit.patientRating} از ۵
          </CardContent>
        </Card>
      )}
    </div>
  )
}
