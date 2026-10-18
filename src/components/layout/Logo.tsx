// Brand logo (inline SVG, no external assets).
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('h-8 w-8', className)} aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="16" className="fill-primary" />
      <path
        d="M32 16c2.2 0 4 1.8 4 4v8h8c2.2 0 4 1.8 4 4s-1.8 4-4 4h-8v8c0 2.2-1.8 4-4 4s-4-1.8-4-4v-8h-8c-2.2 0-4-1.8-4-4s1.8-4 4-4h8v-8c0-2.2 1.8-4 4-4z"
        className="fill-white"
      />
    </svg>
  )
}

export function Logo({ className, text = true }: { className?: string; text?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      {text && (
        <span className="text-lg font-black leading-none">
          هلثامد<span className="text-primary">.</span>
        </span>
      )}
    </span>
  )
}
