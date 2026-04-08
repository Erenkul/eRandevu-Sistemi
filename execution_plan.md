# eRandevu — Execution Plan with Sub-Agent Strategy

**Date:** April 7, 2026  
**Goal:** Complete remaining remediation phases efficiently using parallel sub-agents

---

## Strategy Overview

Sub-agents work best when tasks are:
- **Independent** — no shared file conflicts
- **Well-scoped** — clear inputs, outputs, and acceptance criteria
- **Same-convention** — follow existing codebase patterns

Tasks that **should NOT** be parallelized:
- Editing the same file
- Dependent migrations (e.g., types before components that use them)
- Integration testing after refactors

---

## Phase 1: Remaining Security Fixes (~8 hrs) — DEFERRED

> **Moved to later sprint.** Will handle after core refactoring and testing are complete.

### Agent A: Phone Verification (H3) — 4 hrs
**Scope:** `functions/src/index.ts`, `frontend/src/pages/LoginPage.tsx`
- Create `sendVerificationCode` callable function
- Create `verifyCode` callable function
- Update LoginPage to use real verification flow
- Wire up SMSService for code delivery

**Acceptance:** TypeScript compiles, user can request + verify code via SMS

### Agent B: KVKK/GDPR Compliance (H4) — 4 hrs
**Scope:** `firestore.rules`, `functions/src/index.ts`
- Add `deleteCustomerData` callable function
- Add `purgeExpiredAppointments` scheduled function
- Add retention policy fields to business schema
- Add Firestore rules for erasure access control

**Acceptance:** Functions compile, rules deploy, erasure flow works end-to-end

> These two agents are **independent** — different files, different concerns. Run in parallel.

---

## Phase 2: Foundation Refactoring (~15 hrs) — ✅ COMPLETE

### Agent C: TypeScript Cleanup + Types Consolidation — ✅ DONE
**Scope:** `frontend/src/types/index.ts`, `frontend/src/contexts/AuthContext.tsx`, all files with `any`
- Consolidated `User` interface into `types/index.ts`
- Deleted duplicate type from AuthContext
- Replaced all `any` with proper types (`FirebaseError`, `Error | unknown`, `Timestamp`)
- Verified with `tsc --noEmit` — zero errors

**Acceptance:** ✅ Zero TypeScript errors, no duplicate types, no `any` in production code

### Agent D: Error Boundary + Toast Migration — ✅ DONE
**Scope:** `frontend/src/components/error/ErrorBoundary.tsx` (new), `App.tsx`, all pages with `alert()`
- Created ErrorBoundary component
- Wrapped App.tsx with ErrorBoundary
- Replaced all 6 `alert()` calls with `useToast()` in ServicesPage, SchedulePage, StaffPage

**Acceptance:** ✅ ErrorBoundary catches crashes, zero `alert()` calls remain in admin pages

### Agent E: Duplicate Hook Elimination — ✅ DONE
**Scope:** Deleted 5 standalone hook files, updated all imports
- Deleted: `useServices.ts`, `useStaff.ts`, `useDashboardStats.ts`, `useTodayAppointments.ts`, `useAvailableSlots.ts`
- Updated all imports in `hooks/index.ts` to re-export from `useFirestore.ts`
- Updated all 5 test files to import from `useFirestore.ts`
- Verified with `tsc --noEmit` — zero errors

**Acceptance:** ✅ All pages compile, hooks work from single source

> Agents C, D, E have **ordering dependency**: C must finish first (types), then D and E can run in parallel.

---

## Phase 3: Component Breakdown (~30 hrs) — ✅ COMPLETE

### Agent F: LoginPage Breakdown — ✅ DONE
**Scope:** `frontend/src/pages/LoginPage.tsx` (665 lines) → split into 9 files
- Created `LoginPage/` directory structure
- Extracted: RoleSelection, LoginForm, RegisterForm, PhoneVerification, BusinessRegistrationForm
- Created `usePhoneValidation` hook
- Created `phoneFormatter.ts` and `validators.ts` utils
- Fixed `PrimaryButton` usage and `any` type in RoleSelection

**Acceptance:** ✅ LoginPage works identically, all files < 200 lines

### Agent G: OnboardingWizard Breakdown — ✅ DONE
**Scope:** `frontend/src/pages/OnboardingWizard.tsx` (728 lines) → split into 7 files
- Created `OnboardingWizard/` directory structure
- Extracted: Step1BusinessInfo, Step2WorkingHours, Step3BusinessType, Step4Staff, Step5Preview
- Extracted `useOnboardingState` hook

**Acceptance:** ✅ Wizard flow works identically, all files < 200 lines

### Agent H: HomePage + CustomerDashboard Breakdown — ✅ DONE
**Scope:** `HomePage.tsx` (682 lines), `CustomerDashboard.tsx` (741 lines) → 4 files total
- Created `HomePage/HomePage.tsx` + `HomeBusinessCard.tsx`
- Created `CustomerDashboard/CustomerDashboard.tsx` + `HomeTab.tsx`
- Updated barrel exports in `pages/index.ts`
- Deleted old single-file pages

**Acceptance:** ✅ Both pages work identically, all files < 300 lines

> Agents F, G, H were fully independent — ran all 3 in parallel.

---

## Phase 4: Performance Optimization (~15 hrs) — ✅ COMPLETE

### Agent I: Code Splitting + React.memo — ✅ DONE
**Scope:** `frontend/src/App.tsx`, frequently re-rendered components
- Created `LoadingFallback.tsx` spinner component
- Converted all 11 page imports to `lazy()` with `.then(m => ({ default: m.X }))` pattern
- Wrapped `<Routes>` in `<Suspense fallback={<LoadingFallback />}>`
- Added `React.memo` to: `Card`, `CardHeader`, `CardBody`, `CardFooter`, `Button`, `PrimaryButton`, `SecondaryButton`, `TextButton`, `IconButton`, `HomeBusinessCard`, `StatCard`, `DashboardStats`, `TodaySchedule`
- Added `useCallback` to: `checkIsOpen`, `handleBooking`, `handleLogin`, `handleDashboard` in HomePage
- Wrapped `filteredBusinesses` in `useMemo` in HomePage

**Acceptance:** ✅ Zero TypeScript errors, all pages lazy-loaded, memo on all list-item components

### Agent J: CustomCursor + Skeleton Screens — ✅ DONE
**Scope:** `CustomCursor.tsx`, new `Skeleton.tsx` component
- Fixed CustomCursor: replaced `setMousePosition` on every mousemove with `useRef` + `requestAnimationFrame` loop, added `{ passive: true }` to event listener
- Created `Skeleton.tsx` with `Skeleton`, `SkeletonText`, `SkeletonCard`, `SkeletonStat` (shimmer animation)
- Added skeleton loading to: `DashboardStats` (4 SkeletonStat), `TodaySchedule` (SkeletonCard), `PopularServices` (SkeletonCard lines=4), `HomePage` (6 SkeletonCard grid)

**Acceptance:** ✅ No memory leak in cursor, shimmer skeleton states on all data pages

### Agent K: Responsive Design + Accessibility — ✅ DONE
**Scope:** CSS files, all interactive components, forms
- Added `role="banner"`, `role="navigation"` + `aria-label` to HomePage header/nav
- Added `role="dialog"` + `aria-modal="true"` to Modal component
- Added `aria-label` to all search inputs, form inputs in LoginPage (LoginForm, RegisterForm, PhoneVerification), ContactForm
- Added `aria-invalid` to form inputs when error state is active
- Added `role="navigation"` + `aria-label="Yönetici menüsü"` to AdminSidebar
- Added `aria-current="page"` to active sidebar link
- Added `role="img"` + `aria-label` to Logo component
- Added `role="alert"` to ErrorBoundary fallback
- Added `aria-label` to icon-only buttons (notifications, modal close, logout)
- Fixed TodaySchedule mobile responsive: flex-wrap on items at 640px
- Fixed Card mobile: `box-sizing`, `max-width: 100%`, `overflow: hidden`
- DashboardStats already had responsive breakpoints — no changes needed

**Acceptance:** ✅ ARIA labels on all interactive elements, form accessibility with aria-invalid, mobile grid fixes

> Agents I, J completed in parallel. Agent K completed after J. All three verified with `tsc --noEmit`.

### Code Review Fixes (Post Phase 4)
- Fixed `useFirestore.ts:20` — two import statements concatenated onto one line (build breaker)
- Fixed `AuthContext.tsx:293-294` — `delete updateData.uid/role` cast to `Record<string, unknown>` for strict TS compliance
- Fixed `App.tsx` — JSX indentation for ErrorBoundary/Suspense/Routes
- Fixed `Skeleton.tsx` — eliminated per-instance `<style>` tag duplication (now injects keyframes once into `<head>` via `ensureShimmerStyle()`)
- Fixed `Skeleton.tsx` — wrapped all 4 exports (`Skeleton`, `SkeletonText`, `SkeletonCard`, `SkeletonStat`) in `React.memo`

---

## Phase 5: Testing Expansion (~100 hrs) — 🔄 IN PROGRESS

### Agent L: Hook Tests — ✅ DONE (25 hrs)
**Scope:** All hooks in `useFirestore.ts`
- ✅ 14 hook test files, 133 tests, 86.7% line coverage on hooks
- All edge cases covered: loading states, error handling, undefined businessId, realtime subscriptions

**Acceptance:** ✅ 80%+ coverage on hook layer achieved

### Agent M: Service Layer Tests — ✅ DONE (30 hrs)
**Scope:** All service functions in `firestore.ts`
- ✅ 29 tests covering all service functions
- Transaction edge cases covered (conflict detection, cancelled/noShow bypass)
- 95.1% line coverage on services

**Acceptance:** ✅ 80%+ coverage on service layer achieved

### Agent N: Component Tests — 🔄 IN PROGRESS (35 hrs)
**Scope:** Booking flow + Admin pages
- ✅ Booking flow components tested (ServiceSelection, StaffSelection, DateTimeSelection, ContactForm, BookingSummary)
- ✅ UI components tested (Button, Card, Input)
- ✅ Auth components tested (ProtectedRoute, AuthContext)
- ✅ Admin pages tested: ServicesPage (15 tests, 91.4%), StaffPage (20 tests, 94.2%), SchedulePage (19 tests, 79%)
- ⏳ ClientsPage tests — not started
- ⏳ AdminDashboard tests — not started
- ⏳ AuthContext expanded tests (currently 21% lines)
- ⏳ ToastContext expanded tests (currently 30% lines)

**Current:** 261 tests across 32 files, all passing. Admin pages at 86-94% line coverage.

**Acceptance:** 🔄 80%+ coverage on components — partially met (booking + admin pages done, contexts pending)

### Agent O: E2E Tests — ⏳ PENDING (20 hrs)
**Scope:** Playwright test suite
- ⏳ Playwright config setup (dependency already in package.json)
- ⏳ Customer booking journey
- ⏳ Admin login & dashboard
- ⏳ Service management
- ⏳ Staff management
- ⏳ Appointment status management

**Acceptance:** ⏳ All 5 critical E2E journeys pass, CI runs them on PR

---

## Execution Order & Parallelism Map

```
Phase 1: Security — DEFERRED
├── Agent A (H3: Phone Verification) ────┐  PARALLEL (later)
└── Agent B (H4: KVKK/GDPR) ─────────────┘

Phase 2: Foundation — ✅ COMPLETE
├── Agent C (TypeScript Cleanup) ──────── ✅ DONE
├── Agent D (Error Boundary + Toast) ──── ✅ DONE
└── Agent E (Delete Duplicate Hooks) ──── ✅ DONE

Phase 3: Component Breakdown — ✅ COMPLETE
├── Agent F (LoginPage) ───────────────── ✅ DONE
├── Agent G (OnboardingWizard) ────────── ✅ DONE  (ALL PARALLEL)
└── Agent H (HomePage + Dashboard) ────── ✅ DONE

Phase 4: Performance — ✅ COMPLETE
├── Agent I (Code Splitting + memo) ───── ✅ DONE (PARALLEL with J)
├── Agent J (Cursor + Skeletons) ──────── ✅ DONE (PARALLEL with I)
└── Agent K (Responsive + A11y) ───────── ✅ DONE (after J)

Phase 5: Testing — 🔄 IN PROGRESS
├── Agent L (Hook Tests) ────────────────── ✅ DONE (86.7% lines)
├── Agent M (Service Tests) ─────────────── ✅ DONE (95.1% lines)
├── Agent N (Component Tests) ───────────── 🔄 IN PROGRESS (admin pages done, contexts pending)
└── Agent O (E2E Tests) ─────────────────── ⏳ PENDING
```

---

## Recommended Sprint Order

| Sprint | Agents | Duration | Parallelism | Status |
|---|---|---|---|---|
| ~~**Sprint 1**~~ | ~~C → D, E~~ | ~~1.5 days~~ | ~~1 then 2 parallel~~ | ✅ COMPLETE |
| **Sprint 1** | F, G, H | 2 days | 3 agents parallel | ✅ COMPLETE |
| **Sprint 2** | I, J → K | 1.5 days | 2 then 1 | ✅ COMPLETE |
| **Sprint 3** | L ✅, M ✅, N 🔄, O ⏳ | 5 days | Overlapping pyramid | 🔄 IN PROGRESS |
| **Sprint 4** | A, B | 1 day | 2 parallel (deferred security) | ⏳ Deferred |

**Total estimated wall-clock time: ~11 days** (Phase 1 deferred, same total)

---

## Per-Agent Task Template

When launching a sub-agent, use this structure:

```
You are working on eRandevu remediation — Agent [X]: [Name]

Scope:
- Files to modify: [...]
- Files to create: [...]
- Files to delete: [...]

Requirements:
1. [Specific requirement]
2. [Specific requirement]
3. [Specific requirement]

Conventions:
- Follow existing code style in the project
- No comments unless asked
- TypeScript strict mode
- Turkish UI text, English code

Acceptance criteria:
- [ ] TypeScript compiles with no errors
- [ ] No lint errors
- [ ] [Specific functional criteria]

Do NOT:
- Modify files outside your scope
- Change unrelated code
- Add documentation files
```

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Merge conflicts from parallel agents | Each agent works on disjoint file sets |
| Breaking changes from refactors | Run `tsc --noEmit` and `npm run lint` after each agent |
| Test failures after component breakdown | Run existing 162 tests after Phase 3 |
| Performance regression | Compare bundle size before/after Phase 4 |
