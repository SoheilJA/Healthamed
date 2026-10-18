import { useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks";

const DISMISS_KEY = "healthamed.installDismissed";

export function InstallPrompt() {
  const { canInstall, isIos, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "1",
  );

  if (dismissed) return null;
  // On non-iOS browsers only show when the browser actually fired beforeinstallprompt
  if (!isIos && !canInstall) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div
      className="fixed inset-x-3 bottom-16 z-50 rounded-xl border bg-card p-4 shadow-lg md:bottom-4 md:end-4 md:max-w-sm md:inset-x-auto"
      role="dialog"
      aria-label="نصب برنامه هلثامد"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute end-2 top-2 rounded-md p-1 text-muted-foreground hover:text-foreground"
        aria-label="بستن"
      >
        <X className="size-4" />
      </button>
      <p className="flex items-center gap-2 font-bold">
        <Download className="size-5 text-primary" />
        نصب هلثامد روی گوشی شما
      </p>
      {isIos ? (
        <div className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
          <p>در آیفون:</p>
          <p>
            ۱. روی آیکن <Share className="inline size-4" /> (اشتراک‌گذاری) در
            نوار پایین مرورگر سافاری بزنید.
          </p>
          <p>
            ۲. گزینه «Add to Home Screen» (
            <SquarePlus className="inline size-4" /> افزودن به صفحه اصلی) را
            انتخاب کنید.
          </p>
          <p>۳. کارت اورژانس حتی بدون اینترنت در دسترس خواهد بود.</p>
        </div>
      ) : (
        <div className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
          <p>
            با نصب برنامه، کارت اورژانس و کدهای پیگیری نسخه‌ها همیشه و حتی بدون
            اینترنت در دسترس شما خواهد بود.
          </p>
          <Button size="sm" onClick={() => void promptInstall()}>
            <Download /> نصب برنامه
          </Button>
        </div>
      )}
    </div>
  );
}
