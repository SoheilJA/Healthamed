import { CloudOff } from "lucide-react";
import { useOnline } from "@/hooks";

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-[60] flex items-center justify-center gap-2 bg-warning px-4 py-1.5 text-xs font-semibold text-warning-foreground"
    >
      <CloudOff className="size-3.5 shrink-0" />
      اتصال اینترنت قطع است — کارت اورژانس و کدهای پیگیری همچنان در دسترس هستند.
    </div>
  );
}
