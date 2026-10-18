// Visit/chat service with simulated doctor auto-replies (MVP demo).
// Patient messages trigger a contextual reply after 1.6-2.8s with a typing indicator.
// Visits auto-complete after 35 minutes of inactivity.
import { latency, mutate, nextId, read, requireOnline } from './db'
import { notificationService } from './notificationService'
import { prescriptionService } from './prescriptionService'
import { useAuthStore } from '@/stores'
import type { Visit } from '@/types'

const AUTO_REPLY_DELAY = () => 1600 + Math.random() * 1200
const VISIT_TIMEOUT_MS = 35 * 60 * 1000

/** In-memory typing indicators per visit. */
const typingVisits = new Set<string>()

const GREETING_REPLIES = [
  'سلام، وقت بخیر. لطفاً دقیق‌تر بگویید علائم از چه زمانی شروع شده و آیا چیزی آن را بدتر یا بهتر می‌کند؟',
  'سلام و درود. چند سؤال می‌پرسم تا بهتر راهنمایی کنم؛ آیا تب، لرز یا سرفه هم دارید؟'
]
const PAIN_REPLIES = [
  'برای درد می‌توانم مسکن مناسبی تجویز کنم، اما ابتدا بگویید درد چه زمانی از روز شدیدتر است؟',
  'موقعیت و شدت درد برای من مهم است؛ از ۱ تا ۱۰ چه عددی به آن می‌دهید؟'
]
const FEVER_REPLIES = [
  'تب از چه زمانی شروع شده؟ آیا همراه آن گلودرد یا سرفه دارید؟ مایعات گرم مصرف کنید.',
  'دمای بدن را اندازه بگیرید و نتیجه را بگویید. در حال حاضر استراحت و مایعات فراوان توصیه می‌شود.'
]
const ALLERGY_REPLIES = [
  'ممنون از اطلاع‌رسانی. حساسیت دارویی شما را در پرونده‌تان می‌بینم و نسخه را با توجه به آن تنظیم می‌کنم.',
  'خیلی مهم است که این را گفتید؛ داروهای تجویزی با حساسیت شما تداخل نخواهند داشت.'
]
const MEDICATION_REPLIES = [
  'داروهای فعلی‌تان را با دوز مصرف برایم بنویسید تا تداخلات را بررسی کنم.',
  'آیا به جز این داروها، مکمل یا داروی گیاهی هم مصرف می‌کنید؟'
]
const CLOSING_REPLIES = [
  'با توجه به توضیحات شما، نسخه‌ای مناسب صادر می‌کنم. دستور مصرف را دقیق رعایت کنید و در صورت تشدید علائم، حتماً مراجعه حضوری داشته باشید.',
  'بر اساس شرح حال شما نگرانی جدی نمی‌بینم، اما برای اطمینان خاطر نسخه‌ای تنظیم کردم؛ در صورت ادامه علائم بیش از یک هفته دوباره تماس بگیرید.'
]
const GENERIC_REPLIES = [
  'متوجه شدم؛ لطفاً کمی بیشتر توضیح بدهید.',
  'آیا سابقه بیماری زمینه‌ای یا جراحی داشته‌اید؟',
  'آیا این مشکل قبلاً هم برایتان پیش آمده است؟',
  'رژیم غذایی و خواب شما این روزها چطور بوده؟',
  'ممنون از توضیحات؛ آیا علائم دیگری هم همراهش هست؟'
]

function pickReply(history: string[], text: string, patientMessageCount: number): string {
  const t = text || ''
  if (patientMessageCount <= 1) return GREETING_REPLIES[Math.floor(Math.random() * GREETING_REPLIES.length)]
  if (/درد|سردرد|دردرد/.test(t)) return PAIN_REPLIES[Math.floor(Math.random() * PAIN_REPLIES.length)]
  if (/تب|لرز|گرم/.test(t)) return FEVER_REPLIES[Math.floor(Math.random() * FEVER_REPLIES.length)]
  if (/حساسیت|الرژی|آلرژی/.test(t)) return ALLERGY_REPLIES[Math.floor(Math.random() * ALLERGY_REPLIES.length)]
  if (/دارو|قرص|اسپری|مصرف/.test(t)) return MEDICATION_REPLIES[Math.floor(Math.random() * MEDICATION_REPLIES.length)]
  const lastWasClosing = history.some((h) => CLOSING_REPLIES.includes(h))
  if (!lastWasClosing && patientMessageCount >= 4 && Math.random() < 0.35) {
    return CLOSING_REPLIES[Math.floor(Math.random() * CLOSING_REPLIES.length)]
  }
  return GENERIC_REPLIES[Math.floor(Math.random() * GENERIC_REPLIES.length)]
}

/** Lazily close stale visits (35+ min without messages). */
function sweepStaleVisits(): void {
  const now = Date.now()
  mutate((db) => {
    for (const v of db.visits) {
      if (v.status === 'active' || v.status === 'waiting') {
        const last = v.messages[v.messages.length - 1]
        const lastAt = last ? new Date(last.at).getTime() : new Date(v.startedAt).getTime()
        if (now - lastAt > VISIT_TIMEOUT_MS) {
          v.status = 'completed'
          v.endedAt = new Date().toISOString()
        }
      }
    }
  }, 'پایان ویزیت‌های بی‌فعالیت')
}

function currentUserId(): string {
  const id = useAuthStore.getState().userId
  if (!id) throw new Error('وارد نشده‌اید')
  return id
}

export const visitService = {
  isTyping(visitId: string): boolean {
    return typingVisits.has(visitId)
  },

  /** Patient sends a message; schedules the simulated doctor reply. */
  async patientSend(visitId: string, text: string): Promise<Visit> {
    requireOnline('ارسال پیام')
    const userId = currentUserId()
    const visit = mutate((db) => {
      const v = db.visits.find((x) => x.id === visitId)
      if (!v) throw new Error('ویزیت یافت نشد')
      const patient = db.patients.find((p) => p.userId === userId)
      if (!patient || v.patientId !== patient.id) throw new Error('دسترسی غیرمجاز')
      v.status = v.status === 'waiting' ? 'active' : v.status
      v.messages.push({ id: nextId('msg_'), by: 'patient', text, at: new Date().toISOString() })
      return v
    }, 'ارسال پیام')

    // schedule simulated doctor reply
    typingVisits.add(visitId)
    const patientMsgCount = visit.messages.filter((m) => m.by === 'patient').length
    const replyText = pickReply(
      visit.messages.filter((m) => m.by === 'doctor').map((m) => m.text),
      text,
      patientMsgCount
    )
    setTimeout(() => {
      typingVisits.delete(visitId)
      mutate((db) => {
        const v = db.visits.find((x) => x.id === visitId)
        if (!v || v.status === 'cancelled') return
        v.messages.push({ id: nextId('msg_'), by: 'doctor', text: replyText, at: new Date().toISOString() })
      }, 'پاسخ پزشک')
    }, AUTO_REPLY_DELAY())
    return visit
  },

  /** Doctor sends a reply manually. */
  async doctorSend(visitId: string, text: string): Promise<Visit> {
    requireOnline('ارسال پیام')
    const userId = currentUserId()
    return mutate((db) => {
      const v = db.visits.find((x) => x.id === visitId)
      if (!v) throw new Error('ویزیت یافت نشد')
      const doctor = db.doctors.find((d) => d.userId === userId)
      if (!doctor || v.doctorId !== doctor.id) throw new Error('دسترسی غیرمجاز')
      v.status = 'active'
      v.messages.push({ id: nextId('msg_'), by: 'doctor', text, at: new Date().toISOString() })
      const patient = db.patients.find((p) => p.id === v.patientId)
      if (patient) {
        notificationService.notify(patient.userId, {
          title: 'پاسخ پزشک',
          body: `${doctor.fullName}: ${text.slice(0, 80)}`,
          kind: 'visit',
          link: `/app/visits/${v.id}`
        })
      }
      return v
    }, 'ارسال پیام')
  },

  /** Poll messages for live chat view. */
  async getMessages(visitId: string): Promise<{ messages: Visit['messages']; typing: boolean; status: Visit['status']; prescriptionId?: string }> {
    sweepStaleVisits()
    const v = read((db) => db.visits.find((x) => x.id === visitId))
    if (!v) throw new Error('ویزیت یافت نشد')
    return { messages: v.messages, typing: typingVisits.has(visitId), status: v.status, prescriptionId: v.prescriptionId }
  },

  async endVisit(visitId: string, by: 'patient' | 'doctor'): Promise<void> {
    requireOnline('پایان ویزیت')
    const userId = currentUserId()
    mutate((db) => {
      const v = db.visits.find((x) => x.id === visitId)
      if (!v) throw new Error('ویزیت یافت نشد')
      if (by === 'patient') {
        const patient = db.patients.find((p) => p.userId === userId)
        if (!patient || v.patientId !== patient.id) throw new Error('دسترسی غیرمجاز')
      } else {
        const doctor = db.doctors.find((d) => d.userId === userId)
        if (!doctor || v.doctorId !== doctor.id) throw new Error('دسترسی غیرمجاز')
      }
      v.status = 'completed'
      v.endedAt = new Date().toISOString()
    }, 'پایان ویزیت')
  },

  async cancelVisit(visitId: string): Promise<void> {
    requireOnline('لغو ویزیت')
    const userId = currentUserId()
    mutate((db) => {
      const v = db.visits.find((x) => x.id === visitId)
      if (!v) throw new Error('ویزیت یافت نشد')
      const patient = db.patients.find((p) => p.userId === userId)
      const doctor = db.doctors.find((d) => d.userId === userId)
      const isPatient = patient && v.patientId === patient.id
      const isDoctor = doctor && v.doctorId === doctor.id
      if (!isPatient && !isDoctor) throw new Error('دسترسی غیرمجاز')
      v.status = 'cancelled'
      v.endedAt = new Date().toISOString()
    }, 'لغو ویزیت')
  },

  /** Issue prescription through the doctor flow (also completes the visit). */
  async issuePrescriptionAndComplete(
    visitId: string,
    items: Parameters<typeof prescriptionService.create>[1],
    notes?: string
  ) {
    return prescriptionService.create(visitId, items, notes)
  }
}
