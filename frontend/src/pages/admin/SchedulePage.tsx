import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Scissors, X, Check, XCircle } from 'lucide-react';
import { AdminSidebar } from '../../components/admin';
import { Card } from '../../components/ui';
import './SchedulePage.css';
import { useAuth } from '../../contexts';
import { useRealtimeAppointments, useStaff } from '../../hooks';
import { updateAppointmentStatus } from '../../services/firestore';
import type { Appointment as FirestoreAppointment } from '../../types';

export const SchedulePage: React.FC = () => {
    const { user } = useAuth();
    const businessId = user?.businessId;

    const { data: staffList, loading: staffLoading } = useStaff(businessId);
    const { data: realAppointments, loading: apptLoading } = useRealtimeAppointments(businessId);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
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
            const aptDate = apt.dateTime.toDate();
            return aptDate.toDateString() === targetDateStr && apt.status !== 'cancelled' && apt.status !== 'noShow';
        });
    }, [realAppointments, currentDate]);

    const getAppointmentForSlot = (time: string, staffId: string) => {
        return dayAppointments.find(apt => {
            if (apt.staffId !== staffId) return false;

            const aptDate = apt.dateTime.toDate();
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
            alert("Durum güncellenirken bir hata oluştu.");
        }
    };

    const confirmedCount = dayAppointments.filter(a => a.status === 'confirmed').length;
    const pendingCount = dayAppointments.filter(a => a.status === 'pending').length;

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
                        {/* Weekly view not implemented yet */}
                        <button
                            className={viewMode === 'week' ? 'active' : ''}
                            style={{ opacity: 0.5, cursor: 'not-allowed' }}
                        // onClick={() => setViewMode('week')}
                        >
                            Hafta
                        </button>
                    </div>
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
                    </div>

                    {/* Schedule Grid */}
                    <Card className="schedule-card">
                        <div className="schedule-grid">
                            <div className="schedule-header">
                                <div className="time-column-header">Saat</div>
                                {staffList.map(staff => (
                                    <div key={staff.id} className="staff-column-header">
                                        {staff.name}
                                    </div>
                                ))}
                            </div>

                            <div className="schedule-body">
                                {timeSlots.map(time => (
                                    <div key={time} className="time-row">
                                        <div className="time-cell">{time}</div>
                                        {staffList.map(staff => {
                                            const appointment = getAppointmentForSlot(time, staff.id);
                                            return (
                                                <div key={`${time}-${staff.id}`} className="schedule-cell">
                                                    {appointment && (
                                                        <div
                                                            className="appointment-block"
                                                            style={{
                                                                borderLeftColor: getStatusColor(appointment.status),
                                                                // Calculate height based on duration. Assuming 30min slots = 48px height approx.
                                                                // If duration is 60, height should be double. 
                                                                // But this implementation assumes strict slot placement. 
                                                                // For now, let's keep it simple or expand if duration > 30.
                                                                height: `${Math.max(48, (appointment.totalDurationMinutes / 30) * 48 - 4)}px`,
                                                                zIndex: 10,
                                                                position: 'absolute',
                                                                width: '90%',
                                                                top: 2
                                                            }}
                                                            onClick={() => openDetailModal(appointment)}
                                                        >
                                                            <div className="appointment-time">
                                                                <Clock size={12} />
                                                                {time} ({appointment.totalDurationMinutes} dk)
                                                            </div>
                                                            <div className="appointment-client">
                                                                <User size={12} />
                                                                {appointment.customerName}
                                                            </div>
                                                            <div className="appointment-service">
                                                                <Scissors size={12} />
                                                                {appointment.services.map(s => s.serviceName).join(', ')}
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
                                    <span>{selectedAppointment.services.map(s => s.serviceName).join(', ')}</span>
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
                                        {selectedAppointment.dateTime.toDate().toLocaleDateString('tr-TR')} -
                                        {selectedAppointment.dateTime.toDate().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
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
