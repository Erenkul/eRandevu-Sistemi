# Test Improvement Plan - eRandevu

Our goal is to reach a robust level of confidence in the codebase through a multi-layered testing strategy.

## 1. Testing Strategy

We will follow the **Testing Trophy** model, prioritizing integration tests while maintaining a healthy base of unit tests and essential end-to-end (E2E) tests.

### Layers:
1.  **Unit Tests (Vitest):** Focus on pure functions, utility methods (in `src/lib`), and simple logic in custom hooks (`src/hooks`).
2.  **Component Tests (React Testing Library):** Verify that UI components render correctly and handle user interactions (click, type, etc.) as expected.
3.  **Integration Tests:** Focus on the interaction between multiple components and hooks, especially the booking flow and authentication states.
4.  **End-to-End Tests (Playwright/Cypress):** (Phase 2) Test critical user journeys like "Register -> Search Business -> Book Appointment".

## 2. Infrastructure

-   **Test Runner:** [Vitest](https://vitest.dev/) (Native for Vite, extremely fast).
-   **DOM Mocking:** [jsdom](https://github.com/jsdom/jsdom).
-   **Testing Library:** [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (Best practices for testing components from the user's perspective).
-   **Mocking APIs:** [Mock Service Worker (MSW)](https://mswjs.io/) to mock Firebase/API responses.

## 3. Priority Areas

### Phase 1: Foundation (High Priority)
-   [ ] **Authentication Flow:** Login, Logout, and Protected Routes logic.
-   [ ] **Services/Firebase:** Mocking and verifying Firestore data retrieval/storage logic.
-   [ ] **Global State/Contexts:** Testing `AuthContext` and other global states.

### Phase 2: Core Components
-   [ ] **Business Cards & Listings:** Ensuring data displays correctly.
-   [ ] **Booking Calendar/Time Slots:** Verification of date/time logic.
-   [ ] **Common UI Components:** Button, Input, Modal (in `src/components`).

### Phase 3: Advanced Coverage
-   [ ] **Form Validations:** Registration and Profile update forms.
-   [ ] **Error Handling:** Boundary tests for API failures or invalid routes.

## 4. Coverage Goals

-   **Target:** 80% line coverage for business logic (`hooks`, `services`, `lib`).
-   **Critical Paths:** 100% test coverage for the appointment booking process.

## 5. Execution Steps

1.  Install testing dependencies.
2.  Configure Vitest and environment.
3.  Set up first unit test for a utility function.
4.  Set up first component test for a basic component.
5.  CI/CD Integration: Run tests on every push/PR to `yeni` branch.
