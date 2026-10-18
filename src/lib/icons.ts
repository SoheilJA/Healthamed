// Specialty -> Lucide icon mapping + pharmacy/drug icons.
import {
  Activity,
  Baby,
  Bone,
  Brain,
  ClipboardPlus,
  Cross,
  Droplets,
  Ear,
  Eye,
  HeartPulse,
  Layers,
  Leaf,
  Ribbon,
  Smile,
  Stethoscope,
  Thermometer,
  Wind,
  type LucideIcon
} from 'lucide-react'

export const SPECIALTY_ICONS: Record<string, LucideIcon> = {
  general: Stethoscope,
  internal: Thermometer,
  cardiology: HeartPulse,
  neurology: Brain,
  orthopedics: Bone,
  dermatology: Layers,
  psychiatry: Smile,
  pediatrics: Baby,
  gynecology: Ribbon,
  ent: Ear,
  ophthalmology: Eye,
  dentistry: Cross,
  nutrition: Leaf,
  endocrinology: Activity,
  urology: Droplets,
  pulmonology: Wind,
  admin: ClipboardPlus
}

export function specialtyIcon(id: string): LucideIcon {
  return SPECIALTY_ICONS[id] ?? Stethoscope
}
