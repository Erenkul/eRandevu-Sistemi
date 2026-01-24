import React from 'react';
import { Calendar, Users, TrendingUp, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '../ui';
import './DashboardStats.css';

interface StatCardProps {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    label: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    icon,
    iconBg,
    iconColor,
    label,
    value,
    change,
    changeLabel,
}) => {
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;

    return (
        <Card>
            <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: iconBg }}>
                    <span style={{ color: iconColor }}>{icon}</span>
                </div>
                <div className="stat-content">
                    <div className="stat-label">{label}</div>
                    <div className="stat-value">{value}</div>
                    {change !== undefined && (
                        <span className={`stat-change ${isPositive ? 'positive' : ''} ${isNegative ? 'negative' : ''}`}>
                            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                            {Math.abs(change)}% {changeLabel}
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
};

export const DashboardStats: React.FC = () => {
    const stats = [
        {
            icon: <Calendar size={24} />,
            iconBg: 'var(--color-primary-container)',
            iconColor: 'var(--color-primary)',
            label: "Bugünkü Randevular",
            value: 12,
            change: 15,
            changeLabel: 'vs dün',
        },
        {
            icon: <Users size={24} />,
            iconBg: 'var(--color-secondary-container)',
            iconColor: 'var(--color-secondary)',
            label: 'Toplam Müşteriler',
            value: 248,
            change: 8,
            changeLabel: 'bu ay',
        },
        {
            icon: <TrendingUp size={24} />,
            iconBg: 'var(--color-accent-container)',
            iconColor: 'var(--color-accent)',
            label: 'Aylık Gelir',
            value: '₺12,450',
            change: 23,
            changeLabel: 'vs geçen ay',
        },
        {
            icon: <Clock size={24} />,
            iconBg: 'var(--color-warning-light)',
            iconColor: 'var(--color-warning)',
            label: 'Ortalama Bekleme',
            value: '8 dk',
            change: -12,
            changeLabel: 'iyileşme',
        },
    ];

    return (
        <div className="dashboard-stats">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};
