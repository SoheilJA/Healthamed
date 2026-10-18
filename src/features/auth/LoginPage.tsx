import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { OtpInput } from "@/components/shared/OtpInput";
import { AuthShell } from "./AuthShell";
import { authService } from "@/services";
import { roleHome } from "@/routes/guards";
import { useAuthStore } from "@/stores";
import { useCountdown, usePageTitle } from "@/hooks";
import { emailSchema, mobileSchema, passwordSchema } from "@/lib/validators";
import { toPersianDigits } from "@/lib/persian";

const phoneSchema = z.object({ mobile: mobileSchema });
const passSchema = z.object({ email: emailSchema, password: passwordSchema });
type PhoneValues = z.infer<typeof phoneSchema>;
type PassValues = z.infer<typeof passSchema>;

const DEMO_ACCOUNTS = [
  { kind: "patient-full" as const, label: "بیمار (پرونده کامل)" },
  { kind: "patient-partial" as const, label: "بیمار (پرونده ناقص)" },
  { kind: "doctor" as const, label: "پزشک" },
  { kind: "admin" as const, label: "مدیر" },
];

export default function LoginPage() {
  usePageTitle("ورود");
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpHint, setOtpHint] = useState<string | null>(null);
  const { remaining, start } = useCountdown(120);

  const phoneForm = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { mobile: "" },
  });
  const passForm = useForm<PassValues>({
    resolver: zodResolver(passSchema),
    defaultValues: { email: "", password: "" },
  });

  const goToHome = (role: "patient" | "doctor" | "admin", name: string) => {
    toast.success(`خوش آمدید، ${name}!`);
    navigate(roleHome(role), { replace: true });
  };

  const otpMutation = useMutation({
    mutationFn: (value: string) => authService.requestOtp(value),
    onSuccess: (res) => {
      setOtpHint(res.hint);
      setStep("otp");
      setOtp("");
      start(120);
      toast.success("کد تایید ارسال شد");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const verifyMutation = useMutation({
    mutationFn: (code: string) => authService.verifyOtp(mobile, code),
    onSuccess: (user) => {
      login(user);
      goToHome(user.role, user.name);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const passwordMutation = useMutation({
    mutationFn: (values: PassValues) =>
      authService.loginWithPassword(values.email, values.password),
    onSuccess: (user) => {
      login(user);
      goToHome(user.role, user.name);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const quickMutation = useMutation({
    mutationFn: (kind: (typeof DEMO_ACCOUNTS)[number]["kind"]) =>
      authService.quickLogin(kind),
    onSuccess: (user) => {
      login(user);
      goToHome(user.role, user.name);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resend = () => {
    otpMutation.mutate(mobile);
  };

  return (
    <AuthShell
      title="ورود به هلثامد"
      subtitle="با شماره موبایل و کد یک‌بارمصرف یا با ایمیل وارد شوید."
      footer={
        <p>
          حساب ندارید؟{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary hover:underline"
          >
            ثبت‌نام بیمار
          </Link>{" "}
          |{" "}
          <Link
            to="/signup/doctor"
            className="font-semibold text-primary hover:underline"
          >
            ثبت‌نام پزشک
          </Link>
        </p>
      }
    >
      {step === "otp" ? (
        <div className="space-y-4">
          <p className="text-center text-sm leading-6 text-muted-foreground">
            کد ۵ رقمی ارسال‌شده به{" "}
            <bdi className="font-bold text-foreground">
              {toPersianDigits(mobile)}
            </bdi>{" "}
            را وارد کنید.
          </p>
          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={verifyMutation.isPending}
          />
          {otpHint && (
            <p className="text-center text-xs text-muted-foreground">
              {otpHint}
            </p>
          )}
          <Button
            className="w-full"
            loading={verifyMutation.isPending}
            disabled={otp.length !== 5}
            onClick={() => verifyMutation.mutate(otp)}
          >
            تایید و ورود
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            {remaining > 0 ? (
              <span>
                ارسال مجدد کد تا{" "}
                <span dir="ltr">
                  {toPersianDigits(
                    String(Math.floor(remaining / 60)).padStart(2, "0"),
                  )}
                  :{toPersianDigits(String(remaining % 60).padStart(2, "0"))}
                </span>
              </span>
            ) : (
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={resend}
              >
                ارسال مجدد کد
              </button>
            )}
          </div>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setStep("credentials");
              setOtp("");
            }}
          >
            تغییر شماره موبایل
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="mobile">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mobile">ورود با موبایل</TabsTrigger>
            <TabsTrigger value="email">ورود با ایمیل</TabsTrigger>
          </TabsList>

          <TabsContent value="mobile">
            <Form {...phoneForm}>
              <form
                onSubmit={phoneForm.handleSubmit((values) => {
                  setMobile(values.mobile);
                  otpMutation.mutate(values.mobile);
                })}
                className="space-y-4"
              >
                <FormField
                  control={phoneForm.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>شماره موبایل</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          dir="ltr"
                          placeholder="09xxxxxxxxx"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  loading={otpMutation.isPending}
                >
                  دریافت کد تایید
                </Button>
              </form>
            </Form>
            <p className="mt-3 text-center text-xs">
              <Link
                to="/forgot-password"
                className="text-primary hover:underline"
              >
                رمز عبور را فراموش کرده‌ام
              </Link>
            </p>
          </TabsContent>

          <TabsContent value="email">
            <Form {...passForm}>
              <form
                onSubmit={passForm.handleSubmit((values) =>
                  passwordMutation.mutate(values),
                )}
                className="space-y-4"
              >
                <FormField
                  control={passForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ایمیل</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          dir="ltr"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رمز عبور</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  loading={passwordMutation.isPending}
                >
                  ورود
                </Button>
              </form>
            </Form>
            <p className="mt-3 text-center text-xs">
              <Link
                to="/forgot-password"
                className="text-primary hover:underline"
              >
                فراموشی رمز عبور
              </Link>
            </p>
          </TabsContent>
        </Tabs>
      )}

      <div className="mt-6">
        <div className="relative my-4">
          <Separator />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="bg-card px-2 text-xs text-muted-foreground">
              ورود سریع نمایشی
            </span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <Button
              key={acc.kind}
              variant="secondary"
              size="sm"
              disabled={quickMutation.isPending}
              onClick={() => quickMutation.mutate(acc.kind)}
            >
              {acc.label}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          کد تایید نمایشی: <b>{toPersianDigits("12345")}</b> — شماره‌های نمایشی:{" "}
          {toPersianDigits("09190000001")} (بیمار)،{" "}
          {toPersianDigits("09190000010")} (پزشک)،{" "}
          {toPersianDigits("09190000020")} (مدیر)
        </p>
      </div>
    </AuthShell>
  );
}
