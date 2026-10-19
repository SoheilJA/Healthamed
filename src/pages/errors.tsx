// Error pages: 404, 403, offline.
import { Link, useNavigate } from 'react-router-dom'
import { CloudOff, Home, RotateCcw, ShieldX, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/layout/Logo'
import { toPersianDigits } from '@/lib/persian'

function ErrorShell({
  icon: Icon,
  code,
  title,
  body
}: {
  icon: React.ComponentType<{ className?: string }>
  code: string
  title: string
  body: string
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Logo />
          <Icon className="h-14 w-14 text-primary" />
          <p className="text-4xl font-black text-primary tabular-nums-fa">{toPersianDigits(code)}</p>
          <h1 className="text-lg font-bold">{title}</h1>
          <p className="text-sm leading-7 text-muted-foreground">{body}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <ErrorShell
      icon={SearchX}
      code="404"
      title="صفحه‌ای که دنبالش بودید پیدا نشد"
      body="ممکن است آدرس تغییر کرده باشد یا صفحه حذف شده باشد. از دکمه‌های زیر استفاده کنید."
    />
  )
}

export function ForbiddenPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Logo />
          <ShieldX className="h-14 w-14 text-destructive" />
          <p className="text-4xl font-black text-destructive tabular-nums-fa">{toPersianDigits('403')}</p>
          <h1 className="text-lg font-bold">دسترسی غیرمجاز</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            شما اجازه دسترسی به این بخش را ندارید. اگر فکر می‌کنید خطایی رخ داده، با پشتیبانی تماس بگیرید.
          </p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <RotateCcw className="h-4 w-4" />
            بازگشت
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function OfflinePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Logo />
          <CloudOff className="h-14 w-14 text-warning" />
          <h1 className="text-lg font-bold">اتصال اینترنت قطع است</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            نگران نباشید! کارت اضطراری پزشکی و نسخه‌های فعال شما به‌صورت آفلاین ذخیره شده‌اند و بدون اینترنت در
            دسترس هستند.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline">
              <Link to="/app/emergency-card">
                <Home className="h-4 w-4" />
                کارت اضطراری آفلاین
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RotateCcw className="h-4 w-4" />
              تلاش مجدد
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
