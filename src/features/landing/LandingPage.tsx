import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck,
  ClipboardList,
  FileHeart,
  MessagesSquare,
  Pill,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  Siren,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/layout/Logo";
import { SPECIALTIES } from "@/data/catalog";
import { SPECIALTY_ICONS } from "@/lib/icons";
import { toPersianDigits } from "@/lib/persian";
import { usePageTitle } from "@/hooks";

const STEPS = [
  {
    icon: ClipboardList,
    title: "۱. تکمیل پرونده پزشکی",
    text: "اطلاعات سلامت، سابقه بیماری‌ها، داروها و آلرژی‌های خود را یک بار برای همیشه ثبت کنید و مدارک پزشکی را بارگذاری کنید.",
  },
  {
    icon: Stethoscope,
    title: "۲. انتخاب پزشک",
    text: "از بین پزشکان متخصص در تخصص‌های مختلف، بر اساس امتیاز، قیمت و نزدیک‌ترین نوبت خالی، پزشک مناسب خود را انتخاب کنید.",
  },
  {
    icon: MessagesSquare,
    title: "۳. ویزیت آنلاین",
    text: "در زمان نوبت، با گفتگوی متنی با پزشک خود مشاوره بگیرید و مدارک خود را در چت ارسال کنید.",
  },
  {
    icon: FileHeart,
    title: "۴. نسخه و کد پیگیری",
    text: "نسخه پزشک به‌صورت الکترونیک صادر و به پرونده شما اضافه می‌شود؛ با کد پیگیری از هر داروخانه‌ای دارو بخرید یا از داروخانه‌های ما سفارش دهید.",
  },
];

const FEATURES = [
  {
    icon: ClipboardList,
    title: "پرونده پزشکی جامع",
    text: "تمام سوابق پزشکی شما در یک جای امن و همیشه در دسترس.",
  },
  {
    icon: Siren,
    title: "کارت اورژانس آفلاین",
    text: "گروه خونی، آلرژی‌ها و داروهای شما حتی بدون اینترنت در دسترس امدادگران.",
  },
  {
    icon: CalendarCheck,
    title: "رزرو نوبت آنلاین",
    text: "تقویم شمسی با ساعت‌های خالی واقعی پزشکان.",
  },
  {
    icon: Pill,
    title: "نسخه الکترونیک",
    text: "هر نسخه یک کد پیگیری معتبر دارد که به کد ملی شما متصل است.",
  },
  {
    icon: ShieldCheck,
    title: "حریم خصوصی",
    text: "اطلاعات پزشکی شما فقط با رضایت شما در اختیار پزشک معالج قرار می‌گیرد.",
  },
  {
    icon: Smartphone,
    title: "نصب روی گوشی (PWA)",
    text: "هلثامد را مثل یک اپلیکیشن روی گوشی خود نصب کنید.",
  },
];

export default function LandingPage() {
  usePageTitle();
  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link to="/signup/doctor">
                <UserPlus /> ثبت‌نام پزشک
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/login">ورود / ثبت‌نام</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 start-1/2 size-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-24">
          <div className="text-center md:text-start">
            <Badge variant="success" className="mb-4">
              نسخه نمایشی MVP — داده‌ها آزمایشی هستند
            </Badge>
            <h1 className="text-3xl font-black leading-tight md:text-5xl md:leading-tight">
              سلامتی شما،{" "}
              <span className="text-primary">منظم و همیشه همراه</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-8 text-muted-foreground md:mx-0">
              هلثامد پلتفرم سلامت دیجیتال است: پرونده پزشکی جامع، ویزیت آنلاین
              با پزشک، نسخه الکترونیک با کد پیگیری و کارت اورژانس که حتی بدون
              اینترنت جان شما را نجات می‌دهد.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/signup">
                  شروع کنید <ArrowLeft />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link to="/login">ورود به حساب</Link>
              </Button>
            </div>
          </div>

          {/* Local SVG illustration (no external assets) */}
          <div className="hidden justify-center md:flex" aria-hidden>
            <svg width="360" height="300" viewBox="0 0 360 300" fill="none">
              <rect
                x="60"
                y="30"
                width="240"
                height="240"
                rx="28"
                fill="hsl(157 55% 94%)"
              />
              <rect
                x="90"
                y="60"
                width="180"
                height="180"
                rx="20"
                fill="white"
                stroke="hsl(157 95% 34% / 0.15)"
              />
              <path
                d="M110 150 h40 l14 -34 l20 68 l16 -34 h50"
                stroke="#04AB6C"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <rect
                x="228"
                y="196"
                width="20"
                height="56"
                rx="8"
                fill="#04AB6C"
              />
              <path
                d="M236 208 h4 v32 h-4 z M222 224 v4 h32 v-4 z"
                fill="white"
              />
              <circle cx="270" cy="70" r="26" fill="#04AB6C" opacity="0.12" />
              <path
                d="M262 70 h16 M270 62 v16"
                stroke="#04AB6C"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="96" cy="212" r="18" fill="#04AB6C" opacity="0.1" />
              <path
                d="M89 212 h14 M96 205 v14"
                stroke="#04AB6C"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold">
            هلثامد چطور کار می‌کند؟
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            در چهار قدم ساده، از مشاوره تا دارو
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <Card
                key={step.title}
                className="border-2 transition-colors hover:border-primary/40"
              >
                <CardContent className="p-5 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <step.icon className="size-6" />
                  </div>
                  <h3 className="mt-3 font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold">چرا هلثامد؟</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-3 rounded-xl border p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {f.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="border-t bg-muted/30 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold">تخصص‌های موجود</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            از پزشک عمومی تا تخصص‌های نادر
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SPECIALTIES.slice(0, 12).map((spec) => {
              const Icon = SPECIALTY_ICONS[spec.icon];
              return (
                <Link
                  key={spec.id}
                  to="/login"
                  className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-colors hover:border-primary/50 hover:bg-accent"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {Icon ? (
                      <Icon className="size-6" />
                    ) : (
                      <Stethoscope className="size-6" />
                    )}
                  </span>
                  <span className="text-sm font-semibold">{spec.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-primary py-12 text-primary-foreground">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 text-center md:grid-cols-4">
          {[
            { value: "۱۲,۵۰۰+", label: "بیمار ثبت‌نام‌شده" },
            { value: "۴۸۰+", label: "پزشک متخصص" },
            { value: "۹۶٪", label: "رضایت بیماران" },
            { value: "۲۴/۷", label: "دسترسی به پرونده" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black">{s.value}</p>
              <p className="mt-1 text-sm opacity-90">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold">
            همین حالا پرونده پزشکی خود را بسازید
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            ثبت‌نام کمتر از دو دقیقه طول می‌کشد. پزشکان نیز می‌توانند درخواست
            joining ثبت کنند و پس از تایید، ویزیت آنلاین برگزار کنند.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/signup">
                <UserPlus /> ثبت‌نام بیمار
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/signup/doctor">
                <Stethoscope /> ثبت‌نام پزشک
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            نسخه نمایشی: برای ورود سریع، در صفحه ورود از دکمه‌های «ورود سریع
            نمایشی» استفاده کنید (کد تایید: {toPersianDigits("12345")}).
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
              هلثامد، پلتفرم سلامت دیجیتال با تمرکز بر پرونده پزشکی جامع، ویزیت
              آنلاین و نسخه الکترونیک.
            </p>
          </div>
          <div>
            <h3 className="font-bold">دسترسی سریع</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/login" className="hover:text-primary">
                  ورود
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-primary">
                  ثبت‌نام بیمار
                </Link>
              </li>
              <li>
                <Link to="/signup/doctor" className="hover:text-primary">
                  ثبت‌نام پزشک
                </Link>
              </li>
              <li>
                <Link to="/design-system" className="hover:text-primary">
                  سیستم طراحی (توسعه‌دهندگان)
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">پشتیبانی</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>پشتیبانی: {toPersianDigits("021-91000000")}</li>
              <li>همه‌روزه، ۹ صبح تا ۹ شب</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t px-4 pt-6 text-center text-xs text-muted-foreground">
          © {toPersianDigits(1404)} هلثامد — تمامی حقوق محفوظ است. این یک نسخه
          نمایشی است و اطلاعات واقعی پزشکی جایگزین مراجعه به پزشک نمی‌شود.
        </div>
      </footer>
    </div>
  );
}
