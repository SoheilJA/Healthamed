// Role-specific panel layouts.
import { Activity, Building2, CalendarRange, ClipboardList, FileClock, HeartPulse, LayoutDashboard, ShieldCheck, Stethoscope, UserRound, Users } from 'lucide-react'
import { PanelLayout, type PanelNavItem } from './panel-layout'

const DOCTOR_NAV: PanelNavItem[] = [
  { to: '/panel', label: 'داشبورد', icon: LayoutDashboard },
  { to: '/panel/schedule', label: 'برنامه هفتگی', icon: CalendarRange },
  { to: '/panel/visits', label: 'صف ویزیت‌ها', icon: ClipboardList },
  { to: '/panel/patients', label: 'بیماران من', icon: Users },
  { to: '/panel/profile', label: 'پروفایل پزشکی', icon: UserRound }
]

export function DoctorLayout() {
  return <PanelLayout items={DOCTOR_NAV} panelTitle="پنل پزشک" panelIcon={Stethoscope} homeRoute="/panel" />
}

const ADMIN_NAV: PanelNavItem[] = [
  { to: '/admin', label: 'داشبورد', icon: LayoutDashboard },
  { to: '/admin/patients', label: 'مدیریت بیماران', icon: Users },
  { to: '/admin/doctors', label: 'مدیریت پزشکان', icon: Activity },
  { to: '/admin/pharmacies', label: 'داروخانه‌ها', icon: Building2 },
  { to: '/admin/permissions', label: 'سطوح دسترسی', icon: ShieldCheck },
  { to: '/admin/audit', label: 'گزارش حسابرسی', icon: FileClock }
]

export function AdminLayout() {
  return <PanelLayout items={ADMIN_NAV} panelTitle="پنل مدیریت" panelIcon={HeartPulse} homeRoute="/admin" />
}
