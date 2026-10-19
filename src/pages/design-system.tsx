// Mini storybook: /design-system (dev showcase of the design system).
import { useState } from 'react'
import { ArrowLeftRight, Moon, Palette, Sun } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { RatingStars } from '@/components/shared/rating-stars'
import { EmptyState, StatCard } from '@/components/shared/states'
import { Stepper } from '@/components/shared/Stepper'
import { JalaliDatePicker } from '@/components/shared/jalali-date-picker'
import { Logo } from '@/components/layout/Logo'
import { useTheme } from '@/components/layout/theme-provider'
import { formatJalali } from '@/lib/jalali'
import { toPersianDigits } from '@/lib/persian'
import { useDocTitle } from '@/hooks'

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">{children}</CardContent>
    </Card>
  )
}

export default function DesignSystemPage() {
  useDocTitle('سیستم طراحی')
  const { resolved, setTheme } = useTheme()
  const [step, setStep] = useState(1)
  const [date, setDate] = useState('')

  return (
    <div className="container max-w-5xl space-y-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Palette className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-black">سیستم طراحی هلثامد</h1>
            <p className="text-sm text-muted-foreground">
              فونت وزیرمتن — رنگ برند #04AB6C — کاملاً راست‌به‌چپ — تاریخ {formatJalali(new Date(), 'full')}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}>
          {resolved === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          تم {resolved === 'dark' ? 'روشن' : 'تاریک'}
        </Button>
      </div>

      <Section title="برند" description="لوگو و رنگ اصلی">
        <Logo className="text-2xl" />
        <div className="flex gap-2">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <div className={`h-10 w-10 rounded-lg bg-brand-${s}`} />
              <span className="text-[10px] text-muted-foreground tabular-nums-fa">{toPersianDigits(s)}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="دکمه‌ها">
        <Button>اصلی</Button>
        <Button variant="secondary">ثانویه</Button>
        <Button variant="outline">خطی</Button>
        <Button variant="ghost">شفاف</Button>
        <Button variant="destructive">مخرب</Button>
        <Button variant="success">موفق</Button>
        <Button size="sm">کوچک</Button>
        <Button size="lg">بزرگ</Button>
        <Button disabled>غیرفعال</Button>
      </Section>

      <Section title="نشان‌ها (Badge)">
        <Badge>اصلی</Badge>
        <Badge variant="secondary">ثانویه</Badge>
        <Badge variant="success">موفق</Badge>
        <Badge variant="warning">هشدار</Badge>
        <Badge variant="info">اطلاع</Badge>
        <Badge variant="destructive">خطر</Badge>
        <Badge variant="muted">خاموش</Badge>
        <Badge variant="outline">خطی</Badge>
      </Section>

      <Section title="فرم‌ها" description="ورودی، انتخاب، کلید، تاریخ شمسی">
        <div className="grid w-full gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>ورودی متنی</Label>
            <Input placeholder="مثلاً: زهرا محمدی" />
          </div>
          <div className="space-y-2">
            <Label>منوی کشویی</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">گزینه یک</SelectItem>
                <SelectItem value="2">گزینه دو</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>تاریخ شمسی</Label>
            <JalaliDatePicker value={date || undefined} onChange={setDate} />
            {date && <p className="text-xs text-muted-foreground">انتخاب: {formatJalali(new Date(), 'medium')} (کلید: {date})</p>}
          </div>
          <div className="space-y-2">
            <Label>متن چندخطی</Label>
            <Textarea rows={2} placeholder="شرح حال…" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox defaultChecked /> چک‌باکس
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch defaultChecked /> سوییچ
          </label>
          <RadioGroup defaultValue="a" className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="a" /> گزینه ۱
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="b" /> گزینه ۲
            </label>
          </RadioGroup>
        </div>
      </Section>

      <Section title="بازخورد و وضعیت">
        <Alert variant="success" title="عملیات موفق">تغییرات با موفقیت ذخیره شد.</Alert>
        <Alert variant="warning" title="هشدار">مهلت تکمیل پرونده رو به پایان است.</Alert>
        <Alert variant="destructive" title="خطا">حساسیت دارویی با نسخه ناسازگار است!</Alert>
        <Alert variant="info">اطلاعات تکمیلی در پرونده شما ثبت شد.</Alert>
        <div className="flex flex-wrap gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">هاور کنید</Button>
            </TooltipTrigger>
            <TooltipContent>یک راهنمای کوتاه</TooltipContent>
          </Tooltip>
          <Progress value={68} className="w-56" />
        </div>
      </Section>

      <Section title="امتیاز و آواتار">
        <RatingStars value={4.5} count={128} />
        <RatingStars value={3} size="sm" />
        <Avatar>
          <AvatarFallback>زم</AvatarFallback>
        </Avatar>
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-rose-100 text-rose-700">آر</AvatarFallback>
        </Avatar>
      </Section>

      <Section title="کارت‌های آماری">
        <StatCard className="w-full sm:w-56" title="بیماران فعال" value={toPersianDigits('1024')} icon={Palette} trend={{ value: 12, positive: true }} />
        <StatCard className="w-full sm:w-56" title="ویزیت امروز" value={toPersianDigits('38')} icon={Palette} hint="تا ساعت ۱۲" />
      </Section>

      <Section title="گام‌ها (Stepper)">
        <div className="w-full">
          <Stepper
            steps={[
              { id: '1', title: 'اطلاعات پایه' },
              { id: '2', title: 'حساسیت‌ها' },
              { id: '3', title: 'داروها' },
              { id: '4', title: 'تأیید نهایی' }
            ]}
            current={step}
            onStepClick={setStep}
          />
        </div>
      </Section>

      <Section title="زبانه‌ها">
        <Tabs defaultValue="one" className="w-full">
          <TabsList>
            <TabsTrigger value="one">اول</TabsTrigger>
            <TabsTrigger value="two">دوم</TabsTrigger>
            <TabsTrigger value="three">سوم</TabsTrigger>
          </TabsList>
          <TabsContent value="one">
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">محتوای زبانه اول</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="two">
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">محتوای زبانه دوم</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="three">
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">محتوای زبانه سوم</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="بارگذاری و جداکننده">
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-12 w-40 rounded-full" />
        <Separator className="w-56" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeftRight className="h-4 w-4" /> همه اجزا RTL هستند
        </div>
      </Section>

      <Section title="وضعیت خالی">
        <EmptyState className="w-full" title="چیزی یافت نشد" description="این یک نمونه حالت خالی است." />
      </Section>

      <p className="pb-8 text-center text-xs text-muted-foreground">
        هلثامد — نمونه نمایشی سیستم طراحی — {formatJalali(new Date(), 'full')}
      </p>
    </div>
  )
}
