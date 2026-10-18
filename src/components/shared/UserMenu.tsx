import { Link, useNavigate } from "react-router-dom";
import { LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores";
import { hueFromString, initials } from "@/lib/utils";

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (!user) return null;

  const hue = hueFromString(user.name);
  const roleLabel =
    user.role === "patient"
      ? "بیمار"
      : user.role === "doctor"
        ? "پزشک"
        : "مدیر";
  const settingsPath =
    user.role === "patient"
      ? "/app/settings"
      : user.role === "doctor"
        ? "/doctor/profile"
        : "/admin/settings";

  const handleLogout = () => {
    logout();
    toast.success("با موفقیت خارج شدید");
    navigate("/", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full pe-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="منوی کاربر"
        >
          <Avatar className="size-9">
            <AvatarFallback
              style={{
                backgroundColor: `hsl(${hue} 55% 88%)`,
                color: `hsl(${hue} 45% 30%)`,
              }}
              aria-hidden
            >
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
            {user.name}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          <p className="truncate">{user.name}</p>
          <p className="text-xs font-normal text-muted-foreground">
            {roleLabel}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={settingsPath}>
            <UserRound /> تنظیمات و پروفایل
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut /> خروج از حساب
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
