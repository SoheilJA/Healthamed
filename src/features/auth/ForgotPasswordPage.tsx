import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useCountdown, usePageTitle } from "@/hooks";
import { mobileSchema, passwordSchema } from "@/lib/validators";
import { toPersianDigits } from "@/lib/persian";

const phoneSchema = z.object({ mobile: mobileSchema });
const resetSchema = z.object({ password: passwordSchema });
type PhoneValues = z.infer<typeof phoneSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  usePageTitle("فراموشی رمز عبور");
  const navigate = useNavigate();
  const [step, setStep] = useState<"mobile" | "otp" | "reset" | "done">(
    "mobile",
  );
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const { remaining, start } = useCountdown(120);

  const phoneForm = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { mobile: "" },
  });
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "" },
  });

  const otpMutation = useMutation({
    mutationFn: (value: string) => authService.requestOtp(value),
    onSuccess: () => {
      setStep("otp");
      setOtp("");
      start(120);
      toast.success("کد تایید ارسال شد");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      await authService.verifyOtp(mobile, code); // will throw for unknown numbers in demo
      return code;
    },
    onSuccess: () => setStep("reset"),
    onError: (e: Error) => toast.error(e.message),
  });

  if (step === "done") {
    return (
      <AuthShell title="رمز عبور تغییر کرد">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="size-8 text-success" />
          </div>
          <p className="text-sm leading-7 text-muted-foreground">
            رمز عبور جدید شما ثبت شد. حالا می‌توانید با ایمیل و رمز جدید وارد
            شوید.
          </p>
          <Button
            className="w-full"
            onClick={() => navigate("/login", { replace: true })}
          >
            رفتن به صفحه ورود
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="بازیابی رمز عبور"
      subtitle={
        step === "mobile"
          ? "شماره موبایل حساب خود را وارد کنید تا کد تایید ارسال شود."
          : step === "otp"
            ? `کد ارسال‌شده به ${toPersianDigits(mobile)} را وارد کنید.`
            : "رمز عبور جدید خود را انتخاب کنید."
      }
      footer={
        <Link
          to="/login"
          className="font-semibold text-primary hover:underline"
        >
          بازگشت به صفحه ورود
        </Link>
      }
    >
      {step === "mobile" && (
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
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={verifyMutation.isPending}
          />
          <p className="text-center text-xs text-muted-foreground">
            کد نمایشی: {toPersianDigits("12345")}
          </p>
          <Button
            className="w-full"
            loading={verifyMutation.isPending}
            disabled={otp.length !== 5}
            onClick={() => verifyMutation.mutate(otp)}
          >
            تایید کد
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            {remaining > 0 ? (
              <span>
                ارسال مجدد تا{" "}
                {toPersianDigits(String(Math.floor(remaining / 60)))}:
                {toPersianDigits(String(remaining % 60).padStart(2, "0"))}
              </span>
            ) : (
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => otpMutation.mutate(mobile)}
              >
                ارسال مجدد کد
              </button>
            )}
          </div>
        </div>
      )}

      {step === "reset" && (
        <Form {...resetForm}>
          <form
            onSubmit={resetForm.handleSubmit(() => {
              toast.success("رمز عبور جدید ثبت شد (نمایشی)");
              setStep("done");
            })}
            className="space-y-4"
          >
            <FormField
              control={resetForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز عبور جدید</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              ثبت رمز جدید
            </Button>
          </form>
        </Form>
      )}
    </AuthShell>
  );
}
