# eRandevu Frontend — UI Improvement Plan

## Goal

Redesign the frontend UI to match the 4 reference designs in `stitch_date_and_time_slot_selection/`, which use a modern, premium design language with:
- **Plus Jakarta Sans / Inter** typography
- **Royal blue (#2563EB)** accent color
- **Bento-card layouts** with soft shadows and rounded corners
- **Material Symbols Outlined** icons (replacing Lucide)
- **Glassmorphic** elements and clean whitespace

---

## Phase 1: Design System & Foundation

### 1.1 Install Tailwind CSS
The reference designs all use Tailwind. Install and configure it for the React project.

**Files to change:**
- `package.json` — add tailwindcss, postcss, autoprefixer
- `tailwind.config.ts` — [NEW] custom theme (colors, fonts, shadows, border-radius)
- `postcss.config.js` — [NEW]
- `src/index.css` — replace with Tailwind directives + custom utilities

**Custom Theme Tokens:**
```
colors:
  royal-blue: #2563EB
  primary: #0f172a
  secondary: #64748b
  surface-light: #ffffff
  canvas-light: #f8fafc
  accent-blue: #eff6ff
  border-subtle: #e2e8f0

fonts:
  sans: Plus Jakarta Sans (admin), Inter (booking)

shadows:
  soft: 0 2px 4px rgba(0,0,0,0.02)
  glass: 0 8px 32px rgba(31,38,135,0.07)
  card: 0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)
  fab: 0 8px 20px -4px rgba(37,99,235,0.5)
```

### 1.2 Add Google Fonts & Material Symbols
- Add `Plus Jakarta Sans` and `Inter` via Google Fonts in `index.html`
- Add `Material Symbols Outlined` icon font
- Remove `lucide-react` dependency (or keep for admin-only if needed)

---

## Phase 2: Admin Dashboard Redesign

**Reference:** `stitch/barber_shop_admin_dashboard/`

### 2.1 AdminSidebar Redesign
**File:** `src/components/admin/AdminSidebar.tsx` + `.css`
- Collapsible sidebar: 80px (icon-only) on mobile, 256px on desktop
- Royal blue icon branding top-left
- Active nav item: `bg-royal-blue/5` with ring highlight
- Profile section at bottom with avatar

### 2.2 DashboardStats Bento Cards
**File:** `src/components/admin/DashboardStats.tsx` + `.css`
- Revenue card: spans 2 columns, left blue border, progress bar, "+15%" trend badge
- Active Appointments card: icon + count, "Today" label
- Cancellations card: rose accent, negative trend badge
- All cards: `bento-card` class (rounded-2xl, shadow-sm, hover:shadow-md)

### 2.3 TodaySchedule Table
**File:** `src/components/admin/TodaySchedule.tsx` + `.css`
- Clean table with Client (avatar initials), Service, Barber, Time, Status columns
- Status chips: emerald (Confirmed), amber (Pending), slate (Completed)
- "All Barbers" and "Filter" buttons in header
- Hover row highlight

### 2.4 PopularServices + Quick Stats
**File:** `src/components/admin/PopularServices.tsx` + `.css`
- Progress bars with royal-blue fill and percentage labels
- Quick Stats card: dark (slate-900) background, grid of 2x2 stats
- Capacity progress bar (emerald)

### 2.5 FAB Button
- Fixed bottom-right: royal-blue, rounded-full, shadow-fab
- "+ NEW APPOINTMENT" text with rotating icon on hover

### 2.6 Admin Top Bar
- Search input with icon
- Notification bell with red dot badge
- Clean header with welcome text

---

## Phase 3: Booking Flow Redesign

The booking page has 3 steps, each matching a stitch reference.

### 3.1 Step 1 — Service & Barber Selection
**Reference:** `stitch/service_and_barber_selection_screen/`

**Files:** `src/components/booking/ServiceSelection.tsx`, `StaffSelection.tsx`
- **Layout:** Left sidebar (business info + nav) + main content area
- **Service cards:** Card with icon, title, description, duration, price. Selected state: blue border + checkmark
- **Category filter pills:** All Services | Hair Styling | Beard Trim | Skin Care
- **Barber cards:** Photo + name + role. Selected: blue left border + check badge
- **Floating bottom bar:** Selected service summary + duration + total price + Back/Continue buttons

### 3.2 Step 2 — Date & Time Selection
**Reference:** `stitch/date_and_time_slot_selection/`

**File:** `src/components/booking/DateTimeSelection.tsx`
- **Calendar grid:** 7-col grid, selected date = primary circle with shadow
- **Selected Date sidebar:** Large date display + legend (Selected/Available/Booked)
- **Time slots:** Grouped by Morning/Afternoon/Evening with icons
  - Available: white border
  - Selected: dark bg + checkmark
  - Booked: dashed border, disabled
- **Booking Summary sidebar:** Barber photo, selected services, date/time, total price, "Confirm" CTA

### 3.3 Step 3 — Summary & Checkout
**Reference:** `stitch/booking_summary_and_checkout/`

**File:** `src/components/booking/ContactForm.tsx`, `BookingSummary.tsx`
- **Contact form:** Floating labels (peer-placeholder pattern), name/phone/email
- **WhatsApp reminder toggle:** Green toggle with description
- **KVKK notice:** Privacy policy link
- **Booking summary card:** Glassmorphic with gradient top border
  - Barber photo + name
  - Time display (large/bold)
  - Service line items
  - Total amount with "taxes included"
  - "Randevuyu Onayla" CTA button
  - Trust badges at bottom

### 3.4 Progress Stepper
- 3-step stepper (Services → Date & Time → Confirm)
- Completed steps: primary circle + checkmark
- Active step: primary border + bold label
- Future steps: gray, opacity-50

---

## Phase 4: Shared UI Components

### New/Updated Components
| Component | Status | Changes |
|-----------|--------|---------|
| `Button` | Update | Tailwind variants (primary/secondary/ghost), sizes |
| `Card` | Update | `bento-card` utility class |
| `Input` | Update | Floating label pattern |
| `StatusChip` | [NEW] | Colored status badges (confirmed/pending/completed/cancelled) |
| `ProgressStepper` | [NEW] | 3-step booking stepper |
| `FloatingBar` | [NEW] | Bottom summary bar for booking |
| `Avatar` | [NEW] | Initials-based avatar with color coding |
| `Toggle` | [NEW] | WhatsApp-style toggle switch |

---

## Phase 5: Cleanup

- Remove old `.css` files as components migrate to Tailwind
- Remove unused Lucide imports
- Ensure consistent Turkish labels for customer-facing pages
- Ensure consistent English labels for admin-facing pages (or pick one language)

---

## Priority Order

1. **Phase 1** — Foundation (Tailwind + fonts + design tokens) — *Must do first*
2. **Phase 2** — Admin Dashboard — *Core user experience*
3. **Phase 3** — Booking Flow — *Customer-facing, revenue-critical*
4. **Phase 4** — Shared Components — *Do alongside Phase 2 & 3*
5. **Phase 5** — Cleanup — *Final polish*

---

## Estimated Effort

| Phase | Scope | Est. Files |
|-------|-------|-----------|
| Phase 1 | Foundation | ~5 files |
| Phase 2 | Admin Dashboard | ~12 files |
| Phase 3 | Booking Flow | ~15 files |
| Phase 4 | UI Components | ~8 files |
| Phase 5 | Cleanup | ~10 files |
| **Total** | | **~50 files** |
