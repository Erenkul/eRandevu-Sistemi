import React from 'react';
import { Calendar, User } from 'lucide-react';
import { Card, CardHeader } from '../ui';
import './TodaySchedule.css';

// Appointment types are already defined in types/index.ts usually, but keeping local interface for now
// Interface removed as we are using mapped Firestore data which doesn't strictly match this locally defined type yet.
// In a stricter implementation we would import Appointment type from '../../types'

interface TodayScheduleProps {
    appointments: any[]; // Using any[] temporarily effectively, will map inside
    loading?: boolean;
}


const statusLabels: Record<string, string> = {
    confirmed: 'Onaylandı',
    pending: 'Bekliyor',
    cancelled: 'İptal',
    completed: 'Tamamlandı'
};

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ appointments = [], loading }) => {

    // Helper to format time
    const formatTime = (date: any) => {
        if (!date) return '';
        // Handle Firestore Timestamp
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    // Calculate duration
    const getDuration = (start: any, end: any) => {
        if (!start || !end) return '';
        const s = start.toDate ? start.toDate() : new Date(start);
        const e = end.toDate ? end.toDate() : new Date(end);
        const diffMins = Math.round((e.getTime() - s.getTime()) / 60000);
        return `${diffMins} dk`;
    };

    const getInitials = (name: string) => {
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
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Yükleniyor...</div>
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
                                <div className="schedule-time-value">{formatTime(appointment.startTime)}</div>
                                <div className="schedule-time-duration">{getDuration(appointment.startTime, appointment.endTime)}</div>
                            </div>
                            <div className="schedule-avatar">{getInitials(appointment.clientName)}</div>
                            <div className="schedule-info">
                                <div className="schedule-client">{appointment.clientName}</div>
                                <div className="schedule-service">{appointment.serviceName}</div>
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
};
