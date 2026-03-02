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
} from 'lucide-react';
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
    { icon: <Calendar />, label: 'Takvim', path: '/admin/schedule' },
    { icon: <Settings />, label: 'Ayarlar', path: '/admin/settings' },
];

export const AdminSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-logo">
                <h1>
                    e<span>Randevu</span>
                </h1>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">MA</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">Mehmet Ali</div>
                        <div className="sidebar-user-role">İşletme Sahibi</div>
                    </div>
                    <button
                        className="sidebar-nav-item"
                        style={{ width: 'auto', padding: 8 }}
                        onClick={() => navigate('/login')}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};
