// Patient registration.
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarCheck, UserRoundPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Logo } from '@/components/layout/Logo'
import { registerPatientSchema } from '@/lib/validators'
import { auth } from '@/services'

type FormValues = {
  fullName: string
  mobile: string
  nationalId: string
  password: string
  confirm: string
}

export default function RegisterPatientPage() {
  const navigate = useNavigate()
  const form = useForm<FormValues>({
    resolver: zodResolver(registerPatientSchema),
    defaultValues: { fullName: '', mobile: '', nationalId: '', password: '', confirm: '' }
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await auth.registerPatient(values)
      toast.success(`حساب شما ساخته شد ${user.fullName}!`)
      navigate('/app/records/wizard', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center">
          <Link to="/">
            <Logo className="scale-110" />
          </Link>
        </div>
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <UserRoundPlus className="h-5 w-5 text-primary" />
              ساخت حساب بیمار
            </CardTitle>
            <CardDescription>
              در یک دقیقه ثبت‌نام کنید؛ سپس پرونده پزشکی خود را تکمیل خواهید کرد.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام و نام خانوادگی</FormLabel>
                      <FormControl>
                        <Input placeholder="مثلاً: زهرا محمدی" {...field} />
                      </FormControl>
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
                        <Input inputMode="numeric" dir="ltr" placeholder="09123456789" {...field} />
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
                        <Input inputMode="numeric" dir="ltr" placeholder="0012345678" {...field} />
                      </FormControl>
                      <FormDescription>کد ملی برای صدور نسخه الکترونیک الزامی است.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رمز عبور</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تکرار رمز عبور</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                  <CalendarCheck className="h-4 w-4" />
                  {form.formState.isSubmitting ? 'در حال ساخت حساب…' : 'ثبت‌نام و شروع'}
                </Button>
              </form>
            </Form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              حساب دارید؟{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                وارد شوید
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
