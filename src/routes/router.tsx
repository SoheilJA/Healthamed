// App router: lazy-loaded routes with role guards.
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireApprovedDoctor, RequireAuth, RequireProfile, RequireRole } from './guards'
import { Skeleton } from '@/components/ui/skeleton'

const LandingPage = lazy(() => import('@/pages/landing'))
const LoginPage = lazy(() => import('@/pages/auth/login'))
const RegisterPatientPage = lazy(() => import('@/pages/auth/register-patient'))
const RegisterDoctorPage = lazy(() => import('@/pages/auth/register-doctor'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password'))
const OfflinePage = lazy(() => import('@/pages/errors').then((m) => ({ default: m.OfflinePage })))
const ForbiddenPage = lazy(() => import('@/pages/errors').then((m) => ({ default: m.ForbiddenPage })))
const NotFoundPage = lazy(() => import('@/pages/errors').then((m) => ({ default: m.NotFoundPage })))

const PatientLayout = lazy(() => import('@/components/layout/patient-layout'))
const DashboardPage = lazy(() => import('@/pages/patient/dashboard'))
const DoctorsPage = lazy(() => import('@/pages/patient/doctors'))
const DoctorDetailPage = lazy(() => import('@/pages/patient/doctor-detail'))
const VisitsPage = lazy(() => import('@/pages/patient/visits'))
const VisitDetailPage = lazy(() => import('@/pages/patient/visit-detail'))
const RecordsPage = lazy(() => import('@/pages/patient/records'))
const WizardPage = lazy(() => import('@/pages/patient/wizard'))
const EmergencyCardPage = lazy(() => import('@/pages/patient/emergency-card'))
const PharmaciesPage = lazy(() => import('@/pages/patient/pharmacies'))
const OrdersPage = lazy(() => import('@/pages/patient/orders'))
const ProfilePage = lazy(() => import('@/pages/patient/profile'))

const { DoctorLayout, AdminLayout } = {
  DoctorLayout: lazy(() => import('@/components/layout/role-layouts').then((m) => ({ default: m.DoctorLayout }))),
  AdminLayout: lazy(() => import('@/components/layout/role-layouts').then((m) => ({ default: m.AdminLayout })))
}

const DoctorDashboard = lazy(() => import('@/pages/doctor/dashboard'))
const DoctorSchedule = lazy(() => import('@/pages/doctor/schedule'))
const DoctorVisits = lazy(() => import('@/pages/doctor/visits'))
const DoctorVisitRoom = lazy(() => import('@/pages/doctor/visit-room'))
const DoctorPatients = lazy(() => import('@/pages/doctor/patients'))
const DoctorPatientFile = lazy(() => import('@/pages/doctor/patient-file'))
const DoctorProfile = lazy(() => import('@/pages/doctor/profile'))

const AdminDashboard = lazy(() => import('@/pages/admin/dashboard'))
const AdminPatients = lazy(() => import('@/pages/admin/patients'))
const AdminDoctors = lazy(() => import('@/pages/admin/doctors'))
const AdminPharmacies = lazy(() => import('@/pages/admin/pharmacies'))
const AdminPermissions = lazy(() => import('@/pages/admin/permissions'))
const AdminAudit = lazy(() => import('@/pages/admin/audit'))

const DesignSystemPage = lazy(() => import('@/pages/design-system'))

function PageSkeleton() {
  return (
    <div className="container space-y-4 py-8">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  )
}

function lazyEl(node: React.ReactNode) {
  return <Suspense fallback={<PageSkeleton />}>{node}</Suspense>
}

export const router = createBrowserRouter([
  { path: '/', element: lazyEl(<LandingPage />) },
  { path: '/login', element: lazyEl(<LoginPage />) },
  { path: '/register', element: lazyEl(<RegisterPatientPage />) },
  { path: '/register/doctor', element: lazyEl(<RegisterDoctorPage />) },
  { path: '/forgot-password', element: lazyEl(<ForgotPasswordPage />) },
  { path: '/offline', element: lazyEl(<OfflinePage />) },
  { path: '/design-system', element: lazyEl(<DesignSystemPage />) },

  // patient app
  {
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <RequireAuth />
      </Suspense>
    ),
    children: [
      {
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <RequireRole role="patient" />
          </Suspense>
        ),
        children: [
          {
            path: '/app',
            element: lazyEl(<PatientLayout />),
            children: [
              { index: true, element: lazyEl(<DashboardPage />) },
              {
                element: (
                  <Suspense fallback={<PageSkeleton />}>
                    <RequireProfile />
                  </Suspense>
                ),
                children: [
                  { path: 'doctors', element: lazyEl(<DoctorsPage />) },
                  { path: 'doctors/:id', element: lazyEl(<DoctorDetailPage />) }
                ]
              },
              { path: 'visits', element: lazyEl(<VisitsPage />) },
              { path: 'visits/:id', element: lazyEl(<VisitDetailPage />) },
              { path: 'records', element: lazyEl(<RecordsPage />) },
              { path: 'records/wizard', element: lazyEl(<WizardPage />) },
              { path: 'emergency-card', element: lazyEl(<EmergencyCardPage />) },
              { path: 'pharmacies', element: lazyEl(<PharmaciesPage />) },
              { path: 'orders', element: lazyEl(<OrdersPage />) },
              { path: 'profile', element: lazyEl(<ProfilePage />) }
            ]
          }
        ]
      },

      // doctor panel
      {
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <RequireRole role="doctor" />
          </Suspense>
        ),
        children: [
          {
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <RequireApprovedDoctor />
              </Suspense>
            ),
            children: [
              {
                path: '/panel',
                element: lazyEl(<DoctorLayout />),
                children: [
                  { index: true, element: lazyEl(<DoctorDashboard />) },
                  { path: 'schedule', element: lazyEl(<DoctorSchedule />) },
                  { path: 'visits', element: lazyEl(<DoctorVisits />) },
                  { path: 'visits/:id', element: lazyEl(<DoctorVisitRoom />) },
                  { path: 'patients', element: lazyEl(<DoctorPatients />) },
                  { path: 'patients/:id', element: lazyEl(<DoctorPatientFile />) },
                  { path: 'profile', element: lazyEl(<DoctorProfile />) }
                ]
              }
            ]
          }
        ]
      },

      // admin panel
      {
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <RequireRole role="admin" />
          </Suspense>
        ),
        children: [
          {
            path: '/admin',
            element: lazyEl(<AdminLayout />),
            children: [
              { index: true, element: lazyEl(<AdminDashboard />) },
              { path: 'patients', element: lazyEl(<AdminPatients />) },
              { path: 'doctors', element: lazyEl(<AdminDoctors />) },
              { path: 'pharmacies', element: lazyEl(<AdminPharmacies />) },
              { path: 'permissions', element: lazyEl(<AdminPermissions />) },
              { path: 'audit', element: lazyEl(<AdminAudit />) }
            ]
          }
        ]
      }
    ]
  },

  { path: '/403', element: lazyEl(<ForbiddenPage />) },
  { path: '*', element: lazyEl(<NotFoundPage />) }
])
