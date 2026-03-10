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
    const { user, loading, error } = useAuth();
    const location = useLocation();

    // Firebase auth durumu henüz belli değil — spinner göster
    if (loading) {
        return <LoadingSpinner />;
    }

    // Auth sistemi çökmüşse veya ciddi bir yetki hatası varsa
    if (error) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                height: '100vh', backgroundColor: '#f9fafb', padding: '20px'
            }}>
                <div style={{
                    maxWidth: '400px', backgroundColor: 'white', padding: '32px',
                    borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ color: '#ef4444', marginBottom: '16px' }}>
                        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px', margin: 0 }}>Oturum Açma Hatası</h2>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>{error}</p>
                    <button 
                        onClick={() => window.location.href = '/login'}
                        style={{
                            backgroundColor: '#6366f1', color: 'white', border: 'none',
                            padding: '10px 24px', borderRadius: '6px', fontWeight: '500',
                            cursor: 'pointer', width: '100%'
                        }}
                    >
                        Tekrar Giriş Yap
                    </button>
                </div>
            </div>
        );
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
