# Test Improvement Plan - eRandevu

Our goal is to reach a robust level of confidence in the codebase through a multi-layered testing strategy.

## 1. Testing Strategy

We will follow the **Testing Trophy** model, prioritizing integration tests while maintaining a healthy base of unit tests and essential end-to-end (E2E) tests.

### Layers:
1.  **Unit Tests (Vitest):** Focus on pure functions, utility methods (in `src/lib`), and simple logic in custom hooks (`src/hooks`).
2.  **Component Tests (React Testing Library):** Verify that UI components render correctly and handle user interactions (click, type, etc.) as expected.
3.  **Integration Tests:** Focus on the interaction between multiple components and hooks, especially the booking flow and authentication states.
4.  **End-to-End Tests (Playwright):** Test critical user journeys like "Register -> Search Business -> Book Appointment".

## 2. Infrastructure

-   **Test Runner:** [Vitest](https://vitest.dev/) (Native for Vite, extremely fast).
-   **DOM Mocking:** [jsdom](https://github.com/jsdom/jsdom).
-   **Testing Library:** [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (Best practices for testing components from the user's perspective).
-   **Mocking APIs:** [Mock Service Worker (MSW)](https://mswjs.io/) to mock Firebase/API responses.
-   **E2E:** [@playwright/test](https://playwright.dev/) (already in devDependencies, not yet configured).

## 3. Current Status (April 8, 2026)

### Test Suite Overview

| Category | Files | Tests | Line Coverage | Status |
|---|---|---|---|---|
| **Hooks** | 14 | 133 | 86.7% | ✅ Complete |
| **Services** | 2 | 54 | 95.1% | ✅ Complete |
| **Booking Components** | 5 | ~30 | 88-100% | ✅ Complete |
| **UI Components** | 3 | ~15 | 72-100% | ✅ Complete |
| **Auth Components** | 2 | ~5 | 94% | ✅ Complete |
| **Admin Pages** | 3 | 57 | 79-94% | ✅ Complete |
| **Contexts** | 1 | 3 | 21-39% | ⏳ Needs expansion |
| **E2E** | 0 | 0 | — | ❌ Not started |
| **Total** | **32** | **261** | **76%** | 🔄 In progress |

### Coverage by Area

| Area | % Stmts | % Branch | % Funcs | % Lines |
|---|---|---|---|---|
| hooks/ | 86.71 | 81.01 | 87.71 | 86.17 |
| services/ | 95.12 | 77.27 | 98 | 95.21 |
| pages/admin/ | 86.32 | 73.09 | 86.48 | 87.72 |
| components/booking/ | 88.19 | 79.32 | 88.67 | 90.71 |
| contexts/ | 32.64 | 13.04 | 32.43 | 34.83 |

### Key Patterns Used

- **`within()` queries** for components with duplicate text (sidebar + main content)
- **`BrowserRouter` + `AuthProvider` + `ToastProvider`** wrapper for admin page tests
- **`vi.mock('react-router-dom', async (importOriginal) => { ... })`** for partial mocking
- **`screen.getByRole('heading', { name: '...' })`** for modal heading queries
- **Firebase service mocks** via `vi.mock('../../services/firestore')`
- **Context mocks** via `vi.mock('../../contexts')` returning controlled values

## 4. Priority Areas

### Phase 1: Foundation ✅ COMPLETE
-   [x] **Hook Testing:** All 14 hooks tested with edge cases
-   [x] **Services/Firebase:** All service functions tested with mock Firestore
-   [x] **Testing Infrastructure:** Vitest + MSW v2 + coverage configured

### Phase 2: Core Components ✅ COMPLETE
-   [x] **Booking Flow Components:** ServiceSelection, StaffSelection, DateTimeSelection, ContactForm, BookingSummary
-   [x] **Common UI Components:** Button, Card, Input
-   [x] **Auth Components:** ProtectedRoute, AuthContext basic tests

### Phase 3: Admin Pages ✅ COMPLETE
-   [x] **ServicesPage:** 15 tests — CRUD, search, category filter, modal, toggle active
-   [x] **StaffPage:** 20 tests — CRUD, search, phone validation, formatting, role display
-   [x] **SchedulePage:** 19 tests — day view, appointment detail modal, status updates, summary counts

### Phase 4: Remaining Coverage ⏳ NEXT
-   [ ] **AuthContext expanded tests** (login, logout, profile update, error states — currently 21% lines)
-   [ ] **ToastContext expanded tests** (show, auto-dismiss, different types — currently 30% lines)
-   [ ] **ThemeContext expanded tests** (currently 73% lines)
-   [ ] **ClientsPage tests**
-   [ ] **AdminDashboard tests**
-   [ ] **ErrorBoundary expanded tests** (currently 50% lines)

### Phase 5: E2E Tests ❌ NOT STARTED
-   [ ] **Playwright configuration** (`playwright.config.ts`, `e2e/` directory)
-   [ ] **Customer booking journey** (home → select business → pick service → pick staff → pick time → book)
-   [ ] **Admin login & dashboard** (login → view stats → navigate pages)
-   [ ] **Service management** (add/edit/delete service)
-   [ ] **Staff management** (add/edit/delete staff)
-   [ ] **Appointment status management** (view schedule → confirm/complete/cancel)

## 5. Coverage Goals

-   **Target:** 80% line coverage for business logic (`hooks`, `services`, `lib`).
-   **Critical Paths:** 100% test coverage for the appointment booking process.
-   **Current:** 76% lines overall. Hooks (86.7%) and services (95.1%) exceed target. Admin pages (87.7%) exceed target. Contexts (34.8%) need work.

## 6. Execution Steps

1.  [x] Install testing dependencies.
2.  [x] Configure Vitest and environment.
3.  [x] Set up hook tests for all data hooks.
4.  [x] Set up service layer tests for all Firestore operations.
5.  [x] Set up component tests for booking flow and admin pages.
6.  [ ] Expand context tests (Auth, Toast, Theme).
7.  [ ] Add remaining admin page tests (Clients, Dashboard).
8.  [ ] Set up Playwright E2E test suite.
9.  [ ] CI/CD Integration: Run tests on every push/PR to `yeni` branch.
