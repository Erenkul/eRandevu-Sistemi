// ===========================================
// eRandevu - Protected Route Component
// frontend/src/components/auth/ProtectedRoute.tsx
// ===========================================

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts';

interface ProtectedRouteProps {
    allowedRoles: ('admin' | 'staff' | 'customer')[];
}

// Loading spinner — sade, bağımlılıksız
const LoadingSpinner = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#f9fafb',
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Yükleniyor...</p>
    </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Firebase auth durumu henüz belli değil — spinner göster
    if (loading) {
        return <LoadingSpinner />;
    }

    // Giriş yapılmamış — login'e yönlendir, geri dönmek için mevcut URL'yi sakla
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Giriş yapılmış ama yetkisiz rol — ilgili dashboard'a yönlendir
    if (!allowedRoles.includes(user.role)) {
        const redirectTo = user.role === 'admin' || user.role === 'staff'
            ? '/admin'
            : '/customer';
        return <Navigate to={redirectTo} replace />;
    }

    // Yetkili — route'u render et
    return <Outlet />;
};
