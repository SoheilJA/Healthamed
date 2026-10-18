// Panel layout (doctor/admin): sidebar on desktop, sheet on mobile.
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from './logo'
import { NotificationBell, SyncIndicator, ThemeToggle } from './header-widgets'
import { auth } from '@/services'
import { getCurrentUser } from '@/services/authService'
import { useAuthStore } from '@/stores'
import { cn, initialsOf } from '@/lib/utils'
import { useState } from 'react'

export interface PanelNavItem {
  to: string
  label: string
  icon: LucideIcon
}

export function PanelLayout({
  items,
  panelTitle,
  panelIcon: PanelIcon,
  homeRoute
}: {
  items: PanelNavItem[]
  panelTitle: string
  panelIcon: LucideIcon
  homeRoute: string
}) {
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.userId)
  const user = userId ? getCurrentUser() : null
  const [mobileOpen, setMobileOpen] = useState(false)

  const doLogout = () => {
    auth.logout()
    navigate('/login', { replace: true })
  }

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 space-y-1 px-3 py-4" dir="rtl">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === homeRoute}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  const PanelHeader = () => (
    <div className="flex items-center gap-2 border-b p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <PanelIcon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-bold leading-tight">{panelTitle}</p>
        <p className="text-[11px] text-muted-foreground">{user?.fullName}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-muted/30">
      <div className="flex">
        {/* desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-l bg-background lg:flex">
          <div className="border-b p-4">
            <NavLink to="/">
              <Logo />
            </NavLink>
          </div>
          <PanelHeader />
          <NavLinks />
          <div className="border-t p-3">
            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={doLogout}>
              <LogOut className="h-4 w-4" />
              خروج از حساب
            </Button>
          </div>
        </aside>

        {/* main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b bg-background/80 pt-safe backdrop-blur">
            <div className="flex h-14 items-center justify-between gap-2 px-4">
              <div className="flex items-center gap-2 lg:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="منو">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72 p-0">
                    <SheetTitle className="sr-only">منوی پنل</SheetTitle>
                    <div className="flex h-full flex-col">
                      <div className="flex items-center justify-between border-b p-4">
                        <Logo />
                        <Button variant="ghost" size="iconSm" onClick={() => setMobileOpen(false)} aria-label="بستن">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <PanelHeader />
                      <NavLinks onNavigate={() => setMobileOpen(false)} />
                      <div className="mt-auto border-t p-3">
                        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={doLogout}>
                          <LogOut className="h-4 w-4" />
                          خروج از حساب
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <span className="font-bold lg:hidden">{panelTitle}</span>
              </div>
              <div className="hidden lg:block" />
              <div className="flex items-center gap-1">
                <SyncIndicator />
                <NotificationBell />
                <ThemeToggle />
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className="text-xs">{initialsOf(user?.fullName ?? 'کاربر')}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
