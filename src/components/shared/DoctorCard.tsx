import { Link } from "react-router-dom";
import { CalendarClock, Users } from "lucide-react";
import type { DoctorListItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RatingStars } from "./RatingStars";
import { formatToman, toPersianDigits } from "@/lib/persian";
import { dayLabel, formatTime } from "@/lib/jalali";
import { hueFromString, initials } from "@/lib/utils";

export function DoctorCard({ doctor }: { doctor: DoctorListItem }) {
  const hue = hueFromString(doctor.name);
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="size-16 border">
            <AvatarFallback
              style={{
                backgroundColor: `hsl(${hue} 60% 88%)`,
                color: `hsl(${hue} 50% 30%)`,
              }}
              aria-hidden
            >
              {initials(doctor.name.replace("دکتر ", ""))}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  to={`/app/doctors/${doctor.id}`}
                  className="block truncate font-bold hover:text-primary"
                >
                  {doctor.name}
                </Link>
                <p className="truncate text-sm text-muted-foreground">
                  {doctor.specialtyName}
                </p>
              </div>
              {doctor.isOnline && (
                <Badge variant="success" className="shrink-0">
                  آنلاین
                </Badge>
              )}
            </div>
            <RatingStars
              value={doctor.ratingAvg}
              count={doctor.ratingCount}
              size={14}
              className="mt-1.5"
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />{" "}
                {toPersianDigits(doctor.patientsCount)} بیمار
              </span>
              <span>{toPersianDigits(doctor.yearsExperience)} سال سابقه</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
          <div>
            <p className="text-xs text-muted-foreground">ویزیت آنلاین</p>
            <p className="text-sm font-bold text-primary">
              {formatToman(doctor.visitFee)}
            </p>
          </div>
          {doctor.nextSlot ? (
            <div className="text-end text-xs text-muted-foreground">
              <span className="flex items-center justify-end gap-1">
                <CalendarClock className="size-3.5" /> نزدیک‌ترین نوبت
              </span>
              <span className="font-medium text-foreground">
                {dayLabel(doctor.nextSlot.at)} •{" "}
                {formatTime(doctor.nextSlot.at)}
              </span>
            </div>
          ) : (
            <Badge variant="muted">نوبت خالی ندارد</Badge>
          )}
        </div>
        <Button asChild className="mt-3 w-full">
          <Link to={`/app/doctors/${doctor.id}`}>مشاهده و رزرو نوبت</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
