import React from 'react';
import { Check, ArrowLeft, User, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { SecondaryButton, Logo } from '../ui';
import './BookingHeader.css';

interface BookingHeaderProps {
    currentStep: number;
    businessName?: string;
    businessId?: string;
    onBack?: () => void;
}

const steps = [
    { label: 'Hizmet Seçimi', shortLabel: 'Hizmet' },
    { label: 'Personel Seçimi', shortLabel: 'Personel' },
    { label: 'Tarih & Saat', shortLabel: 'Tarih' },
    { label: 'Bilgileriniz', shortLabel: 'Bilgi' },
];

export const BookingHeader: React.FC<BookingHeaderProps> = ({ currentStep, businessName, businessId, onBack }) => {
    const { user, toggleFavorite } = useAuth();
    const navigate = useNavigate();

    const handleDashboard = () => {
        if (user) {
            navigate(user.role === 'customer' ? '/customer' : '/admin');
        }
    };

    const handleFavoriteClick = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (businessId) {
            try {
                await toggleFavorite(businessId);
            } catch (err) {
                console.error('Favori ekleme hatası:', err);
            }
        }
    };

    const isFavorite = user?.favoriteBusinessIds?.includes(businessId || '') ?? false;
    const isCustomer = user?.role === 'customer';

    return (
        <header className="booking-header">
            <div className="booking-header-content">
                <div className="booking-header-left">
                    {onBack && (
                        <button className="booking-back-btn" onClick={onBack}>
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="booking-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <Logo variant="compact" />
                    </div>
                    {businessName && (
                        <div className="booking-business-name">
                            <span className="separator">|</span>
                            {businessName}
                        </div>
                    )}
                </div>

                <div className="booking-steps">
                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            <div
                                className={`booking-step ${index === currentStep ? 'active' : ''
                                    } ${index < currentStep ? 'completed' : ''}`}
                            >
                                <div className="booking-step-number">
                                    {index < currentStep ? <Check size={16} /> : index + 1}
                                </div>
                                <span className="booking-step-label">{step.label}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`booking-step-separator ${index < currentStep ? 'completed' : ''
                                        }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="booking-header-right" style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isCustomer && businessId && (
                        <button
                            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                            onClick={handleFavoriteClick}
                            aria-label={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                            title={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                        >
                            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>
                    )}
                    {user && (
                        <SecondaryButton icon={User} onClick={handleDashboard} style={{ background: '#f3f4f6' }}>
                            Sayfama Dön
                        </SecondaryButton>
                    )}
                </div>
            </div>
        </header>
    );
};

