# PROJECT_MAP — Healthamed MVP

Full file map of the deliverable. All code/comments are in English; all user-facing text
(UI labels, validation messages, seed data) is Persian.

## Root
| File | Purpose |
|------|---------|
| `package.json` | Pinned deps; `predev`/`prebuild` icon hooks |
| `vite.config.ts` | React + PWA manifest (fa/rtl/standalone, local icons), `@` alias |
| `tailwind.config.ts` | Brand green scale (50–950, `#04AB6C` = 600), semantic + chart colors, Vazirmatn, animations |
| `tsconfig.json` / `tsconfig.node.json` | Strict TS, bundler resolution |
| `postcss.config.cjs` | Tailwind + autoprefixer |
| `index.html` | `lang=fa dir=rtl`, inline first-paint splash, theme-color |
| `scripts/generate-icons.mjs` | Zero-dependency PNG encoder (zlib + CRC32), 4x supersampling; generates `pwa-192x192`, `pwa-512x512`, `maskable-icon-512`, `apple-touch-icon` |
| `public/favicon.svg`, `public/icon.svg` | Brand mark (green rounded square + white cross) |
| `README.md` / `PROJECT_MAP.md` | Docs |

## src/lib
| File | Purpose |
|------|---------|
| `utils.ts` | `cn`, uid, hash, toman formatting, initials, avatar hue |
| `persian.ts` | Digit conversion, **Iranian national-ID checksum** (validate/generate), mobile/postal validation, masking |
| `jalali.ts` | Embedded jalaali conversion algorithm, month grid builder, weekday math, `dateKey`, formatters (`full/medium/short/relative`), age, `nextDateKeys(±n)` |
| `labels.ts` | Persian labels for every enum (visit/prescription/order/doctor status, gender, urgency, lifestyle, severity, cities, insurers, audit actions) |
| `icons.ts` | Specialty → Lucide icon map (16) |
| `validators.ts` | zod schemas (OTP, registrations, allergy/chronic/medication, pharmacy, prescription item) |
| `csv.ts` | RFC4180 parser + BOM-prefixed exporter + download helper |
| `offline.ts` | `OfflineSnapshot` types + idb-keyval accessors + age helper |

## src/data
| File | Purpose |
|------|---------|
| `catalog.ts` | 16 specialties, 44 drugs (forms, prices, allergy tags, interaction lists), common allergens, chief complaints, chronic conditions pool, health tips, name pools |
| `seed.ts` | `mulberry32(14031403)` deterministic seed: demo users, 1002 patients, 43 doctors (3 pending), 6 pharmacies, ~500 historical visits/rx/orders/reviews, notifications, 60 audit entries; `PERMISSIONS` matrix + level presets |

## src/services (replaceable adapter layer)
| File | Purpose |
|------|---------|
| `db.ts` | localStorage persistence (debounced), simulated latency, `requireOnline()` write gate, `OfflineError`, reset hook |
| `helpers.ts` | `buildSlots` (deterministic 26% reservation + booked/past), `buildEmergencyCard`, `computeCompletion` |
| `authService.ts` | OTP flow (`12345`), demo logins, patient/doctor registration, password login |
| `patientService.ts` | Profile/wizard save, doctor directory (paged), slots, visit start, ratings, prescriptions, pharmacies, order creation + time-based status machine, emergency card |
| `doctorService.ts` | Dashboard aggregates, schedule read/update, queue, patient files, profile edit |
| `visitService.ts` | Chat send (role-checked), **contextual auto-reply engine** (typing indicator, 1.6–2.8 s delay, 35-min idle close) |
| `prescriptionService.ts` | Tracking code `HA-<year>-<6>`, **allergy (alias-aware) + interaction + duplicate validation**, issue + offline snapshot refresh |
| `adminService.ts` | KPIs, patient queries (search/sort/filter/page), CSV import with row-level validation, doctor status changes, pharmacy CRUD, permission matrix, audit |
| `syncService.ts` | Offline snapshot builder/loader (idb-keyval) |
| `notificationService.ts` | In-app notifications |

## src/components
- `ui/` — 26 shadcn-style primitives: button, input, textarea, label, card, badge, avatar,
  checkbox, radio-group, switch, select, tabs, dialog, sheet, popover, tooltip, dropdown-menu,
  progress, skeleton, table, separator, command, scroll-area, **form (react-hook-form)**,
  alert, sonner.
- `shared/` — states (PageHeader/EmptyState/ErrorState/StatCard), rating-stars, doctor-card,
  slot-picker, chat-bubble (+typing), prescription-card (QR), emergency-card-view,
  confirm-dialog, data-table (+pager), search-input, jalali-date-picker, stepper, file-uploader.
- `layout/` — theme-provider, logo, header-widgets (theme toggle, sync indicator,
  notification bell), patient-layout (bottom tabs), panel-layout (sidebar + mobile sheet),
  role-layouts (doctor/admin).

## src/pages
| Area | Files |
|------|-------|
| Public | `landing`, `design-system`, `errors` (404/403/offline) |
| Auth | `login` (OTP + demo), `register-patient`, `register-doctor`, `forgot-password` |
| Patient (`/app`) | dashboard, doctors, doctor-detail, visits, visit-detail (chat+rx+rating), records (tabs), **wizard** (8 steps + draft autosave), emergency-card (print/offline), pharmacies (+order dialog), orders (timeline), profile |
| Doctor (`/panel`) | dashboard, schedule, visits, visit-room (chat + patient panel + prescription writer), patients, patient-file, profile |
| Admin (`/admin`) | dashboard (recharts), patients (+CSV import/export), doctors (approvals), pharmacies (CRUD), permissions (matrix), audit |

## src/routes
`router.tsx` — lazy routes, `PageSkeleton` fallback.
`guards.tsx` — `RequireAuth`, `RequireRole`, `RequireProfile` (blocks doctors list until
profile complete), `RequireApprovedDoctor`.

## State & entry
`stores.ts` (zustand: persisted `auth`, `ui`), `hooks.ts` (useOnline, useDebouncedValue,
useCountdown, useMediaQuery, useInstallPrompt, useLocalDraft, useDocTitle,
useAutoScrollBottom), `App.tsx` (QueryClient + DirectionProvider + ThemeProvider +
TooltipProvider + Toaster), `main.tsx` (font + css import, DB seed, splash removal).
