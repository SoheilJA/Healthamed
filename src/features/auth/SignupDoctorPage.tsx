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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Stepper } from "@/components/shared/Stepper";
import { FileUploader, DocumentRows } from "@/components/shared/FileUploader";
import { AuthShell } from "./AuthShell";
import { authService } from "@/services";
import { SPECIALTIES } from "@/data/catalog";
import { usePageTitle } from "@/hooks";
import {
  fullNameSchema,
  mobileSchema,
  nationalIdSchema,
  toEnglishDigits,
  emailSchema,
} from "@/lib/validators";
import { formatToman, toPersianDigits } from "@/lib/persian";
import type { MedicalDocument } from "@/types";

const schema = z.object({
  name: fullNameSchema,
  nationalId: nationalIdSchema,
  mobile: mobileSchema,
  email: emailSchema.optional().or(z.literal("")),
  specialtyId: z.string().min(1, "انتخاب تخصص الزامی است"),
  medicalCouncilNumber: z
    .string()
    .trim()
    .transform(toEnglishDigits)
    .pipe(
      z.string().regex(/^\d{4,6}$/, "شماره نظام پزشکی باید ۴ تا ۶ رقم باشد"),
    ),
  yearsExperience: z
    .string()
    .transform(toEnglishDigits)
    .pipe(z.string().regex(/^\d{1,2}$/, "سابقه را به سال وارد کنید (۰ تا ۹۹)")),
  education: z.string().trim().min(5, "مدرک و دانشگاه را وارد کنید"),
  bio: z
    .string()
    .trim()
    .min(20, "حداقل ۲۰ کاراکتر درباره خود و شیوه درمان‌تان بنویسید"),
  visitFee: z
    .string()
    .transform(toEnglishDigits)
    .pipe(
      z
        .string()
        .regex(
          /^\d{5,7}$/,
          " honorari را به تومان و بدون جداکننده وارد کنید (مثلاً ۲۵۰۰۰۰)",
        ),
    ),
  licenseFile: z.string().min(1, "آپلود تصویر مجوز نظام پزشکی الزامی است"),
  idCardFile: z.string().min(1, "آپلود تصویر کارت ملی الزامی است"),
});
type FormValues = z.infer<typeof schema>;

const STEPS = [
  { key: "personal", title: "اطلاعات فردی" },
  { key: "professional", title: "اطلاعات حرفه‌ای" },
  { key: "documents", title: "مدارک" },
  { key: "review", title: "بازبینی و ارسال" },
];

const STEP_FIELDS: Record<string, (keyof FormValues)[]> = {
  personal: ["name", "nationalId", "mobile", "email"],
  professional: [
    "specialtyId",
    "medicalCouncilNumber",
    "yearsExperience",
    "education",
    "bio",
    "visitFee",
  ],
  documents: ["licenseFile", "idCardFile"],
};

export default function SignupDoctorPage() {
  usePageTitle("ثبت‌نام پزشک");
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [docs, setDocs] = useState<MedicalDocument[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      nationalId: "",
      mobile: "",
      email: "",
      specialtyId: "",
      medicalCouncilNumber: "",
      yearsExperience: "",
      education: "",
      bio: "",
      visitFee: "",
      licenseFile: "",
      idCardFile: "",
    },
    mode: "onTouched",
  });

  const addDocs =
    (category: MedicalDocument["category"]) => (files: File[]) => {
      const newDocs = files.map((f) => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: f.name,
        category,
        date: new Date().toISOString().slice(0, 10),
        notes: "",
        mime: f.type || "application/octet-stream",
        size: f.size,
        uploadedAt: Date.now(),
      }));
      setDocs((prev) => [...prev, ...newDocs]);
      if (category === "other")
        form.setValue("licenseFile", newDocs[0]?.name ?? "", {
          shouldValidate: true,
        });
      else
        form.setValue("idCardFile", newDocs[0]?.name ?? "", {
          shouldValidate: true,
        });
    };

  const submitMutation = useMutation({
    mutationFn: (values: FormValues) =>
      authService.signupDoctor({
        name: values.name,
        nationalId: values.nationalId,
        mobile: values.mobile,
        email: values.email || undefined,
        medicalCouncilNumber: values.medicalCouncilNumber,
        specialtyId: values.specialtyId,
        yearsExperience: Number(values.yearsExperience),
        education: values.education,
        bio: values.bio,
        visitFee: Number(values.visitFee),
      }),
    onSuccess: () => setDone(true),
    onError: (e: Error) => toast.error(e.message),
  });

  const next = async () => {
    const valid = await form.trigger(STEP_FIELDS[STEPS[step].key]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  if (done) {
    return (
      <AuthShell title="درخواست شما ثبت شد">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="size-8 text-success" />
          </div>
          <p className="text-sm leading-7 text-muted-foreground">
            درخواست ثبت‌نام پزشک شما ثبت شد. کارشناسان ما مدارک و شماره نظام
            پزشکی شما را بررسی می‌کنند و پس از تایید، پنل پزشک شما فعال می‌شود و
            می‌توانید برنامه کاری و قیمت ویزیت خود را تنظیم کنید.
          </p>
          <Button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full"
          >
            بازگشت به صفحه ورود
          </Button>
        </div>
      </AuthShell>
    );
  }

  const values = form.getValues();

  return (
    <AuthShell
      title="ثبت‌نام پزشک"
      subtitle="پس از تکمیل اطلاعات و تایید مدیر، پنل پزشک شما فعال می‌شود."
      footer={
        <p>
          پزشک نیستید؟{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary hover:underline"
          >
            ثبت‌نام بیمار
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <Stepper
          steps={STEPS}
          current={step}
          onStepClick={(i) => i < step && setStep(i)}
        />

        {step === 0 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام و نام خانوادگی</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="مثلاً آرش توکلی"
                      autoComplete="name"
                      {...field}
                    />
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
                    <Input
                      inputMode="numeric"
                      dir="ltr"
                      placeholder="۱۰ رقم"
                      {...field}
                    />
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ایمیل (اختیاری)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      dir="ltr"
                      placeholder="dr@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="specialtyId"
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
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="medicalCouncilNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شماره نظام پزشکی</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        dir="ltr"
                        placeholder="۵۴۳۲۱"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yearsExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سابقه (سال)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        dir="ltr"
                        placeholder="۱۲"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>آخرین مدرک تحصیلی</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="مثلاً بورد تخصصی، دانشگاه علوم پزشکی تهران"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visitFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>قیمت ویزیت آنلاین (تومان)</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      dir="ltr"
                      placeholder="250000"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    بین {formatToman(50000)} و {formatToman(1000000)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>معرفی کوتاه</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="درباره خود، شیوه درمان و خدمات‌تان بنویسید..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold">تصویر مجوز نظام پزشکی</p>
              <FileUploader
                onFiles={addDocs("other")}
                accept={{ "image/*": [], "application/pdf": [] }}
                maxFiles={2}
              />
              {form.formState.errors.licenseFile && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.licenseFile.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold">تصویر کارت ملی</p>
              <FileUploader
                onFiles={addDocs("discharge")}
                accept={{ "image/*": [], "application/pdf": [] }}
                maxFiles={1}
              />
              {form.formState.errors.idCardFile && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.idCardFile.message}
                </p>
              )}
            </div>
            <DocumentRows
              docs={docs}
              onDelete={(id) =>
                setDocs((prev) => prev.filter((d) => d.id !== id))
              }
            />
          </div>
        )}

        {step === 3 && (
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <p>
                <span className="text-muted-foreground">نام: </span>
                <b>{values.name}</b>
              </p>
              <p>
                <span className="text-muted-foreground">کد ملی: </span>
                <span dir="ltr">{toPersianDigits(values.nationalId)}</span>
              </p>
              <p>
                <span className="text-muted-foreground">موبایل: </span>
                <span dir="ltr">{toPersianDigits(values.mobile)}</span>
              </p>
              <p>
                <span className="text-muted-foreground">تخصص: </span>
                <b>
                  {SPECIALTIES.find((s) => s.id === values.specialtyId)?.name}
                </b>
              </p>
              <p>
                <span className="text-muted-foreground">نظام پزشکی: </span>
                <span dir="ltr">
                  {toPersianDigits(values.medicalCouncilNumber)}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">سابقه: </span>
                {toPersianDigits(values.yearsExperience)} سال
              </p>
              <p>
                <span className="text-muted-foreground">قیمت ویزیت: </span>
                <b>{formatToman(Number(values.visitFee) || 0)}</b>
              </p>
              <p>
                <span className="text-muted-foreground">مدارک: </span>
                {toPersianDigits(docs.length)} فایل
              </p>
              <Badge variant="warning">
                پس از ارسال، وضعیت شما «در انتظار تایید مدیر» خواهد بود
              </Badge>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep((s) => s - 1)}
            >
              مرحله قبل
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" className="flex-1" onClick={next}>
              مرحله بعد
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1"
              loading={submitMutation.isPending}
              onClick={form.handleSubmit((values) =>
                submitMutation.mutate(values),
              )}
            >
              ارسال درخواست
            </Button>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
