import React from 'react';
import { Check, ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { SecondaryButton } from '../ui';
import './BookingHeader.css';

interface BookingHeaderProps {
    currentStep: number;
    businessName?: string;
    onBack?: () => void;
}

const steps = [
    { label: 'Hizmet Seçimi', shortLabel: 'Hizmet' },
    { label: 'Personel Seçimi', shortLabel: 'Personel' },
    { label: 'Tarih & Saat', shortLabel: 'Tarih' },
    { label: 'Bilgileriniz', shortLabel: 'Bilgi' },
];

export const BookingHeader: React.FC<BookingHeaderProps> = ({ currentStep, businessName, onBack }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleDashboard = () => {
        if (user) {
            navigate(user.role === 'customer' ? '/customer' : '/admin');
        }
    };

    return (
        <header className="booking-header">
            <div className="booking-header-content">
                <div className="booking-header-left">
                    {onBack && (
                        <button className="booking-back-btn" onClick={onBack}>
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="booking-logo">
                        e<span>Randevu</span>
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

                <div className="booking-header-right" style={{ marginLeft: '20px', display: 'flex', alignItems: 'center' }}>
                    {user && (
                        <SecondaryButton icon={User} onClick={handleDashboard} style={{ background: '#f3f4f6' }}>
                            Panelime Dön
                        </SecondaryButton>
                    )}
                </div>
            </div>
        </header>
    );
};

