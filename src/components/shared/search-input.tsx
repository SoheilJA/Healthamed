// Debounced search input.
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/hooks'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function SearchInput({
  value,
  onChange,
  placeholder = 'جستجو…',
  className,
  debounce = 350
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  debounce?: number
}) {
  const [local, setLocal] = useState(value)
  const debounced = useDebouncedValue(local, debounce)

  useEffect(() => {
    onChange(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <div className={cn('relative w-full sm:w-72', className)}>
      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pr-9 pl-8"
      />
      {local && (
        <button
          type="button"
          onClick={() => {
            setLocal('')
            onChange('')
          }}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="پاک کردن"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
