import { NavLink, Outlet } from "react-router-dom";
import {
  FolderOpen,
  Home,
  MessagesSquare,
  Pill,
  Stethoscope,
  UserRound,
  Siren,
  Bell,
} from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "@/components/shared/UserMenu";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/app", label: "خانه", icon: Home, end: true },
  { to: "/app/doctors", label: "پزشکان", icon: Stethoscope, end: false },
  { to: "/app/visits", label: "ویزیت‌ها", icon: MessagesSquare, end: false },
  { to: "/app/record", label: "پرونده من", icon: FolderOpen, end: false },
  { to: "/app/settings", label: "پروفایل", icon: UserRound, end: false },
];

const SIDEBAR_EXTRA = [
  { to: "/app/prescriptions", label: "نسخه‌ها", icon: Pill },
  { to: "/app/emergency", label: "کارت اورژانس", icon: Siren },
  { to: "/app/notifications", label: "اعلان‌ها", icon: Bell },
];

function SidebarLink({
  to,
  label,
  icon: Icon,
  end = false,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )
      }
    >
      <Icon className="size-5 shrink-0" />
      {label}
    </NavLink>
  );
}

export function PatientLayout() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 flex-col border-e bg-card md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Logo />
        </div>
        <nav
          className="flex-1 space-y-1 overflow-y-auto p-3"
          aria-label="منوی بیمار"
        >
          {TABS.filter((t) => t.to !== "/app/settings").map((t) => (
            <SidebarLink
              key={t.to}
              to={t.to}
              label={t.label === "پروفایل" ? "خانه" : t.label}
              icon={t.icon}
              end={t.end}
            />
          ))}
          {SIDEBAR_EXTRA.map((t) => (
            <SidebarLink key={t.to} to={t.to} label={t.label} icon={t.icon} />
          ))}
          <SidebarLink
            to="/app/settings"
            label="پروفایل و تنظیمات"
            icon={UserRound}
          />
        </nav>
        <div className="border-t p-3 text-center text-[10px] text-muted-foreground">
          هلثامد — نسخه نمایشی
        </div>
      </aside>

      {/* Main column */}
      <div className="md:ps-64">
        <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <div className="md:hidden">
              <Logo compact />
            </div>
            <div className="hidden md:block">
              <Logo />
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <NotificationBell linkBase="/app" />
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-4 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur safe-bottom md:hidden">
        <div
          className="grid grid-cols-5"
          role="tablist"
          aria-label="ناوبری اصلی"
        >
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <tab.icon className="size-5" />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
