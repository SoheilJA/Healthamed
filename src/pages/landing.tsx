// Landing page: hero, features, how-it-works, roles, CTA.
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  FileHeart,
  HeartPulse,
  MessageCircle,
  Pill,
  ShieldCheck,
  Stethoscope,
  WifiOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/layout/logo'
import { ThemeToggle } from '@/components/layout/header-widgets'
import { useAuthStore } from '@/stores'
import { toPersianDigits } from '@/lib/persian'

const FEATURES = [
  {
    icon: Stethoscope,
    title: 'مشاوره تخصصی آنلاین',
    body: 'از میان پزشکان متخصص ۱۶ تخصص مختلف انتخاب کنید و همان روز نوبت بگیرید؛ بدون معطلی در نوبت حضوری.'
  },
  {
    icon: MessageCircle,
    title: 'گفتگوی متنی با پزشک',
    body: 'شرح علائم خود را بنویسید و پاسخ بگیرید؛ پزشک پرونده پزشکی شما را می‌بیند و دقیق‌تر راهنمایی می‌کند.'
  },
  {
    icon: Pill,
    title: 'نسخه الکترونیک با کد پیگیری',
    body: 'نسخه شما با کد پیگیری معتبر صادر می‌شود؛ با کد ملی و کد پیگیری می‌توانید از هر داروخانه دارو بگیرید.'
  },
  {
    icon: FileHeart,
    title: 'کارت اضطراری آفلاین',
    body: 'گروه خونی، حساسیت‌ها و داروهای شما همیشه در دسترس است؛ حتی بدون اینترنت در شرایط اضطراری.'
  },
  {
    icon: Building2,
    title: 'داروخانه‌های همکار',
    body: 'سفارش دارو از داروخانه‌های معتبر همکار با تحویل درب منزل یا تحویل حضوری.'
  },
  {
    icon: ShieldCheck,
    title: 'حریم خصوصی محفوظ',
    body: 'اطلاعات پزشکی شما فقط در اختیار پزشک معالج قرار می‌گیرد و به صورت رمزنگاری‌شده نگهداری می‌شود.'
  }
]

const STEPS = [
  { n: 1, title: 'ثبت‌نام و تکمیل پرونده', body: 'در کمتر از ۵ دقیقه ثبت‌نام کنید و پرونده پزشکی خود را در ۸ گام ساده تکمیل کنید.' },
  { n: 2, title: 'انتخاب پزشک و نوبت', body: 'بر اساس تخصص، شهر و امتیاز، پزشک مناسب را انتخاب و از نوبت‌های آزاد رزرو کنید.' },
  { n: 3, title: 'گفتگو و دریافت نسخه', body: 'گفتگوی متنی انجام می‌شود، نسخه با کد پیگیری صادر می‌شود و به‌طور خودکار در پرونده شما ثبت می‌گردد.' },
  { n: 4, title: 'دریافت دارو', body: 'یا از داروخانه‌های همکار سفارش دهید، یا فقط کد پیگیری را ببرید و از هر داروخانه دارو بگیرید.' }
]

export default function LandingPage() {
  const isLoggedIn = !!useAuthStore((s) => s.userId)

  return (
    <div className="min-h-dvh">
      {/* header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/login">ورود</Link>
            </Button>
            <Button asChild>
              <Link to={isLoggedIn ? (useAuthStore.getState().userId ? '/app' : '/register') : '/register'}>
                {isLoggedIn ? 'ورود به پنل' : 'ثبت‌نام رایگان'}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(157_95%_34%/0.12),transparent)]" />
        <div className="container grid items-center gap-10 py-14 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
              <HeartPulse className="h-3.5 w-3.5" />
              پلتفرم سلامت دیجیتال هلثامد
            </Badge>
            <h1 className="text-3xl font-black leading-[1.35] sm:text-4xl md:text-5xl md:leading-[1.3]">
              سلامتی شما،
              <br />
              <span className="text-primary">همراه دیجیتال</span> شماست
            </h1>
            <p className="max-w-lg text-base leading-8 text-muted-foreground">
              هلثامد سلامت شما را با مشاوره آنلاین پزشکان، نسخه الکترونیک معتبر با کد پیگیری و کارت اضطراری آفلاین،
              ساده و در دسترس می‌کند. پرونده پزشکی خود را یک بار بسازید و همیشه همراه داشته باشید.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/register">
                  شروع کنید
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">ورود به حساب</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <WifiOff className="h-3.5 w-3.5 text-primary" />
                کارت اضطراری آفلاین
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5 text-primary" />
                نسخه معتبر در تمام داروخانه‌ها
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                نوبت همان روز
              </span>
            </div>
          </div>

          {/* hero mock card */}
          <div className="relative mx-auto w-full max-w-md" dir="rtl">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-l from-primary/20 to-info/10 blur-2xl" />
            <Card className="animate-fade-in border-2 border-primary/20 shadow-xl">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">دکتر امیر حسینی</p>
                      <p className="text-xs text-muted-foreground">متخصص داخلی — ۱۲ سال سابقه</p>
                    </div>
                  </div>
                  <Badge variant="success">آنلاین</Badge>
                </div>
                <div className="space-y-2 rounded-2xl rounded-bl-md border bg-muted/40 p-3 text-sm">
                  <p className="text-[11px] font-medium text-primary">دکتر امیر حسینی</p>
                  <p className="leading-6">سلام، وقت بخیر. علائم از چه زمانی شروع شده؟ آیا تب هم دارید؟</p>
                </div>
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-br-md bg-primary p-3 text-sm text-primary-foreground">
                    از دیشب شروع شده، تب ندارم ولی سردرد خیلی شدید است.
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">کد پیگیری نسخه</p>
                    <p className="font-mono font-bold text-primary" dir="ltr">HA-1403-482913</p>
                  </div>
                  <Pill className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">همه آنچه برای سلامتی نیاز دارید</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              از مشاوره تا نسخه و دارو — همه در یک پلتفرم فارسی و راست‌به‌چپ
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="transition-all hover:-translate-y-1 hover:shadow-md">
                <CardContent className="space-y-3 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* steps */}
      <section className="py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">در {toPersianDigits(4)} گام ساده</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl border bg-card p-6">
                <span className="absolute -top-4 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground tabular-nums-fa shadow">
                  {toPersianDigits(s.n)}
                </span>
                <h3 className="mb-2 mt-2 font-bold">{s.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* roles CTA */}
      <section className="pb-16">
        <div className="container grid gap-4 md:grid-cols-2">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="space-y-3 p-8">
              <Stethoscope className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-bold">پزشک هستید؟</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                به شبکه پزشکان هلثامد بپیوندید؛ بیماران خود را آنلاین بپذیرید، برنامه هفتگی‌تان را مدیریت کنید و نسخه
                الکترونیک صادر کنید.
              </p>
              <Button asChild variant="outline" className="mt-2">
                <Link to="/register/doctor">ثبت‌نام پزشک</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-info/30 bg-info/5">
            <CardContent className="space-y-3 p-8">
              <FileHeart className="h-8 w-8 text-info" />
              <h3 className="text-lg font-bold">مراقب سلامت خود هستید؟</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                پرونده پزشکی خانواده را مدیریت کنید، برای اعضای خانواده نوبت بگیرید و کارت اضطراری داشته باشید.
              </p>
              <Button asChild className="mt-2">
                <Link to="/register">ساخت پرونده پزشکی</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>© {toPersianDigits(1403)} هلثامد — نمونه نمایشی MVP</p>
          <Link to="/design-system" className="hover:text-foreground">
            سیستم طراحی
          </Link>
        </div>
      </footer>
    </div>
  )
}
