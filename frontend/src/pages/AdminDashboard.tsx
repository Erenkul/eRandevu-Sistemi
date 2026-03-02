import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus } from 'lucide-react';
import { AdminSidebar, DashboardStats, TodaySchedule, PopularServices } from '../components/admin';
import { SearchInput, IconButton, Card } from '../components/ui';
import './AdminDashboard.css';

import { useAuth } from '../contexts';
import { useBusiness, useDashboardStats, useTodayAppointments } from '../hooks';

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data: business, loading: businessLoading } = useBusiness(user?.businessId);
    const { data: stats, loading: statsLoading } = useDashboardStats(user?.businessId);
    const { data: todayAppointments, loading: appointmentsLoading } = useTodayAppointments(user?.businessId);

    // İşletmesi olmayan admin → onboarding'e yönlendir
    useEffect(() => {
        if (!businessLoading && !user?.businessId) {
            navigate('/admin/onboarding', { replace: true });
        }
    }, [businessLoading, user?.businessId, navigate]);

    // Auth yükleniyor veya business kontrol ediliyor
    if (businessLoading || !user?.businessId) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
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
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-title">
                        <h1>{business?.name || 'Panel'}</h1>
                        <p>Hoş geldiniz, işte bugünün özeti.</p>
                    </div>

                    <div className="topbar-search">
                        <SearchInput placeholder="Randevu ara..." />
                    </div>

                    <IconButton icon={Bell} tooltip="Bildirimler" />
                </header>

                <div className="admin-content">
                    <DashboardStats data={stats} loading={statsLoading} />

                    <div className="dashboard-grid">
                        <TodaySchedule appointments={todayAppointments} loading={appointmentsLoading} />

                        <div className="dashboard-sidebar-widgets">
                            <PopularServices businessId={user.businessId} />

                            <Card className="capacity-card">
                                <div className="capacity-header">Doluluk</div>
                                <div className="capacity-bar">
                                    <div
                                        className="capacity-fill"
                                        style={{
                                            width: stats
                                                ? `${Math.min((stats.todayCount / 10) * 100, 100)}%`
                                                : '0%'
                                        }}
                                    />
                                </div>
                                <div className="capacity-label">
                                    {stats ? `${stats.todayCount} randevu bugün` : 'Yükleniyor...'}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                <button className="fab-button" onClick={() => navigate('/admin/new-appointment')}>
                    <Plus size={20} />
                    YENİ RANDEVU
                </button>
            </main>
        </div>
    );
};
