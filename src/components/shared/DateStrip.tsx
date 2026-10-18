import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian";
import {
  JALALI_MONTHS,
  WEEKDAYS_MIN,
  addDays,
  diffInDays,
  formatJalali,
  getDateJalali,
  getMonthJalali,
  persianWeekday,
} from "@/lib/jalali";

interface DateStripProps {
  value: Date;
  onChange: (d: Date) => void;
  days?: number;
  startFrom?: Date;
}

export function DateStrip({
  value,
  onChange,
  days = 14,
  startFrom,
}: DateStripProps) {
  const dates = useMemo(() => {
    const start = startFrom ? new Date(startFrom) : new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: days }, (_, i) => addDays(start, i));
  }, [days, startFrom]);

  return (
    <div
      className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      role="tablist"
      aria-label="انتخاب روز"
    >
      {dates.map((d) => {
        const active =
          formatJalali(d, "yyyy-MM-dd") === formatJalali(value, "yyyy-MM-dd");
        const diff = diffInDays(d, new Date());
        const sub =
          diff === 0
            ? "امروز"
            : diff === 1
              ? "فردا"
              : JALALI_MONTHS[getMonthJalali(d)];
        return (
          <button
            key={d.toISOString()}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(d)}
            className={cn(
              "flex w-16 shrink-0 flex-col items-center rounded-xl border py-2 text-center transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:border-primary/40 hover:bg-accent",
            )}
          >
            <span
              className={cn(
                "text-xs",
                active ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {WEEKDAYS_MIN[persianWeekday(d)]}
            </span>
            <span className="text-lg font-bold">
              {toPersianDigits(getDateJalali(d))}
            </span>
            <span
              className={cn(
                "text-[10px]",
                active ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
