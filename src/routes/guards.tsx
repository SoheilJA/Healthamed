// Route guards: auth, role, profile completion, doctor approval.
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentUser } from '@/services/authService'
import { getMyPatient } from '@/services/patientService'
import { getMyDoctor } from '@/services/doctorService'
import { useAuthStore } from '@/stores'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/layout/Logo'
import { Link } from 'react-router-dom'

function CenteredMessage({ title, body, cta }: { title: string; body: string; cta?: { to: string; label: string } }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Logo />
          <h1 className="text-lg font-bold">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{body}</p>
          {cta && (
            <Button asChild className="mt-2">
              <Link to={cta.to}>{cta.label}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function RequireAuth() {
  const userId = useAuthStore((s) => s.userId)
  const location = useLocation()
  if (!userId) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function RequireRole({ role }: { role: 'patient' | 'doctor' | 'admin' }) {
  const user = getCurrentUser()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    return <Navigate to={user.role === 'patient' ? '/app' : user.role === 'doctor' ? '/panel' : '/admin'} replace />
  }
  return <Outlet />
}

/** Patients must finish the medical profile before browsing doctors. */
export function RequireProfile() {
  try {
    const patient = getMyPatient()
    if (patient.completion < 100) {
      return (
        <CenteredMessage
          title="پرونده پزشکی شما ناقص است"
          body="برای دریافت مشاوره از پزشکان، ابتدا باید پرونده پزشکی خود را تکمیل کنید. این اطلاعات به پزشک کمک می‌کند بهتر شما را راهنمایی کند."
          cta={{ to: '/app/records/wizard', label: 'تکمیل پرونده پزشکی' }}
        />
      )
    }
  } catch {
    return <Navigate to="/app/records/wizard" replace />
  }
  return <Outlet />
}

/** Doctors must be approved by admin. */
export function RequireApprovedDoctor() {
  try {
    const doctor = getMyDoctor()
    if (doctor.status !== 'approved') {
      return (
        <CenteredMessage
          title="حساب شما هنوز تأیید نشده است"
          body={`وضعیت فعلی: در انتظار تأیید مدیر. پس از بررسی مدارک، دسترسی شما فعال می‌شود. شماره پیگیری: ${doctor.medicalCouncilNumber}`}
        />
      )
    }
  } catch {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
