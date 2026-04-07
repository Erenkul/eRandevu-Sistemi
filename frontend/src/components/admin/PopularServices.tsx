import React, { useState, useEffect } from 'react';
import { Scissors } from 'lucide-react';
import { Card, CardHeader, SkeletonCard } from '../ui';
import { getServices } from '../../services/firestore';
import { useAuth } from '../../contexts/AuthContext';
import './PopularServices.css';

interface ServiceStat {
    name: string;
    count: number;
    color: string;
}

const CHART_COLORS = [
    'var(--color-primary)',
    'var(--color-secondary)',
    'var(--color-accent)',
    'var(--color-warning)',
    'var(--color-chart-purple)',
];

interface PopularServicesProps {
    businessId?: string;
}

export const PopularServices: React.FC<PopularServicesProps> = ({ businessId: propBusinessId }) => {
    const { user } = useAuth();
    const [services, setServices] = useState<ServiceStat[]>([]);
    const [loading, setLoading] = useState(true);

    const businessId = propBusinessId || user?.businessId;

    useEffect(() => {
        if (!businessId) return;

        const bid = businessId;

        async function fetchPopularServices() {
            setLoading(true);
            try {
                const serviceList = await getServices(bid);
                const stats: ServiceStat[] = serviceList
                    .map((s, i) => ({
                        name: s.name,
                        count: 0,
                        color: CHART_COLORS[i % CHART_COLORS.length],
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                setServices(stats);
            } catch (err) {
                console.error('Failed to fetch popular services:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchPopularServices();
    }, [businessId]);

    const maxCount = services.length > 0 ? Math.max(...services.map((s) => s.count), 1) : 1;

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
                {loading ? (
                    <div style={{ padding: '16px' }}>
                        <SkeletonCard lines={4} />
                    </div>
                ) : services.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        Henüz hizmet verisi yok
                    </div>
                ) : (
                    services.map((service, index) => (
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
                    ))
                )}
            </div>
        </Card>
    );
};
