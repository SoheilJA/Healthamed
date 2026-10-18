// Forgot password (demo flow).
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Logo } from '@/components/layout/logo'
import { z } from 'zod'
import { toPersianDigits } from '@/lib/persian'

const schema = z.object({
  mobile: z
    .string()
    .min(1, 'شماره موبایل الزامی است')
})

export default function ForgotPasswordPage() {
  const form = useForm<{ mobile: string }>({ resolver: zodResolver(schema), defaultValues: { mobile: '' } })

  const onSubmit = async () => {
    toast.success('کد بازیابی پیامک شد (حالت دمو: ۱۲۳۴۵)')
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center">
          <Link to="/">
            <Logo className="scale-110" />
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <KeyRound className="h-5 w-5 text-primary" />
              بازیابی رمز عبور
            </CardTitle>
            <CardDescription>
              شماره موبایل حساب خود را وارد کنید. کد بازیابی برای شما پیامک می‌شود و می‌توانید رمز جدید تنظیم کنید.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <Button type="submit" className="w-full" size="lg">
                  ارسال کد بازیابی
                </Button>
              </form>
            </Form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              در این نسخه نمایشی، همه کدها {toPersianDigits('12345')} هستند.{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                بازگشت به ورود
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
