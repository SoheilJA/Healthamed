// Service layer barrel export.
export * from './db'
export * as auth from './authService'
export { DEMO_ACCOUNTS, DEMO_OTP } from './authService'
export * as patientApi from './patientService'
export * as doctorApi from './doctorService'
export { visitService as visitApi } from './visitService'
export { prescriptionService as prescriptionApi, validatePrescriptionItems } from './prescriptionService'
export { syncService as syncApi } from './syncService'
export { notificationService } from './notificationService'
export * as adminApi from './adminService'

// Frequently used view-model types
export type { AdminPatientRow, AdminDoctorRow, ImportRow, PatientQuery, AdminStats } from './adminService'
export type { DoctorCardData, VisitWithDoctor } from './patientService'
export type { QueueItem, DoctorPatientRow } from './doctorService'
