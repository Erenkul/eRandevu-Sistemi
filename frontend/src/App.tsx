import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  SettingsPage
} from './pages';
import './styles/index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Home Page - No login required */}
        <Route path="/" element={<HomePage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Dashboard (Business) */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/services" element={<ServicesPage />} />
        <Route path="/admin/barbers" element={<StaffPage />} />
        <Route path="/admin/clients" element={<ClientsPage />} />
        <Route path="/admin/schedule" element={<SchedulePage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />

        {/* Customer Dashboard */}
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/*" element={<CustomerDashboard />} />

        {/* Public Booking Page - No login required */}
        <Route path="/book/:businessId" element={<BookingPage />} />

        {/* 404 - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


