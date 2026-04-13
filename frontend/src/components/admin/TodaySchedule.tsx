import React from 'react';
import { Calendar, User } from 'lucide-react';
import { Card, CardHeader, SkeletonCard } from '../ui';
import './TodaySchedule.css';
import type { Appointment } from '../../types';

interface TodayScheduleProps {
    appointments: Appointment[];
    loading?: boolean;
}


const statusLabels: Record<string, string> = {
    confirmed: 'Onaylandı',
    pending: 'Bekliyor',
    cancelled: 'İptal',
    completed: 'Tamamlandı'
};

export const TodaySchedule = React.memo<TodayScheduleProps>(({ appointments = [], loading }) => {

    const formatTime = (date: Appointment['dateTime']) => {
        if (!date) return '';
        const d = date instanceof Date ? date : date.toDate();
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const getServiceName = (services: Appointment['services']) => {
        if (!services || services.length === 0) return '';
        return services.map(s => s.serviceName).join(', ');
    };

    const getInitials = (name?: string) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <Card>
                <CardHeader title="Bugünkü Program" icon={Calendar} iconColor="var(--color-primary)" iconBgColor="var(--color-primary-container)" />
                <div style={{ padding: '16px' }}>
                    <SkeletonCard lines={4} />
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader
                title="Bugünkü Program"
                icon={Calendar}
                iconColor="var(--color-primary)"
                iconBgColor="var(--color-primary-container)"
                action={
                    <span style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>
                        {appointments.length} randevu
                    </span>
                }
            />
            <div className="schedule-list">
                {appointments.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        Bugün için randevu bulunmuyor.
                    </div>
                ) : (
                    appointments.map((appointment) => (
                        <div key={appointment.id} className="schedule-item">
                            <div className="schedule-time">
                                <div className="schedule-time-value">{formatTime(appointment.dateTime)}</div>
                                <div className="schedule-time-duration">{appointment.totalDurationMinutes} dk</div>
                            </div>
                            <div className="schedule-avatar">{getInitials(appointment.customerName)}</div>
                            <div className="schedule-info">
                                <div className="schedule-client">{appointment.customerName}</div>
                                <div className="schedule-service">{getServiceName(appointment.services)}</div>
                                <div className="schedule-staff">
                                    <User size={14} />
                                    {appointment.staffName}
                                </div>
                            </div>
                            <span className={`schedule-status ${appointment.status}`}>
                                {statusLabels[appointment.status] || appointment.status}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
});
