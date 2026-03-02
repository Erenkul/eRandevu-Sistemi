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

interface DashboardStatsData {
    todayCount: number;
    todayRevenue: number;
    weeklyCount: number;
    totalCustomers: number;
    pendingCount: number;
    confirmedCount: number;
}

interface DashboardStatsProps {
    data?: DashboardStatsData | null;
    loading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ data, loading }) => {
    const stats = [
        {
            icon: <Calendar size={24} />,
            iconBg: 'var(--color-primary-container)',
            iconColor: 'var(--color-primary)',
            label: "Bugünkü Randevular",
            value: loading ? '-' : data?.todayCount || 0,
            change: 0, // Mock change for now
            changeLabel: 'vs dün',
        },
        {
            icon: <Users size={24} />,
            iconBg: 'var(--color-secondary-container)',
            iconColor: 'var(--color-secondary)',
            label: 'Toplam Müşteriler',
            value: loading ? '-' : data?.totalCustomers || 0,
            change: 0, // Mock
            changeLabel: 'bu ay',
        },
        {
            icon: <TrendingUp size={24} />,
            iconBg: 'var(--color-accent-container)',
            iconColor: 'var(--color-accent)',
            label: 'Bugünkü Ciro', // Changed from Monthly to Today's
            value: loading ? '-' : `₺${data?.todayRevenue || 0}`,
            change: 0, // Mock
            changeLabel: 'vs dün',
        },
        {
            icon: <Clock size={24} />,
            iconBg: 'var(--color-warning-light)',
            iconColor: 'var(--color-warning)',
            label: 'Bekleyen Randevular', // Changed from Wait Time to Pending Appts
            value: loading ? '-' : data?.pendingCount || 0,
            change: 0, // Mock
            changeLabel: 'aktif',
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
