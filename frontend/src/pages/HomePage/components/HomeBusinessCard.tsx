import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, ArrowRight } from 'lucide-react';
import { PrimaryButton } from '../../../components/ui';
import { useServices } from '../../../hooks';
import type { Business } from '../../../types';

interface HomeBusinessCardProps {
    business: Business;
    isOpen: boolean;
    onBook: (slug: string) => void;
}

export const HomeBusinessCard = React.memo<HomeBusinessCardProps>(({ business, isOpen, onBook }) => {
    const { data: services, loading } = useServices(business.id);

    const getServiceDisplay = () => {
        if (loading) return <span className="business-category">Hizmetler Yükleniyor...</span>;
        if (!services || services.length === 0) return <span className="business-category">Hizmet bilgisi yok</span>;

        const listedServices = services.slice(0, 3).map(s => s.name).join(', ');
        const minPrice = Math.min(...services.map(s => s.price));

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="business-category" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {listedServices}{services.length > 3 ? '...' : ''}
                </span>
                <span style={{ fontSize: '13px', color: '#6366f1', fontWeight: 500 }}>
                    ₺{minPrice}'den başlayan fiyatlarla
                </span>
            </div>
        );
    };

    return (
        <motion.div
            key={business.id}
            className="business-card interactive"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <div className="business-card-header">
                <div className="business-avatar">
                    {business.name.charAt(0)}
                </div>
                <div className={`business-status ${isOpen ? 'open' : 'closed'}`}>
                    <Clock size={12} />
                    {isOpen ? 'Açık' : 'Kapalı'}
                </div>
            </div>
            <div className="business-card-body">
                <h3>{business.name}</h3>
                {getServiceDisplay()}
                <div className="business-rating" style={{ marginTop: '8px' }}>
                    <Star size={14} fill="currentColor" />
                    <span>4.9</span>
                    <span className="review-count">(Yeni)</span>
                </div>
                <div className="business-location">
                    <MapPin size={14} />
                    {business.city}
                </div>
            </div>
            <div className="business-card-footer">
                <PrimaryButton
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => onBook(business.slug)}
                >
                    Randevu Al
                </PrimaryButton>
            </div>
        </motion.div>
    );
});
