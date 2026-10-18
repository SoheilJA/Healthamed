import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Info, Pill, Stethoscope } from "lucide-react";
import type { Prescription } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CopyButton } from "./CopyButton";
import { RX_STATUS } from "@/lib/labels";
import { formatJalali, formatJalaliWithWeekday } from "@/lib/jalali";
import { toPersianDigits } from "@/lib/persian";

type RxWithNames = Prescription & { doctorName?: string; patientName?: string };

interface PrescriptionCardProps {
  rx: RxWithNames;
  variant?: "compact" | "full";
  onOrder?: () => void;
  onTrackingOnly?: () => void;
  showDetailLink?: boolean;
}

const statusVariant: Record<
  Prescription["status"],
  "info" | "warning" | "success" | "muted"
> = {
  issued: "info",
  ordered: "warning",
  delivered: "success",
  expired: "muted",
};

export function PrescriptionCard({
  rx,
  variant = "full",
  onOrder,
  onTrackingOnly,
  showDetailLink,
}: PrescriptionCardProps) {
  if (variant === "compact") {
    return (
      <div className="w-full rounded-xl border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Pill className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">
              نسخه الکترونیک — {rx.diagnosis}
            </p>
            <p className="text-xs text-muted-foreground">
              {toPersianDigits(rx.drugs.length)} قلم دارو •{" "}
              {formatJalali(rx.issuedAt)}
              {rx.doctorName ? ` • ${rx.doctorName}` : ""}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2">
          <code dir="ltr" className="text-sm font-bold">
            {rx.trackingCode}
          </code>
          <CopyButton text={rx.trackingCode} label="کپی" />
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Pill className="size-5" />
            </span>
            <div>
              <CardTitle className="text-base">نسخه الکترونیک</CardTitle>
              <CardDescription>
                {formatJalaliWithWeekday(rx.issuedAt)}
                {rx.doctorName ? ` • ${rx.doctorName}` : ""}
              </CardDescription>
            </div>
          </div>
          <Badge variant={statusVariant[rx.status]}>
            {RX_STATUS[rx.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Tracking code block */}
        <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4">
          <p className="text-xs font-medium text-muted-foreground">
            کد پیگیری نسخه
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <code dir="ltr" className="text-xl font-extrabold tracking-wider">
              {rx.trackingCode}
            </code>
            <CopyButton text={rx.trackingCode} label="کپی کد" />
          </div>
          <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <div className="rounded-lg border bg-background p-2">
              <QRCodeSVG value={rx.trackingCode} size={80} />
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              برای خرید دارو از هر داروخانه‌ای، کد ملی خود و این کد پیگیری را به
              داروساز ارائه دهید. این کد در سامانه نسخه الکترونیک به کد ملی شما
              متصل است.
            </p>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="flex items-center gap-2 text-sm">
          <Stethoscope className="size-4 shrink-0 text-primary" />
          <span>
            <span className="text-muted-foreground">تشخیص: </span>
            <b>{rx.diagnosis}</b>
          </span>
        </div>

        {/* Drugs */}
        <div className="space-y-2">
          {rx.drugs.map((d, i) => (
            <div key={`${d.name}-${i}`} className="rounded-xl border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {toPersianDigits(i + 1)}. {d.name}
                </p>
                {d.form && <Badge variant="secondary">{d.form}</Badge>}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground sm:grid-cols-4">
                <span>دوز: {d.dose}</span>
                <span>{d.frequency}</span>
                <span>{toPersianDigits(d.durationDays)} روز مصرف</span>
                {d.quantity > 0 && (
                  <span>{toPersianDigits(d.quantity)} عدد</span>
                )}
                {d.instructions && (
                  <span className="col-span-2 sm:col-span-4">
                    توضیح: {d.instructions}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {rx.notes && (
          <Alert variant="info">
            <Info />
            <AlertDescription>{rx.notes}</AlertDescription>
          </Alert>
        )}

        {rx.status === "issued" && onOrder && onTrackingOnly && (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button onClick={onOrder}>سفارش از داروخانه‌های ما</Button>
            <Button variant="outline" onClick={onTrackingOnly}>
              فقط کد پیگیری را می‌خواهم
            </Button>
          </div>
        )}

        {showDetailLink && (
          <Button asChild variant="ghost" className="w-full">
            <Link to={`/app/prescriptions/${rx.id}`}>مشاهده جزئیات نسخه</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
