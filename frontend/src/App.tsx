import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ToastProvider, ThemeProvider, NotificationProvider } from './contexts';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { ProtectedRoute } from './components/auth';
import { CustomCursor, LoadingFallback } from './components/ui';
import './styles/index.css';

const HomePage = lazy(() => import('./pages/HomePage/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage').then(m => ({ default: m.LoginPage })));
const BookingPage = lazy(() => import('./pages/BookingPage').then(m => ({ default: m.BookingPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const OnboardingWizard = lazy(() => import('./pages/OnboardingWizard/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
const ServicesPage = lazy(() => import('./pages/admin/ServicesPage').then(m => ({ default: m.ServicesPage })));
const StaffPage = lazy(() => import('./pages/admin/StaffPage').then(m => ({ default: m.StaffPage })));
const ClientsPage = lazy(() => import('./pages/admin/ClientsPage').then(m => ({ default: m.ClientsPage })));
const SchedulePage = lazy(() => import('./pages/admin/SchedulePage').then(m => ({ default: m.SchedulePage })));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then(m => ({ default: m.SettingsPage })));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <CustomCursor />
            <BrowserRouter>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/onboarding" element={<OnboardingWizard />} />
                    <Route path="/admin/services" element={<ServicesPage />} />
                    <Route path="/admin/barbers" element={<StaffPage />} />
                    <Route path="/admin/clients" element={<ClientsPage />} />
                    <Route path="/admin/schedule" element={<SchedulePage />} />
                    <Route path="/admin/settings" element={<SettingsPage />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                    <Route path="/customer" element={<CustomerDashboard />} />
                    <Route path="/customer/*" element={<CustomerDashboard />} />
                  </Route>
                  <Route path="/book/:businessId" element={<BookingPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
