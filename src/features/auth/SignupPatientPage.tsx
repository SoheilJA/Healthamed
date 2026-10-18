import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { OtpInput } from '@/components/shared/OtpInput'
import { AuthShell } from './AuthShell'
import { authService } from '@/services'
import { useAuthStore } from '@/stores'
import { useCountdown, usePageTitle } from '@/hooks'
import { fullNameSchema, mobileSchema, nationalIdSchema } from '@/lib/validators'
import { toPersianDigits } from '@/lib/persian'

const schema = z.object({
  name: fullNameSchema,
  nationalId: nationalIdSchema,
  mobile: mobileSchema,
  terms: z.literal(true, { errorMap: () => ({ message: 'پذیرش شرایط و سیاست حریم خصوصی الزامی است' }) })
})
type FormValues = z.infer<typeof schema>

export default function SignupPatientPage() {
  usePageTitle('ثبت‌نام بیمار')
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [formValues, setFormValues] = useState<FormValues | null>(null)
  const [otp, setOtp] = useState('')
  const { remaining, start } = useCountdown(120)

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', nationalId: '', mobile: '', terms: false as unknown as true } })

  const otpMutation = useMutation({
    mutationFn: (mobile: string) => authService.requestOtp(mobile),
    onSuccess: () => {
      setStep('otp')
      setOtp('')
      start(120)
      toast.success('کد تایید ارسال شد')
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const verifyAndSignup = useMutation({
    mutationFn: async (code: string) => {
      if (code !== '12345') throw new Error('کد تایید نادرست است. کد نمایشی: ۱۲۳۴۵')
      return authService.signupPatient({
        name: formValues!.name,
        nationalId: formValues!.nationalId,
        mobile: formValues!.mobile
      })
    },
    onSuccess: (user) => {
      login(user)
      toast.success('ثبت‌نام انجام شد! حالا پرونده پزشکی خود را تکمیل کنید.')
      navigate('/app/profile-wizard', { replace: true })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  if (step === 'otp' && formValues) {
    return (
      <AuthShell title="تایید شماره موبایل" subtitle={`کد ۵ رقمی ارسال‌شده به ${toPersianDigits(formValues.mobile)} را وارد کنید.`}>
        <div className="space-y-4">
          <OtpInput value={otp} onChange={setOtp} disabled={verifyAndSignup.isPending} />
          <p className="text-center text-xs text-muted-foreground">کد نمایشی: {toPersianDigits('12345')}</p>
          <Button
            className="w-full"
            loading={verifyAndSignup.isPending}
            disabled={otp.length !== 5}
            onClick={() => verifyAndSignup.mutate(otp)}
          >
            تایید و ساخت حساب
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            {remaining > 0 ? (
              <span>
                ارسال مجدد تا{' '}
                <span dir="ltr">
                  {toPersianDigits(String(Math.floor(remaining / 60)).padStart(2, '0'))}:
                  {toPersianDigits(String(remaining % 60).padStart(2, '0'))}
                </span>
              </span>
            ) : (
              <button type="button" className="font-semibold text-primary hover:underline" onClick={() => otpMutation.mutate(formValues.mobile)}>
                ارسال مجدد کد
              </button>
            )}
          </div>
          <Button variant="ghost" className="w-full" onClick={() => setStep('form')}>
            ویرایش اطلاعات
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="ثبت‌نام بیمار"
      subtitle="در کمتر از دو دقیقه حساب خود را بسازید."
      footer={
        <p>
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            وارد شوید
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            setFormValues(values)
            otpMutation.mutate(values.mobile)
          })}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام و نام خانوادگی</FormLabel>
                <FormControl>
                  <Input placeholder="مثلاً سارا محمدی" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nationalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>کد ملی</FormLabel>
                <FormControl>
                  <Input inputMode="numeric" dir="ltr" placeholder="۱۰ رقم" className="text-left" {...field} />
                </FormControl>
                <FormDescription>کد ملی شما برای صدور نسخه الکترونیک و کد پیگیری لازم است.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>شماره موبایل</FormLabel>
                <FormControl>
                  <Input inputMode="numeric" dir="ltr" placeholder="09xxxxxxxxx" autoComplete="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <label className="flex items-start gap-2 rounded-lg border p-3 text-sm leading-6">
                  <Checkbox checked={!!field.value} onCheckedChange={field.onChange} className="mt-1" />
                  <span>
                    <span>شرایط استفاده</span> و <span>سیاست حریم خصوصی</span> هلثامد را می‌پذیرم. اطلاعات پزشکی من محرمانه
                    است و فقط با رضایت من در اختیار پزشک قرار می‌گیرد.
                  </span>
                </label>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" loading={otpMutation.isPending}>
            ادامه و دریافت کد تایید
          </Button>
        </form>
      </Form>
    </AuthShell>
  )
}