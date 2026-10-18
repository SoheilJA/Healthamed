import { useCallback } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { FileText, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn, formatBytes } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persian'
import { DOC_CATEGORY } from '@/lib/labels'
import type { MedicalDocument } from '@/types'

interface FileUploaderProps {
  onFiles: (files: File[]) => void
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSizeMb?: number
  hint?: string
  className?: string
}

export function FileUploader({ onFiles, accept, maxFiles = 5, maxSizeMb = 10, hint, className }: FileUploaderProps) {
  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length) {
        toast.error(`بعضی فایل‌ها رد شدند (حداکثر ${toPersianDigits(maxSizeMb)} مگابایت و ${toPersianDigits(maxFiles)} فایل)`)
      }
      if (accepted.length) onFiles(accepted)
    },
    [onFiles, maxSizeMb, maxFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize: maxSizeMb * 1024 * 1024
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
        className
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto size-8 text-muted-foreground" aria-hidden />
      <p className="mt-2 text-sm font-medium">فایل را بکشید و رها کنید یا برای انتخاب کلیک کنید</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {hint ?? `حداکثر ${toPersianDigits(maxFiles)} فایل، هر کدام تا ${toPersianDigits(maxSizeMb)} مگابایت`}
      </p>
    </div>
  )
}

interface DocumentRowsProps {
  docs: MedicalDocument[]
  onDelete: (id: string) => void
}

export function DocumentRows({ docs, onDelete }: DocumentRowsProps) {
  if (docs.length === 0) return null
  return (
    <ul className="space-y-2">
      {docs.map((doc) => (
        <li key={doc.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {doc.mime.startsWith('image/') ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{doc.name}</p>
            <p className="text-xs text-muted-foreground">
              {DOC_CATEGORY[doc.category]} • {toPersianDigits(doc.date)} • {formatBytes(doc.size)}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onDelete(doc.id)} aria-label={`حذف ${doc.name}`}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </li>
      ))}
    </ul>
  )
}