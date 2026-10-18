import { useRef, type KeyboardEvent } from "react";
import { toEnglishDigits, toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 5,
  autoFocus = true,
  disabled,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = toEnglishDigits(value).split("");

  const handleChange = (i: number, raw: string) => {
    const digits = toEnglishDigits(raw).replace(/\D/g, "");
    if (!digits) {
      const next = [...chars];
      next[i] = "";
      onChange(next.join(""));
      return;
    }
    const next = [...chars];
    let idx = i;
    for (const d of digits) {
      if (idx >= length) break;
      next[idx] = d;
      idx++;
    }
    onChange(next.join(""));
    refs.current[Math.min(idx, length - 1)]?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !chars[i] && i > 0) {
      const next = [...chars];
      next[i - 1] = "";
      onChange(next.join(""));
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <div
      className="flex justify-center gap-2"
      dir="ltr"
      role="group"
      aria-label={`کد تایید ${toPersianDigits(length)} رقمی`}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          value={chars[i] ? toPersianDigits(chars[i]) : ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`رقم ${toPersianDigits(i + 1)}`}
          className={cn(
            "size-12 rounded-lg border border-input bg-background text-center text-xl font-bold shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
          )}
        />
      ))}
    </div>
  );
}
