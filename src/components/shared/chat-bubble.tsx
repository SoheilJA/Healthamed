// Chat bubble + typing indicator.
import { Check, CheckCheck } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/jalali'
import type { ChatMessage } from '@/types'

export function ChatBubble({
  message,
  peerName,
  peerInitials,
  isOwn
}: {
  message: ChatMessage
  peerName: string
  peerInitials: string
  isOwn: boolean
}) {
  return (
    <div className={cn('flex items-end gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {!isOwn && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback className="bg-primary/10 text-xs text-primary">{peerInitials}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'group relative max-w-[78%] rounded-2xl px-3.5 py-2 shadow-sm sm:max-w-md',
          isOwn
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : 'rounded-bl-md border bg-card text-card-foreground'
        )}
      >
        {!isOwn && <p className="mb-0.5 text-[11px] font-medium text-primary">{peerName}</p>}
        <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>
        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-[10px] tabular-nums-fa',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {formatTime(message.at)}
          {isOwn && <CheckCheck className="h-3 w-3" />}
        </div>
      </div>
    </div>
  )
}

export function TypingBubble({ peerName, peerInitials }: { peerName: string; peerInitials: string }) {
  return (
    <div className="flex items-end gap-2">
      <Avatar className="h-8 w-8 border">
        <AvatarFallback className="bg-primary/10 text-xs text-primary">{peerInitials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1 rounded-2xl rounded-bl-md border bg-card px-4 py-3 shadow-sm">
        <span className="text-[11px] font-medium text-primary">{peerName}</span>
        <div className="flex items-center gap-1" dir="ltr">
          <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-muted-foreground" />
          <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-muted-foreground [animation-delay:0.15s]" />
          <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-muted-foreground [animation-delay:0.3s]" />
        </div>
      </div>
    </div>
  )
}

export { Check }
