import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, X } from 'lucide-react';
import { AdminSidebar, DashboardStats, TodaySchedule, PopularServices } from '../components/admin';
import { IconButton, Card } from '../components/ui';
import './AdminDashboard.css';

import { useAuth } from '../contexts';
import { useBusiness, useDashboardStats, useTodayAppointments } from '../hooks';

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

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
                <style>{`@keyframes spin { to { transform: rotate(360deg); } } `}</style>
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

                <button className="fab-button" onClick={() => navigate('/admin/schedule')}>
                    <Plus size={20} />
                    YENİ RANDEVU
                </button>
            </main>

            {/* New Appointment Modal placeholder */}
            {showNewAppointmentModal && (
                <div className="modal-overlay" onClick={() => setShowNewAppointmentModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h2>Yeni Randevu</h2>
                            <button className="modal-close" onClick={() => setShowNewAppointmentModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ padding: 24 }}>
                            <p style={{ marginBottom: 16, color: 'var(--color-text-secondary)' }}>
                                Randevu eklemek için Takvim sayfasını kullanabilir ya da müşterinin booking linkini paylaşabilirsiniz.
                            </p>
                            <button
                                className="btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => { setShowNewAppointmentModal(false); navigate('/admin/schedule'); }}
                            >
                                Takvime Git
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
