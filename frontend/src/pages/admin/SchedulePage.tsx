import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Scissors, X, Check, XCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin';
import { Card } from '../../components/ui';
import './SchedulePage.css';
import { useAuth, useToast } from '../../contexts';
import { useRealtimeAppointments, useStaff, useBusiness } from '../../hooks';
import { updateAppointmentStatus } from '../../services/firestore';
import type { Appointment as FirestoreAppointment } from '../../types';

export const SchedulePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const businessId = user?.businessId;

    const { data: business } = useBusiness(businessId);
    const { data: staffList, loading: staffLoading } = useStaff(businessId);
    const { data: realAppointments, loading: apptLoading } = useRealtimeAppointments(businessId);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
    const [showCancelled, setShowCancelled] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<FirestoreAppointment | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
    ];

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('tr-TR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const navigateDay = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + direction);
        setCurrentDate(newDate);
    };

    // Filter appointments for the current day
    const dayAppointments = useMemo(() => {
        if (!realAppointments) return [];
        const targetDateStr = currentDate.toDateString();

        return realAppointments.filter(apt => {
            const aptDate = apt.dateTime?.toDate ? apt.dateTime.toDate() : (apt.dateTime as unknown as Date);
            const isCancelled = apt.status === 'cancelled' || apt.status === 'noShow';
            if (isCancelled && !showCancelled) return false;
            return aptDate.toDateString() === targetDateStr;
        });
    }, [realAppointments, currentDate, showCancelled]);

    const getAppointmentForSlot = (time: string, staffId: string) => {
        return dayAppointments.find(apt => {
            if (apt.staffId !== staffId) return false;

            const aptDate = apt.dateTime?.toDate ? apt.dateTime.toDate() : (apt.dateTime as unknown as Date);
            const aptTime = aptDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

            // Simple direct match for start time
            // Improves: check overlaps
            return aptTime === time;
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'cancelled': return '#ef4444';
            case 'completed': return '#6366f1';
            case 'noShow': return '#64748b';
            case 'inProgress': return '#3b82f6';
            default: return '#64748b';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Onaylandı';
            case 'pending': return 'Beklemede';
            case 'cancelled': return 'İptal';
            case 'completed': return 'Tamamlandı';
            case 'noShow': return 'Gelmedi';
            case 'inProgress': return 'İşlemde';
            default: return status;
        }
    };

    const openDetailModal = (appointment: FirestoreAppointment) => {
        setSelectedAppointment(appointment);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateAppointmentStatus(id, status);
            closeDetailModal();
        } catch (error) {
            console.error("Durum güncellenirken hata:", error);
            showToast(error instanceof Error ? error.message : 'Durum güncellenirken bir hata oluştu.', 'error');
        }
    };

    const confirmedCount = dayAppointments.filter(a => a.status === 'confirmed').length;
    const pendingCount = dayAppointments.filter(a => a.status === 'pending').length;
    const cancelledCount = dayAppointments.filter(a => a.status === 'cancelled' || a.status === 'noShow').length;

    if (!user) return <div>Lütfen giriş yapın.</div>;
    if (staffLoading || apptLoading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="admin-dashboard">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-title">
                        <h1>Takvim</h1>
                        <p>Randevuları görüntüleyin ve yönetin</p>
                    </div>

                    <div className="calendar-nav">
                        <button className="nav-btn" onClick={() => navigateDay(-1)}>
                            <ChevronLeft size={20} />
                        </button>
                        <span className="current-date">{formatDate(currentDate)}</span>
                        <button className="nav-btn" onClick={() => navigateDay(1)}>
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="view-toggle">
                        <button
                            className={viewMode === 'day' ? 'active' : ''}
                            onClick={() => setViewMode('day')}
                        >
                            Gün
                        </button>
                        <button
                            className={viewMode === 'week' ? 'active' : ''}
                            style={{ opacity: 0.5, cursor: 'not-allowed' }}
                        >
                            Hafta
                        </button>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                        <input
                            type="checkbox"
                            checked={showCancelled}
                            onChange={(e) => setShowCancelled(e.target.checked)}
                            style={{ width: 16, height: 16 }}
                        />
                        İptal edilmişleri göster
                    </label>

                    <button
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => {
                            if (business?.slug) navigate(`/book/${business.slug}`);
                        }}
                    >
                        <Plus size={16} />
                        Yeni Randevu
                    </button>
                </header>

                <div className="admin-content">
                    {/* Day Summary */}
                    <div className="day-summary">
                        <div className="summary-item">
                            <span className="summary-value">{dayAppointments.length}</span>
                            <span className="summary-label">Bugünkü Randevu</span>
                        </div>
                        <div className="summary-item confirmed">
                            <span className="summary-value">{confirmedCount}</span>
                            <span className="summary-label">Onaylı</span>
                        </div>
                        <div className="summary-item pending">
                            <span className="summary-value">{pendingCount}</span>
                            <span className="summary-label">Bekleyen</span>
                        </div>
                        {cancelledCount > 0 && (
                            <div className="summary-item" style={{ opacity: 0.6 }}>
                                <span className="summary-value">{cancelledCount}</span>
                                <span className="summary-label">İptal</span>
                            </div>
                        )}
                    </div>

                    {/* Schedule Grid */}
                    <Card className="schedule-card">
                        <div className="schedule-grid">
                            <div className="schedule-header">
                                <div className="time-column-header">Saat</div>
                                {(staffList || []).map(staff => (
                                    <div key={staff.id} className="staff-column-header">
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface-variant)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--color-outline)' }}>
                                            {staff.avatarUrl ? (
                                                <img src={staff.avatarUrl} alt={staff.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--color-primary)' }}>{staff.name?.charAt(0) || '?'}</span>
                                            )}
                                        </div>
                                        <div>{staff.name}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="schedule-body">
                                {timeSlots.map(time => (
                                    <div key={time} className="time-row">
                                        <div className="time-cell">{time}</div>
                                        {(staffList || []).map(staff => {
                                            const appointment = getAppointmentForSlot(time, staff.id);
                                            return (
                                                <div key={`${time}-${staff.id}`} className="schedule-cell">
                                                    {appointment && (
                                                        <div
                                                            className="appointment-block"
                                                            style={{
                                                                borderLeftColor: getStatusColor(appointment.status),
                                                                height: `${Math.max(48, ((appointment.totalDurationMinutes || 30) / 30) * 48 - 4)}px`,
                                                                zIndex: 10,
                                                                position: 'absolute',
                                                                width: '90%',
                                                                top: 2
                                                            }}
                                                            onClick={() => openDetailModal(appointment)}
                                                        >
                                                            <div className="appointment-time">
                                                                <Clock size={12} />
                                                                {time} ({appointment.totalDurationMinutes || 0} dk)
                                                            </div>
                                                            <div className="appointment-client">
                                                                <User size={12} />
                                                                {appointment.customerName || 'İsimsiz'}
                                                            </div>
                                                            <div className="appointment-service">
                                                                <Scissors size={12} />
                                                                {(appointment.services || []).map(s => s?.serviceName || 'Hizmet').join(', ')}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </main>

            {/* Appointment Detail Modal */}
            {isDetailModalOpen && selectedAppointment && (
                <div className="modal-overlay" onClick={closeDetailModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Randevu Detayı</h2>
                            <button className="modal-close" onClick={closeDetailModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="appointment-detail-status">
                                <span
                                    className="status-badge"
                                    style={{ background: getStatusColor(selectedAppointment.status) }}
                                >
                                    {getStatusLabel(selectedAppointment.status)}
                                </span>
                            </div>

                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Müşteri</label>
                                    <span>{selectedAppointment.customerName}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{selectedAppointment.customerPhone}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Hizmetler</label>
                                    <span>{(selectedAppointment.services || []).map(s => s.serviceName).join(', ')}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Personel</label>
                                    <span>{selectedAppointment.staffName}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Not</label>
                                    <span>{selectedAppointment.customerNote || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Tarih & Saat</label>
                                    <span>
                                        {(selectedAppointment.dateTime?.toDate ? selectedAppointment.dateTime.toDate() : (selectedAppointment.dateTime as unknown as Date)).toLocaleDateString('tr-TR', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Saat</label>
                                    <span>
                                        {(selectedAppointment.dateTime?.toDate ? selectedAppointment.dateTime.toDate() : (selectedAppointment.dateTime as unknown as Date)).toLocaleTimeString('tr-TR', {
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Süre / Fiyat</label>
                                    <span>{selectedAppointment.totalDurationMinutes} dk / ₺{selectedAppointment.totalPrice}</span>
                                </div>
                            </div>

                            <div className="appointment-actions">
                                <h4>Durumu Güncelle</h4>
                                <div className="action-buttons">
                                    {selectedAppointment.status === 'pending' && (
                                        <button
                                            className="action-btn confirm"
                                            onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                                        >
                                            <Check size={16} />
                                            Onayla
                                        </button>
                                    )}
                                    <button
                                        className="action-btn complete"
                                        onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
                                    >
                                        <Check size={16} />
                                        Tamamlandı
                                    </button>
                                    <button
                                        className="action-btn cancel"
                                        onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                                    >
                                        <XCircle size={16} />
                                        İptal Et
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={closeDetailModal}>Kapat</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
