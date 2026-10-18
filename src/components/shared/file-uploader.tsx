// Drag & drop file uploader (react-dropzone) with preview + base64 persistence hook.
import { useCallback, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { FileText, UploadCloud, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persian'
import { toast } from 'sonner'

export function FileUploader({
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'], 'application/pdf': ['.pdf'] },
  maxSizeMb = 5,
  multiple = false,
  onFiles,
  className
}: {
  accept?: Record<string, string[]>
  maxSizeMb?: number
  multiple?: boolean
  onFiles: (files: File[]) => void
  className?: string
}) {
  const [items, setItems] = useState<File[]>([])

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const r = rejections[0]
        toast.error(
          r.errors[0]?.code === 'file-too-large'
            ? `حجم فایل نباید از ${toPersianDigits(maxSizeMb)} مگابایت بیشتر باشد`
            : 'فرمت فایل پشتیبانی نمی‌شود'
        )
      }
      const next = multiple ? [...items, ...accepted] : accepted.slice(0, 1)
      setItems(next)
      onFiles(next)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, multiple, maxSizeMb]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMb * 1024 * 1024,
    multiple
  })

  const remove = (index: number) => {
    const next = items.filter((_, i) => i !== index)
    setItems(next)
    onFiles(next)
  }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50'
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className={cn('h-8 w-8', isDragActive ? 'text-primary' : 'text-muted-foreground')} />
        <p className="text-sm font-medium">
          {isDragActive ? 'فایل را همین‌جا رها کنید' : 'فایل را بکشید یا کلیک کنید'}
        </p>
        <p className="text-xs text-muted-foreground">
          فرمت‌های مجاز: تصویر یا PDF — حداکثر {toPersianDigits(maxSizeMb)} مگابایت
        </p>
      </div>
      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((file, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg border p-2 text-xs">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="shrink-0 text-muted-foreground tabular-nums-fa">
                {toPersianDigits((file.size / 1024).toFixed(0))} کیلوبایت
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="حذف فایل"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
