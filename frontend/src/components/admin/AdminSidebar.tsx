import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Scissors,
    UserCircle,
    Calendar,
    Settings,
    LogOut,
    Bell,
} from 'lucide-react';
import { Logo } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import './AdminSidebar.css';

interface NavItem {
    icon: React.ReactNode;
    label: string;
    path: string;
}

const navItems: NavItem[] = [
    { icon: <LayoutDashboard />, label: 'Overview', path: '/admin' },
    { icon: <Users />, label: 'Personel', path: '/admin/barbers' },
    { icon: <Scissors />, label: 'Hizmetler', path: '/admin/services' },
    { icon: <UserCircle />, label: 'Müşteriler', path: '/admin/clients' },
    { icon: <Bell />, label: 'Randevu Talepleri', path: '/admin/requests' },
    { icon: <Calendar />, label: 'Takvim', path: '/admin/schedule' },
    { icon: <Settings />, label: 'Ayarlar', path: '/admin/settings' },
];

export const AdminSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const isActive = (path: string) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/login');
        }
    };

    const displayName = user?.displayName || 'Kullanıcı';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    const displayRole = user?.role === 'admin' ? 'İşletme Sahibi' : 'Personel';

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-logo">
                <Logo variant="admin" />
            </div>

            <nav className="sidebar-nav" role="navigation" aria-label="Yönetici menüsü">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                        aria-current={isActive(item.path) ? 'page' : undefined}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{initials}</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{displayName}</div>
                        <div className="sidebar-user-role">{displayRole}</div>
                    </div>
                    <button
                        className="sidebar-nav-item"
                        style={{ width: 'auto', padding: 8 }}
                        onClick={handleLogout}
                        aria-label="Çıkış yap"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};
