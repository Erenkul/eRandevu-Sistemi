import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts';
import {
  AdminDashboard,
  BookingPage,
  LoginPage,
  CustomerDashboard,
  HomePage,
  ServicesPage,
  StaffPage,
  ClientsPage,
  SchedulePage,
  SettingsPage,
  OnboardingWizard
} from './pages';
import { ProtectedRoute } from './components/auth';
import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Home Page - No login required */}
          <Route path="/" element={<HomePage />} />

          {/* Auth Pages */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Dashboard (Business) - Protected for admin and staff */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/onboarding" element={<OnboardingWizard />} />
            <Route path="/admin/services" element={<ServicesPage />} />
            <Route path="/admin/barbers" element={<StaffPage />} />
            <Route path="/admin/clients" element={<ClientsPage />} />
            <Route path="/admin/schedule" element={<SchedulePage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>

          {/* Customer Dashboard - Protected */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/*" element={<CustomerDashboard />} />
          </Route>

          {/* Public Booking Page - No login required */}
          <Route path="/book/:businessId" element={<BookingPage />} />

          {/* 404 - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


