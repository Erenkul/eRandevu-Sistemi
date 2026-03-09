import React from 'react';
import { Scissors } from 'lucide-react';
import { Card, CardHeader } from '../ui';
import './PopularServices.css';

interface ServiceStat {
    name: string;
    count: number;
    color: string;
}

const mockServices: ServiceStat[] = [
    { name: 'Saç Kesimi', count: 145, color: 'var(--color-primary)' },
    { name: 'Sakal Düzeltme', count: 98, color: 'var(--color-secondary)' },
    { name: 'Saç + Sakal', count: 76, color: 'var(--color-accent)' },
    { name: 'Cilt Bakımı', count: 45, color: 'var(--color-warning)' },
    { name: 'Boya', count: 32, color: 'var(--color-chart-purple)' },
];

interface PopularServicesProps {
    businessId?: string;
}

export const PopularServices: React.FC<PopularServicesProps> = () => {
    const maxCount = Math.max(...mockServices.map((s) => s.count));

    const getRankClass = (index: number) => {
        if (index === 0) return 'gold';
        if (index === 1) return 'silver';
        if (index === 2) return 'bronze';
        return '';
    };

    return (
        <Card>
            <CardHeader
                title="Popüler Hizmetler"
                icon={Scissors}
                iconColor="var(--color-accent)"
                iconBgColor="var(--color-accent-container)"
            />
            <div className="popular-services-list">
                {mockServices.map((service, index) => (
                    <div key={service.name} className="popular-service-item">
                        <div className={`popular-service-rank ${getRankClass(index)}`}>
                            {index + 1}
                        </div>
                        <div className="popular-service-info">
                            <div className="popular-service-name">{service.name}</div>
                            <div className="popular-service-count">{service.count} randevu</div>
                            <div className="popular-service-bar">
                                <div
                                    className="popular-service-bar-fill"
                                    style={{
                                        width: `${(service.count / maxCount) * 100}%`,
                                        backgroundColor: service.color,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
