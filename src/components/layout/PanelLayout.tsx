import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Bell,
  Building2,
  CalendarClock,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Menu,
  Newspaper,
  PanelRightClose,
  Pill,
  ScrollText,
  Settings,
  ShieldCheck,
  Star,
  Upload,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "@/components/shared/UserMenu";
import { useUiStore } from "@/stores";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const DOCTOR_NAV: NavItem[] = [
  { to: "/doctor", label: "داشبورد", icon: LayoutDashboard, end: true },
  { to: "/doctor/schedule", label: "برنامه کاری", icon: CalendarClock },
  { to: "/doctor/visits", label: "ویزیت‌ها", icon: MessagesSquare },
  { to: "/doctor/patients", label: "بیماران", icon: Users },
  { to: "/doctor/reviews", label: "نظرات", icon: Star },
  { to: "/doctor/earnings", label: "درآمد", icon: Wallet },
  { to: "/doctor/notifications", label: "اعلان‌ها", icon: Bell },
  { to: "/doctor/profile", label: "پروفایل", icon: UserRound },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "داشبورد", icon: LayoutDashboard, end: true },
  { to: "/admin/patients", label: "بیماران", icon: Users },
  { to: "/admin/patients/import", label: "درون‌ریزی بیماران", icon: Upload },
  { to: "/admin/doctors", label: "پزشکان", icon: ClipboardList },
  { to: "/admin/visits", label: "ویزیت‌ها", icon: MessagesSquare },
  { to: "/admin/prescriptions", label: "نسخه‌ها", icon: FileText },
  { to: "/admin/orders", label: "سفارش‌ها", icon: Pill },
  { to: "/admin/pharmacies", label: "داروخانه‌ها", icon: Building2 },
  { to: "/admin/content", label: "محتوا و تخصص‌ها", icon: Newspaper },
  { to: "/admin/admins", label: "مدیران و نقش‌ها", icon: ShieldCheck },
  { to: "/admin/audit", label: "لاگ ممیزی", icon: ScrollText },
  { to: "/admin/settings", label: "تنظیمات", icon: Settings },
];

function NavList({
  items,
  collapsed,
  onNavigate,
}: {
  items: NavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav
      className="flex-1 space-y-1 overflow-y-auto p-3"
      aria-label="منوی اصلی"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          title={item.label}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              collapsed && "justify-center px-2",
            )
          }
        >
          <item.icon className="size-5 shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

export function PanelLayout({ role }: { role: "doctor" | "admin" }) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = role === "doctor" ? DOCTOR_NAV : ADMIN_NAV;
  const roleLabel = role === "doctor" ? "پنل پزشک" : "پنل مدیریت";
  const linkBase = role === "doctor" ? "/doctor" : "/admin";

  return (
    <div className="min-h-dvh bg-muted/30">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 hidden flex-col border-e bg-card transition-all md:flex",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b",
            collapsed ? "justify-center px-2" : "px-4",
          )}
        >
          {collapsed ? <Logo compact /> : <Logo />}
        </div>
        <NavList items={items} collapsed={collapsed} />
        <div className="shrink-0 border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full", collapsed && "px-0")}
            onClick={toggleSidebar}
            aria-label={collapsed ? "باز کردن منو" : "جمع کردن منو"}
          >
            <PanelRightClose
              className={cn(
                "size-4 transition-transform",
                collapsed && "rotate-180",
              )}
            />
            {!collapsed && <span>جمع کردن منو</span>}
          </Button>
        </div>
      </aside>

      {/* Main column */}
      <div
        className={cn(
          "flex min-h-dvh flex-col transition-all",
          collapsed ? "md:ps-[4.5rem]" : "md:ps-64",
        )}
      >
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="باز کردن منو"
          >
            <Menu className="size-5" />
          </Button>
          <span className="text-sm font-bold text-muted-foreground">
            {roleLabel}
          </span>
          <div className="ms-auto flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell linkBase={linkBase} />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-80 p-0">
          <SheetHeader className="border-b">
            <SheetTitle className="sr-only">منوی {roleLabel}</SheetTitle>
            <Logo />
          </SheetHeader>
          <NavList items={items} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
