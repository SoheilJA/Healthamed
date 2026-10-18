// Login: mobile -> OTP (12345) + demo quick logins.
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, KeyRound, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Logo } from '@/components/layout/logo'
import { loginSchema, type OtpInput } from '@/lib/validators'
import { auth } from '@/services'
import { getCurrentUser, DEMO_ACCOUNTS } from '@/services/authService'
import { toPersianDigits } from '@/lib/persian'
import { useCountdown } from '@/hooks'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile')
  const [mobile, setMobile] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { remaining, start, running } = useCountdown(120)

  const form = useForm<OtpInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: '', code: '' }
  })

  const sendOtp = async (values: OtpInput) => {
    setSubmitting(true)
    try {
      await auth.requestOtp(values.mobile)
      setMobile(values.mobile)
      setStep('otp')
      start()
      toast.success(`کد تأیید ارسال شد (کد نمونه: ${toPersianDigits('12345')})`)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const verify = async (values: OtpInput) => {
    setSubmitting(true)
    try {
      const user = await auth.verifyOtp(mobile || values.mobile, values.code)
      toast.success(`خوش آمدید ${user.fullName}!`)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? (user.role === 'admin' ? '/admin' : user.role === 'doctor' ? '/panel' : '/app'), { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const demoLogin = async (key: string) => {
    setSubmitting(true)
    try {
      const user = await auth.demoLogin(key)
      toast.success(`ورود دمو: ${user.fullName}`)
      navigate(user.role === 'admin' ? '/admin' : user.role === 'doctor' ? '/panel' : '/app', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const quickEnter = () => {
    // go to destination based on current (demo) role if logged in
    const user = getCurrentUser()
    if (!user) {
      toast.info('ابتدا وارد یکی از حساب‌های دمو شوید')
      return
    }
    navigate(user.role === 'admin' ? '/admin' : user.role === 'doctor' ? '/panel' : '/app')
  }
  void quickEnter

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center">
          <Link to="/">
            <Logo className="scale-110" />
          </Link>
        </div>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              {step === 'mobile' ? (
                <>
                  <Smartphone className="h-5 w-5 text-primary" />
                  ورود / ثبت‌نام
                </>
              ) : (
                <>
                  <KeyRound className="h-5 w-5 text-primary" />
                  کد تأیید را وارد کنید
                </>
              )}
            </CardTitle>
            <CardDescription>
              {step === 'mobile'
                ? 'شماره موبایل خود را وارد کنید تا کد تأیید برایتان ارسال شود.'
                : `کد ۵ رقمی ارسال‌شده به ${toPersianDigits(mobile)} را وارد کنید.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'mobile' ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(sendOtp)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>شماره موبایل</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            dir="ltr"
                            className="text-center text-lg tracking-widest"
                            placeholder="09123456789"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    {submitting ? 'در حال ارسال…' : 'دریافت کد تأیید'}
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(verify)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>کد تأیید</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            dir="ltr"
                            autoFocus
                            className="text-center text-2xl font-bold tracking-[0.5em]"
                            placeholder="- - - - -"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    {submitting ? 'در حال بررسی…' : 'ورود به هلثامد'}
                  </Button>
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setStep('mobile')}
                    >
                      تغییر شماره
                    </button>
                    {running ? (
                      <span className="text-muted-foreground tabular-nums-fa">
                        ارسال مجدد تا {toPersianDigits(remaining)} ثانیه
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => {
                          auth.requestOtp(mobile)
                          start()
                          toast.success('کد جدید ارسال شد')
                        }}
                      >
                        ارسال مجدد کد
                      </button>
                    )}
                  </div>
                </form>
              </Form>
            )}

            <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-center text-xs leading-6 text-muted-foreground">
              حالت نمایشی: کد تأیید همیشه <span className="font-bold text-primary">۱۲۳۴۵</span> است.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">ورود سریع دمو</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <Button
                key={acc.key}
                variant="secondary"
                size="sm"
                disabled={submitting}
                onClick={() => demoLogin(acc.key)}
              >
                {acc.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" />
          حساب ندارید؟
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline">
            <Link to="/register">ثبت‌نام بیمار</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/register/doctor">ثبت‌نام پزشک</Link>
          </Button>
        </div>

        <p className="text-center text-xs">
          <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">
            رمز عبور را فراموش کرده‌اید؟
          </Link>
        </p>
      </div>
    </div>
  )
}
