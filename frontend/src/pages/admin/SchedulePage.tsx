import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Scissors, X, Check, XCircle } from 'lucide-react';
import { AdminSidebar } from '../../components/admin';
import { Card } from '../../components/ui';
import './SchedulePage.css';

interface Appointment {
    id: string;
    clientName: string;
    service: string;
    staffName: string;
    date: string;
    time: string;
    duration: number;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    notes?: string;
}

const initialAppointments: Appointment[] = [
    { id: '1', clientName: 'Ahmet Yılmaz', service: 'Saç Kesimi', staffName: 'Mehmet Usta', date: '2026-01-24', time: '09:00', duration: 30, status: 'confirmed' },
    { id: '2', clientName: 'Burak Demir', service: 'Saç + Sakal', staffName: 'Ali Usta', date: '2026-01-24', time: '09:30', duration: 45, status: 'confirmed' },
    { id: '3', clientName: 'Can Özkan', service: 'Cilt Bakımı', staffName: 'Mehmet Usta', date: '2026-01-24', time: '10:00', duration: 40, status: 'pending' },
    { id: '4', clientName: 'Deniz Kaya', service: 'Sakal Düzeltme', staffName: 'Ahmet Kalfa', date: '2026-01-24', time: '11:00', duration: 20, status: 'confirmed' },
    { id: '5', clientName: 'Emre Şahin', service: 'Saç Kesimi', staffName: 'Can Usta', date: '2026-01-24', time: '14:00', duration: 30, status: 'confirmed' },
    { id: '6', clientName: 'Fatih Yıldız', service: 'Boya', staffName: 'Mehmet Usta', date: '2026-01-24', time: '15:00', duration: 60, status: 'pending' },
    { id: '7', clientName: 'Gökhan Arslan', service: 'Saç Kesimi', staffName: 'Ali Usta', date: '2026-01-25', time: '10:00', duration: 30, status: 'confirmed' },
    { id: '8', clientName: 'Hasan Çelik', service: 'Saç + Sakal', staffName: 'Mehmet Usta', date: '2026-01-25', time: '11:00', duration: 45, status: 'confirmed' },
];

const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

const staffMembers = ['Mehmet Usta', 'Ali Usta', 'Ahmet Kalfa', 'Can Usta'];

export const SchedulePage: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
    const [currentDate, setCurrentDate] = useState(new Date('2026-01-24'));
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('tr-TR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatDateKey = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const navigateDay = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + direction);
        setCurrentDate(newDate);
    };

    const getTodayAppointments = () => {
        const dateKey = formatDateKey(currentDate);
        return appointments.filter(apt => apt.date === dateKey);
    };

    const getAppointmentForSlot = (time: string, staff: string) => {
        const dateKey = formatDateKey(currentDate);
        return appointments.find(apt =>
            apt.date === dateKey &&
            apt.time === time &&
            apt.staffName === staff
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'cancelled': return '#ef4444';
            case 'completed': return '#6366f1';
            default: return '#64748b';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Onaylandı';
            case 'pending': return 'Beklemede';
            case 'cancelled': return 'İptal';
            case 'completed': return 'Tamamlandı';
            default: return status;
        }
    };

    const openDetailModal = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedAppointment(null);
    };

    const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
        setAppointments(appointments.map(apt =>
            apt.id === id ? { ...apt, status } : apt
        ));
        closeDetailModal();
    };

    const todayAppointments = getTodayAppointments();
    const confirmedCount = todayAppointments.filter(a => a.status === 'confirmed').length;
    const pendingCount = todayAppointments.filter(a => a.status === 'pending').length;

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
                            onClick={() => setViewMode('week')}
                        >
                            Hafta
                        </button>
                    </div>
                </header>

                <div className="admin-content">
                    {/* Day Summary */}
                    <div className="day-summary">
                        <div className="summary-item">
                            <span className="summary-value">{todayAppointments.length}</span>
                            <span className="summary-label">Toplam Randevu</span>
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
                                {staffMembers.map(staff => (
                                    <div key={staff} className="staff-column-header">
                                        {staff}
                                    </div>
                                ))}
                            </div>

                            <div className="schedule-body">
                                {timeSlots.map(time => (
                                    <div key={time} className="time-row">
                                        <div className="time-cell">{time}</div>
                                        {staffMembers.map(staff => {
                                            const appointment = getAppointmentForSlot(time, staff);
                                            return (
                                                <div key={`${time}-${staff}`} className="schedule-cell">
                                                    {appointment && (
                                                        <div
                                                            className="appointment-block"
                                                            style={{
                                                                borderLeftColor: getStatusColor(appointment.status),
                                                                height: `${(appointment.duration / 30) * 48}px`
                                                            }}
                                                            onClick={() => openDetailModal(appointment)}
                                                        >
                                                            <div className="appointment-time">
                                                                <Clock size={12} />
                                                                {appointment.time} ({appointment.duration} dk)
                                                            </div>
                                                            <div className="appointment-client">
                                                                <User size={12} />
                                                                {appointment.clientName}
                                                            </div>
                                                            <div className="appointment-service">
                                                                <Scissors size={12} />
                                                                {appointment.service}
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
                                    <span>{selectedAppointment.clientName}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Hizmet</label>
                                    <span>{selectedAppointment.service}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Personel</label>
                                    <span>{selectedAppointment.staffName}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Tarih & Saat</label>
                                    <span>{selectedAppointment.date} - {selectedAppointment.time}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Süre</label>
                                    <span>{selectedAppointment.duration} dakika</span>
                                </div>
                            </div>

                            <div className="appointment-actions">
                                <h4>Durumu Güncelle</h4>
                                <div className="action-buttons">
                                    <button
                                        className="action-btn confirm"
                                        onClick={() => updateAppointmentStatus(selectedAppointment.id, 'confirmed')}
                                    >
                                        <Check size={16} />
                                        Onayla
                                    </button>
                                    <button
                                        className="action-btn complete"
                                        onClick={() => updateAppointmentStatus(selectedAppointment.id, 'completed')}
                                    >
                                        <Check size={16} />
                                        Tamamlandı
                                    </button>
                                    <button
                                        className="action-btn cancel"
                                        onClick={() => updateAppointmentStatus(selectedAppointment.id, 'cancelled')}
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
