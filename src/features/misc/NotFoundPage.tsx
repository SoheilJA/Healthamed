import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { usePageTitle } from "@/hooks";
import { toPersianDigits } from "@/lib/persian";

export default function NotFoundPage() {
  usePageTitle("صفحه پیدا نشد");
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-4 text-center">
      <Logo />
      <p className="text-7xl font-black text-primary/20">
        {toPersianDigits(404)}
      </p>
      <div>
        <h1 className="text-xl font-bold">
          صفحه‌ای که دنبال آن بودید پیدا نشد
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ممکن است آدرس اشتباه باشد یا این صفحه جابه‌جا شده باشد.
        </p>
      </div>
      <Button asChild>
        <Link to="/">
          <Home /> بازگشت به صفحه اصلی
        </Link>
      </Button>
    </div>
  );
}
