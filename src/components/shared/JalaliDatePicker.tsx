import { useMemo, useState, type ReactNode } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian";
import {
  JALALI_MONTHS,
  WEEKDAYS_MIN,
  addMonths,
  buildJalaliMonthGrid,
  formatJalaliLong,
  getDateJalali,
  getMonthJalali,
  getYearJalali,
  isSameDay,
  isToday,
  subMonths,
} from "@/lib/jalali";

interface JalaliDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  children?: ReactNode;
  className?: string;
}

export function JalaliDatePicker({
  value,
  onChange,
  disabled,
  children,
  className,
}: JalaliDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => value ?? new Date());
  const grid = useMemo(() => buildJalaliMonthGrid(viewMonth), [viewMonth]);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setViewMonth(value ?? new Date());
      }}
    >
      <PopoverTrigger asChild>
        {children ?? (
          <Button
            variant="outline"
            className={cn("w-full justify-between font-normal", className)}
          >
            {value ? formatJalaliLong(value) : "انتخاب تاریخ"}
            <CalendarDays className="size-4 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-center justify-between pb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            aria-label="ماه بعد"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="text-sm font-semibold">
            {JALALI_MONTHS[getMonthJalali(viewMonth)]}{" "}
            {toPersianDigits(getYearJalali(viewMonth))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
            aria-label="ماه قبل"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div
          className="grid grid-cols-7 gap-1"
          role="grid"
          aria-label="تقویم شمسی"
        >
          {WEEKDAYS_MIN.map((w, i) => (
            <div
              key={i}
              className="flex size-9 items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {w}
            </div>
          ))}
          {grid.map((day, i) =>
            day ? (
              <button
                key={i}
                type="button"
                disabled={disabled?.(day)}
                onClick={() => {
                  onChange(day);
                  setOpen(false);
                }}
                aria-label={formatJalaliLong(day)}
                aria-selected={!!value && isSameDay(day, value)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30",
                  isToday(day) && "border border-primary/40 font-bold",
                  value &&
                    isSameDay(day, value) &&
                    "bg-primary font-bold text-primary-foreground hover:bg-primary/90",
                )}
              >
                {toPersianDigits(getDateJalali(day))}
              </button>
            ) : (
              <div key={i} />
            ),
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
