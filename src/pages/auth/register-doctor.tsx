// Doctor registration (goes to pending approval queue).
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BadgeCheck, Clock3 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Logo } from '@/components/layout/logo'
import { registerDoctorSchema } from '@/lib/validators'
import { SPECIALTIES } from '@/data/catalog'
import { CITIES } from '@/lib/labels'
import { auth } from '@/services'

type FormValues = {
  fullName: string
  mobile: string
  email: string
  password: string
  specialty: string
  medicalCouncilNumber: string
  city: string
  experienceYears: number
  bio: string
}

export default function RegisterDoctorPage() {
  const navigate = useNavigate()
  const form = useForm<FormValues>({
    resolver: zodResolver(registerDoctorSchema),
    defaultValues: {
      fullName: '',
      mobile: '',
      email: '',
      password: '',
      specialty: '',
      medicalCouncilNumber: '',
      city: '',
      experienceYears: 5,
      bio: ''
    }
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await auth.registerDoctor(values)
      toast.success(`درخواست شما ثبت شد ${user.fullName}`)
      navigate('/login', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background p-4">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex justify-center">
          <Link to="/">
            <Logo className="scale-110" />
          </Link>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BadgeCheck className="h-5 w-5 text-primary" />
              ثبت‌نام پزشک
            </CardTitle>
            <CardDescription>
              پس از ثبت درخواست، مدیر سامانه مدارک شما را بررسی می‌کند (معمولاً کمتر از ۲۴ ساعت).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="info" className="mb-4">
              <span className="flex items-start gap-2">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                اطلاعات واردشده باید با شماره نظام پزشکی شما مطابقت داشته باشد.
              </span>
            </Alert>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نام و نام خانوادگی</FormLabel>
                        <FormControl>
                          <Input placeholder="مثلاً: امیر حسینی" {...field} />
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ایمیل (اختیاری)</FormLabel>
                        <FormControl>
                          <Input type="email" dir="ltr" placeholder="dr@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تخصص</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب تخصص" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SPECIALTIES.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="medicalCouncilNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>شماره نظام پزشکی</FormLabel>
                        <FormControl>
                          <Input inputMode="numeric" dir="ltr" placeholder="12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>شهر محل فعالیت</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب شهر" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CITIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سابقه فعالیت (سال)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} max={60} dir="ltr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>معرفی کوتاه حرفه‌ای</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="سابقه تحصیلی، حوزه تخصص، رویکرد درمانی شما…"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>این متن در صفحه پروفایل شما به بیماران نمایش داده می‌شود.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'در حال ارسال درخواست…' : 'ارسال درخواست همکاری'}
                </Button>
              </form>
            </Form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              بیمار هستید؟{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                ثبت‌نام بیمار
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
