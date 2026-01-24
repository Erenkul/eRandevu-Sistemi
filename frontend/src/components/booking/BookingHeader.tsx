import React from 'react';
import { Check, ArrowLeft } from 'lucide-react';
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
            </div>
        </header>
    );
};

