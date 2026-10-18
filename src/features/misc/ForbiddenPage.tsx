import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { useAuthStore } from "@/stores";
import { roleHome } from "@/routes/guards";
import { usePageTitle } from "@/hooks";

export default function ForbiddenPage() {
  usePageTitle("دسترسی غیرمجاز");
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-4 text-center">
      <Logo />
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX className="size-8 text-destructive" />
      </div>
      <div>
        <h1 className="text-xl font-bold">
          دسترسی به این بخش برای شما مجاز نیست
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          اگر فکر می‌کنید این یک اشتباه است، با پشتیبانی تماس بگیرید.
        </p>
      </div>
      <Button asChild>
        <Link to={user ? roleHome(user.role) : "/"}>بازگشت به پنل من</Link>
      </Button>
    </div>
  );
}
