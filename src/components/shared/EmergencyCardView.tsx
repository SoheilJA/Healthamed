import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  Droplets,
  HeartPulse,
  Phone,
  Pill,
  Siren,
} from "lucide-react";
import type { EmergencyCardData } from "@/types";
import { SEVERITY, SEX_LABEL } from "@/lib/labels";
import { toPersianDigits } from "@/lib/persian";
import { formatDateTimeJalali } from "@/lib/jalali";
import { CopyButton } from "./CopyButton";

interface EmergencyCardViewProps {
  data: EmergencyCardData;
  lastSyncedAt?: number;
}

function Section({
  icon: Icon,
  title,
  tone = "default",
  children,
}: {
  icon: typeof HeartPulse;
  title: string;
  tone?: "default" | "danger" | "warning";
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl border-2 bg-white p-3 text-gray-900 print:break-inside-avoid"
      style={{
        borderColor:
          tone === "danger"
            ? "#dc2626"
            : tone === "warning"
              ? "#d97706"
              : "#d1d5db",
      }}
    >
      <h3
        className="mb-2 flex items-center gap-2 border-b pb-1.5 text-sm font-extrabold"
        style={{
          color:
            tone === "danger"
              ? "#dc2626"
              : tone === "warning"
                ? "#b45309"
                : "#111827",
        }}
      >
        <Icon className="size-4" />
        {title}
      </h3>
      {children}
    </section>
  );
}

export function EmergencyCardView({
  data,
  lastSyncedAt,
}: EmergencyCardViewProps) {
  const qrText = [
    "کارت اورژانس هلثامد",
    `نام: ${data.name}`,
    `کد ملی: ${data.nationalId}`,
    `گروه خونی: ${data.bloodType ?? "-"}`,
    `سن: ${data.age ?? "-"}`,
    `آلرژی: ${data.allergies.map((a) => a.name).join("، ") || "-"}`,
    `بیماری‌ها: ${data.chronicDiseases.join("، ") || "-"}`,
    `داروها: ${data.medications.join("، ") || "-"}`,
    `تماس اضطراری: ${data.contacts.map((c) => `${c.name} ${c.phone}`).join(" | ") || "-"}`,
  ].join("\n");

  return (
    <div className="space-y-3 print:space-y-2">
      {/* Header */}
      <div className="rounded-xl bg-red-600 p-4 text-white shadow-lg print:shadow-none">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Siren className="size-9 shrink-0" />
            <div>
              <p className="text-xl font-black leading-tight">کارت اورژانس</p>
              <p className="text-xs opacity-90">هلثامد — اطلاعات حیاتی بیمار</p>
            </div>
          </div>
          {data.bloodType && (
            <div className="rounded-xl bg-white/20 px-4 py-2 text-center">
              <p className="flex items-center justify-center gap-1 text-[10px] font-medium">
                <Droplets className="size-3" /> گروه خونی
              </p>
              <p className="text-3xl font-black tracking-wide" dir="ltr">
                {data.bloodType}
              </p>
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/25 pt-2 text-sm font-bold">
          <span className="text-lg">{data.name}</span>
          <span dir="ltr">{toPersianDigits(data.nationalId)}</span>
          {data.age ? <span>{toPersianDigits(data.age)} ساله</span> : null}
          {data.sex ? <span>{SEX_LABEL[data.sex]}</span> : null}
        </div>
      </div>

      {/* Allergies */}
      <Section
        icon={AlertTriangle}
        title="آلرژی‌ها"
        tone={data.allergies.length ? "danger" : "default"}
      >
        {data.allergies.length === 0 ? (
          <p className="text-sm text-gray-500">آلرژی شناخته‌شده ندارد</p>
        ) : (
          <ul className="space-y-1">
            {data.allergies.map((a, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm font-bold text-red-700"
              >
                <span>
                  {a.name}
                  <span className="ms-1 text-xs font-medium text-gray-600">
                    ({SEVERITY[a.severity]})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Warnings */}
      {data.warnings.length > 0 && (
        <Section icon={Siren} title="هشدارهای ویژه" tone="danger">
          <ul className="list-inside list-disc space-y-1 text-sm font-bold text-red-700">
            {data.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Chronic diseases */}
      <Section icon={HeartPulse} title="بیماری‌های زمینه‌ای">
        {data.chronicDiseases.length === 0 ? (
          <p className="text-sm text-gray-500">موردی ثبت نشده است</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {data.chronicDiseases.map((d, i) => (
              <span
                key={i}
                className="rounded-md bg-gray-100 px-2 py-1 text-sm font-semibold"
              >
                {d}
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* Medications */}
      <Section icon={Pill} title="داروهای فعلی">
        {data.medications.length === 0 ? (
          <p className="text-sm text-gray-500">دارویی مصرف نمی‌کند</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {data.medications.map((m, i) => (
              <li key={i} className="font-semibold">
                {m}
              </li>
            ))}
          </ul>
        )}
        {data.implants.length > 0 && (
          <p className="mt-2 border-t pt-2 text-sm">
            <b>ایمپلنت / دستگاه:</b> {data.implants.join("، ")}
          </p>
        )}
        {data.transfusionRefusal && (
          <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm font-bold text-red-700">
            بیمار از تزریق خون امتناع می‌کند — در انتقال خون مراقبت ویژه لازم
            است.
          </p>
        )}
      </Section>

      {/* Contacts */}
      <Section icon={Phone} title="تماس‌های اضطراری">
        {data.contacts.length === 0 ? (
          <p className="text-sm text-gray-500">ثبت نشده است</p>
        ) : (
          <ul className="space-y-2">
            {data.contacts.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-sm">
                  <b>{c.name}</b>{" "}
                  <span className="text-xs text-gray-500">({c.relation})</span>
                </span>
                <a
                  href={`tel:${c.phone}`}
                  className="flex min-h-11 items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white"
                >
                  <Phone className="size-4" />
                  <span dir="ltr">{toPersianDigits(c.phone)}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Tracking codes */}
      {data.trackingCodes.length > 0 && (
        <Section icon={Pill} title="آخرین کدهای پیگیری نسخه">
          <ul className="space-y-2">
            {data.trackingCodes.map((t, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-100 px-3 py-2"
              >
                <div>
                  <code dir="ltr" className="text-sm font-extrabold">
                    {t.code}
                  </code>
                  <p className="text-[11px] text-gray-600">
                    {t.diagnosis} • {formatDateTimeJalali(t.date)}
                  </p>
                </div>
                <CopyButton text={t.code} label="کپی" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* QR + sync info */}
      <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-gray-300 bg-white p-3 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-start">
          <p className="text-sm font-bold text-gray-900">کد QR کارت اورژانس</p>
          <p className="mt-1 max-w-xs text-xs text-gray-600">
            این کد را اسکن کنید تا خلاصه اطلاعات حیاتی بیمار نمایش داده شود.
          </p>
          {lastSyncedAt && (
            <p className="mt-2 text-xs text-gray-500">
              آخرین همگام‌سازی: {formatDateTimeJalali(lastSyncedAt)}
            </p>
          )}
        </div>
        <div className="rounded-lg border p-2">
          <QRCodeSVG value={qrText} size={96} />
        </div>
      </div>
    </div>
  );
}
