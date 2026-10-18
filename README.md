# Healthamed (هلثامد) — Persian Digital Health MVP

A fully offline-capable, RTL-first digital health platform operated by a pharmaceutical company.
Patients consult doctors over text chat, receive **electronic prescriptions with tracking codes**
(کد پیگیری — required alongside the national ID to buy medication in Iran), order from partner
pharmacies or take just the tracking code to any pharmacy, and carry a printable
**offline Emergency Card** (PWA + IndexedDB).

Everything runs locally — **no CDN, no external requests, no backend**.
Fonts (Vazirmatn), icons (Lucide), images (generated PNG/SVG) are all bundled.

```
npm install && npm run dev     # http://localhost:5173
```

- Node **>= 18** required. The `predev`/`prebuild` hooks regenerate PWA icons automatically.
- Production: `npm run build && npm run preview`

---

## Demo accounts (OTP is always **12345**)

| Role | Mobile | Notes |
|------|--------|-------|
| Patient (complete profile) | `09190000001` | Zahra Mohammad — has history, live visit, prescriptions, orders |
| Patient (incomplete profile) | `09190000002` | Ali Rezaei — medical profile wizard not finished (doctors list is gated) |
| Doctor | `09190000010` (password `doctor123`) | Dr. Amir Hosseini — internal medicine, queue with waiting patients |
| Admin | `09190000020` (password `admin123`) | Full admin panel |

Quick-login buttons for all four roles are on the login page.

The mock database seeds deterministically (mulberry32): **1,000 batch patients**, 43 doctors
(3 pending approval), 6 pharmacies, ~500 historical visits/prescriptions/orders/reviews,
notifications and an audit log. Reset anytime with `window.__resetHealthamed()` in the console.

---

## User flows

### Patient
1. Register (name + mobile + national ID with real checksum validation) → OTP.
2. Complete the **8-step medical profile wizard** (auto-saved draft in localStorage):
   base info → body metrics → address → emergency contact → allergies → chronic conditions →
   current medications → lifestyle & insurance.
3. Browse doctors (16 specialties, search, filters, pagination) — gated until profile is complete.
4. Pick a Jalali slot for the next 14 days → describe chief complaint → start text visit.
5. The demo doctor auto-replies contextually after 1.6–2.8 s with a typing indicator;
   visits auto-close after 35 idle minutes.
6. Prescription is issued with tracking code `HA-<jalaliYear>-<6digits>` + QR, stored in the
   record, and pushed to the offline snapshot.
7. Order from a partner pharmacy (quantities, address, totals) and watch the order progress
   (pending → confirmed → preparing → ready → delivered), or cancel early.
8. Emergency Card page: print-optimized card + QR + "sync for offline" (IndexedDB snapshot).
   Works with **no connection** (test via DevTools → Network → Offline).
9. Rate completed visits (5 stars).

### Doctor
- Dashboard with 7-day visit chart + live queue.
- Weekly schedule editor (per-weekday hours, 14-day Jalali calendar, day-off toggles).
- Visit room: chat + **patient summary side panel** (allergies, conditions, medications).
- Prescription writer with **live red warnings** for recorded allergies (Persian-alias aware,
  e.g. پنی‌سیلین ↔ `penicillin` tag), drug–drug interactions (warfarin × NSAIDs…) and
  duplicates. Issuing is blocked until the doctor acknowledges danger warnings.
- Patient files with visit history and issued prescriptions.

### Admin
- KPI dashboard (recharts: 14-day trend, specialty distribution, order status donut).
- Patient management: server-style paginated table, search, sort, filters,
  **CSV export** (BOM-prefixed UTF-8) and **CSV import with column mapping + preview**.
- Doctor approvals (approve / reject with reason / suspend).
- Pharmacy CRUD.
- Permission matrix (3 admin levels × modules; only the super-admin may edit).
- Audit log with search + pagination (every sensitive action is recorded).

### Extra routes
- `/design-system` — mini storybook of the whole design system.
- `/offline`, `/403`, `*` — offline / forbidden / 404 pages.

---

## Tech stack

| Concern | Choice |
|---------|--------|
| Framework | React 18 + Vite 5 + TypeScript (strict) |
| Routing | React Router v6 (all routes lazy-loaded) |
| UI | Tailwind CSS 3 + shadcn/ui source-inlined components, lucide-react icons |
| Forms | react-hook-form + zod (Persian error messages) |
| Server state | TanStack Query v5 (simulated latency 120–420 ms) |
| Client state | Zustand (persisted auth + UI) |
| Dates | Jalali calendar via embedded jalaali algorithm + `date-fns-jalali`; all user-visible dates are شمسی with Persian digits |
| Charts | recharts |
| Toasts | sonner (RTL) |
| PWA | vite-plugin-pwa (workbox precache, manifest fa/rtl/standalone) |
| Offline store | idb-keyval (emergency card + active prescriptions) |
| QR | qrcode.react (fully local) |
| Font | `@fontsource-variable/vazirmatn` (self-hosted npm package) |

Brand color `#04AB6C` with a 50–950 scale; light & dark themes; `DirectionProvider dir="rtl"`
(Radix) and logical CSS properties (`ms-*`, `ps-*`) everywhere; mobile bottom tab bar with
safe-area insets; print stylesheet for the emergency card.

## Architecture (swap-ready services)

`src/services/*` is a replaceable adapter layer over `src/services/db.ts` (localStorage-backed
mock with `requireOnline()` write-gating and an `OfflineError`). Replacing the layer with real
HTTP calls requires **zero page changes**:

```
src/
├── components/   ui/ (26 shadcn-style primitives) · shared/ (18 business components) · layout/
├── data/         catalog.ts (16 specialties, 44 drugs with interactions) · seed.ts (deterministic seed)
├── lib/          persian (digits, national-ID checksum) · jalali (calendar engine) · labels · validators · csv · offline
├── pages/        auth · patient (11 modules) · doctor (7) · admin (6) · landing · design-system · errors
├── routes/       router.tsx (lazy) · guards.tsx (auth/role/profile/approval)
├── services/     db · auth · patient · doctor · visit (auto-reply engine) · prescription (validation) · order (state machine) · admin · sync · notifications
├── stores.ts     zustand (auth persisted)
└── types/        domain model
```

See `PROJECT_MAP.md` for the full file-by-file map.

## Notes & limitations (MVP scope)

- Doctor auto-replies are in-memory timers; they don't survive a page reload.
- Auth is a mock (OTP `12345`, demo passwords). No real SMS/JWT.
- Order status advances ~40 s per stage for demo purposes.
- Data lives in `localStorage` (single key, ~2 MB with the seed) — clear it or call
  `window.__resetHealthamed()` to reseed.
