// Patient layout: sticky header + desktop nav + mobile bottom tab bar.
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { CalendarRange, FileHeart, Home, LogOut, Stethoscope, UserRound } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Logo } from './Logo'
import { NotificationBell, SyncIndicator, ThemeToggle } from './header-widgets'
import { auth } from '@/services'
import { getCurrentUser } from '@/services/authService'
import { useAuthStore } from '@/stores'
import { cn } from '@/lib/utils'
import { initialsOf } from '@/lib/utils'

const NAV = [
  { to: '/app', label: 'خانه', icon: Home, end: true },
  { to: '/app/doctors', label: 'پزشکان', icon: Stethoscope, end: false },
  { to: '/app/visits', label: 'ویزیت‌ها', icon: CalendarRange, end: false },
  { to: '/app/records', label: 'پرونده من', icon: FileHeart, end: false },
  { to: '/app/profile', label: 'پروفایل', icon: UserRound, end: false }
]

export default function PatientLayout() {
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.userId)
  const user = userId ? getCurrentUser() : null

  const doLogout = () => {
    auth.logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-muted/30">
      {/* top header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 pt-safe backdrop-blur">
        <div className="container flex h-14 items-center justify-between gap-2">
          <NavLink to="/app">
            <Logo />
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex" dir="rtl">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <SyncIndicator />
            <NotificationBell />
            <ThemeToggle />
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <button type="button" className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="حساب کاربری">
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="text-xs">{initialsOf(user?.fullName ?? 'بیمار')}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="truncate">{user?.fullName}</p>
                  <p className="mt-0.5 font-normal text-xs text-muted-foreground" dir="ltr">
                    {String(user?.mobile ?? '').replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/app/profile')}>
                  <UserRound className="h-4 w-4" />
                  پروفایل من
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/emergency-card')}>
                  <FileHeart className="h-4 w-4" />
                  کارت اضطراری
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={doLogout}>
                  <LogOut className="h-4 w-4" />
                  خروج از حساب
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* page */}
      <main className="container pb-24 pt-6 md:pb-10">
        <Outlet />
      </main>

      {/* mobile bottom tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden pb-safe"
        aria-label="ناوبری اصلی"
      >
        <div className="grid grid-cols-5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-8 w-12 items-center justify-center rounded-full transition-colors',
                      isActive && 'bg-primary/10'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export function LogoutButton() {
  const navigate = useNavigate()
  return (
    <Button
      variant="ghost"
      onClick={() => {
        auth.logout()
        navigate('/login', { replace: true })
      }}
    >
      خروج
    </Button>
  )
}
