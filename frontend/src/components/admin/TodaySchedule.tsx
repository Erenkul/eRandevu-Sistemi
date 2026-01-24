import React from 'react';
import { Calendar, User } from 'lucide-react';
import { Card, CardHeader } from '../ui';
import './TodaySchedule.css';

interface Appointment {
    id: string;
    time: string;
    duration: string;
    clientName: string;
    clientInitials: string;
    service: string;
    staffName: string;
    status: 'confirmed' | 'pending' | 'cancelled';
}

const mockAppointments: Appointment[] = [
    {
        id: '1',
        time: '09:00',
        duration: '45 dk',
        clientName: 'Ahmet Yılmaz',
        clientInitials: 'AY',
        service: 'Saç Kesimi + Sakal',
        staffName: 'Mehmet Usta',
        status: 'confirmed',
    },
    {
        id: '2',
        time: '10:00',
        duration: '30 dk',
        clientName: 'Burak Demir',
        clientInitials: 'BD',
        service: 'Saç Kesimi',
        staffName: 'Mehmet Usta',
        status: 'confirmed',
    },
    {
        id: '3',
        time: '11:00',
        duration: '60 dk',
        clientName: 'Can Özkan',
        clientInitials: 'CÖ',
        service: 'Saç Kesimi + Cilt Bakımı',
        staffName: 'Ali Usta',
        status: 'pending',
    },
    {
        id: '4',
        time: '12:30',
        duration: '45 dk',
        clientName: 'Deniz Kaya',
        clientInitials: 'DK',
        service: 'Sakal Düzeltme + Maske',
        staffName: 'Mehmet Usta',
        status: 'confirmed',
    },
    {
        id: '5',
        time: '14:00',
        duration: '30 dk',
        clientName: 'Emre Şahin',
        clientInitials: 'EŞ',
        service: 'Saç Kesimi',
        staffName: 'Ali Usta',
        status: 'confirmed',
    },
];

const statusLabels = {
    confirmed: 'Onaylandı',
    pending: 'Bekliyor',
    cancelled: 'İptal',
};

export const TodaySchedule: React.FC = () => {
    return (
        <Card>
            <CardHeader
                title="Bugünkü Program"
                icon={Calendar}
                iconColor="var(--color-primary)"
                iconBgColor="var(--color-primary-container)"
                action={
                    <span style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>
                        {mockAppointments.length} randevu
                    </span>
                }
            />
            <div className="schedule-list">
                {mockAppointments.map((appointment) => (
                    <div key={appointment.id} className="schedule-item">
                        <div className="schedule-time">
                            <div className="schedule-time-value">{appointment.time}</div>
                            <div className="schedule-time-duration">{appointment.duration}</div>
                        </div>
                        <div className="schedule-avatar">{appointment.clientInitials}</div>
                        <div className="schedule-info">
                            <div className="schedule-client">{appointment.clientName}</div>
                            <div className="schedule-service">{appointment.service}</div>
                            <div className="schedule-staff">
                                <User size={14} />
                                {appointment.staffName}
                            </div>
                        </div>
                        <span className={`schedule-status ${appointment.status}`}>
                            {statusLabels[appointment.status]}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
};
