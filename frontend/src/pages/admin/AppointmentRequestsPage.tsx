import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, Scissors, Check, XCircle, Phone, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin';
import { Card } from '../../components/ui';
import './AppointmentRequestsPage.css';
import { useAuth, useToast } from '../../contexts';
import { useRealtimeAppointments, useStaff } from '../../hooks';
import { updateAppointmentStatus } from '../../services/firestore';
import type { Appointment as FirestoreAppointment } from '../../types';

export const AppointmentRequestsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const businessId = user?.businessId;

    const { data: staffList } = useStaff(businessId);
    const { data: realAppointments, loading: apptLoading } = useRealtimeAppointments(businessId);

    const [filterStatus, setFilterStatus] = useState<'pending' | 'all'>('pending');

    const allAppointments = useMemo(() => realAppointments || [], [realAppointments]);

    const filteredAppointments = useMemo(() => {
        return allAppointments
            .filter(apt => {
                if (filterStatus === 'pending') {
                    return apt.status === 'pending';
                }
                return true;
            })
            .sort((a, b) => {
                const dateA = a.dateTime?.toDate ? a.dateTime.toDate() : new Date(a.dateTime as unknown as Date);
                const dateB = b.dateTime?.toDate ? b.dateTime.toDate() : new Date(b.dateTime as unknown as Date);
                return dateA.getTime() - dateB.getTime();
            });
    }, [allAppointments, filterStatus]);

    const pendingCount = allAppointments.filter(a => a.status === 'pending').length;
    const confirmedCount = allAppointments.filter(a => a.status === 'confirmed').length;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('tr-TR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'var(--color-success)';
            case 'pending': return 'var(--color-warning)';
            case 'cancelled': return 'var(--color-error)';
            case 'completed': return 'var(--color-info)';
            case 'noShow': return 'var(--color-text-tertiary)';
            case 'inProgress': return 'var(--color-primary)';
            default: return 'var(--color-text-tertiary)';
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

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateAppointmentStatus(id, status);
            showToast(status === 'confirmed' ? 'Randevu onaylandı!' : 'Randevu güncellendi', 'success');
        } catch (error) {
            console.error('Durum güncellenirken hata:', error);
            showToast(error instanceof Error ? error.message : 'Durum güncellenirken bir hata oluştu.', 'error');
        }
    };

    const handleGoToCalendar = (appointment: FirestoreAppointment) => {
        const aptDate = appointment.dateTime?.toDate ? appointment.dateTime.toDate() : new Date(appointment.dateTime as unknown as Date);
        navigate(`/admin/schedule?date=${aptDate.toISOString().split('T')[0]}`);
    };

    const getStaffName = (staffId: string) => {
        const staff = staffList?.find(s => s.id === staffId);
        return staff?.name || 'Bilinmeyen';
    };

    if (apptLoading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="admin-dashboard">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-title">
                        <h1>Randevu Talepleri</h1>
                        <p>Onay bekleyen randevuları görüntüleyin ve yönetin</p>
                    </div>

                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('pending')}
                        >
                            <Filter size={16} />
                            Bekleyen ({pendingCount})
                        </button>
                        <button
                            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('all')}
                        >
                            Tümü ({allAppointments.length})
                        </button>
                    </div>
                </header>

                <div className="admin-content">
                    <div className="requests-summary">
                        <div className="summary-card pending">
                            <div className="summary-icon">
                                <AlertCircle size={24} style={{ color: 'var(--color-warning)' }} />
                            </div>
                            <div className="summary-info">
                                <div className="summary-value">{pendingCount}</div>
                                <div className="summary-label">Bekleyen</div>
                            </div>
                        </div>
                        <div className="summary-card confirmed">
                            <div className="summary-icon">
                                <CheckCircle size={24} style={{ color: 'var(--color-success)' }} />
                            </div>
                            <div className="summary-info">
                                <div className="summary-value">{confirmedCount}</div>
                                <div className="summary-label">Onaylı</div>
                            </div>
                        </div>
                    </div>

                    {filteredAppointments.length === 0 ? (
                        <Card className="empty-state">
                            <div className="empty-content">
                                <Calendar size={48} />
                                <h3>Randevu talebi yok</h3>
                                <p>
                                    {filterStatus === 'pending'
                                        ? 'Onay bekleyen randevu bulunmuyor.'
                                        : 'Henüz randevu oluşturulmamış.'}
                                </p>
                            </div>
                        </Card>
                    ) : (
                        <div className="requests-list">
                            {filteredAppointments.map(apt => {
                                const aptDate = apt.dateTime?.toDate ? apt.dateTime.toDate() : new Date(apt.dateTime as unknown as Date);
                                return (
                                    <Card key={apt.id} className="request-card">
                                        <div className="request-header">
                                            <div className="request-date">
                                                <Calendar size={16} />
                                                <span>{formatDate(aptDate)}</span>
                                            </div>
                                            <div className="request-time">
                                                <Clock size={16} />
                                                <span>{formatTime(aptDate)}</span>
                                            </div>
                                            <span
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(apt.status) }}
                                            >
                                                {getStatusLabel(apt.status)}
                                            </span>
                                        </div>

                                        <div className="request-body">
                                            <div className="request-customer">
                                                <div className="customer-avatar">
                                                    <User size={20} />
                                                </div>
                                                <div className="customer-info">
                                                    <div className="customer-name">{apt.customerName}</div>
                                                    <div className="customer-phone">
                                                        <Phone size={14} />
                                                        {apt.customerPhone}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="request-services">
                                                <Scissors size={16} />
                                                <span>{(apt.services || []).map(s => s.serviceName).join(', ')}</span>
                                            </div>

                                            <div className="request-details">
                                                <div className="detail-item">
                                                    <span className="detail-label">Personel</span>
                                                    <span className="detail-value">{getStaffName(apt.staffId)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Süre</span>
                                                    <span className="detail-value">{apt.totalDurationMinutes} dk</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Tutar</span>
                                                    <span className="detail-value">₺{apt.totalPrice}</span>
                                                </div>
                                            </div>

                                            {apt.customerNote && (
                                                <div className="request-note">
                                                    <span className="note-label">Not:</span>
                                                    <span className="note-text">{apt.customerNote}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="request-actions">
                                            <button
                                                className="action-btn calendar"
                                                onClick={() => handleGoToCalendar(apt)}
                                                title="Takvime Git"
                                            >
                                                <Calendar size={16} />
                                                Takvime Git
                                            </button>
                                            {apt.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="action-btn confirm"
                                                        onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                                                    >
                                                        <Check size={16} />
                                                        Onayla
                                                    </button>
                                                    <button
                                                        className="action-btn cancel"
                                                        onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                                    >
                                                        <XCircle size={16} />
                                                        İptal
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};