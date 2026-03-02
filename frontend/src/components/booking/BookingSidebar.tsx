import React from 'react';
import { Scissors, User, Calendar, FileText, Check } from 'lucide-react';
import './BookingSidebar.css';

interface BookingSidebarProps {
    currentStep: number;
    onStepClick: (step: number) => void;
}

const steps = [
    { icon: Scissors, label: 'Hizmet Seçimi', desc: 'Almak istediğiniz hizmetler' },
    { icon: User, label: 'Personel Seçimi', desc: 'Tercih ettiğiniz personel' },
    { icon: Calendar, label: 'Tarih & Saat', desc: 'Uygun tarih ve saat' },
    { icon: FileText, label: 'Bilgileriniz', desc: 'İletişim bilgileriniz' },
];

export const BookingSidebar: React.FC<BookingSidebarProps> = ({
    currentStep,
    onStepClick,
}) => {
    return (
        <aside className="booking-sidebar">
            <h2 className="booking-sidebar-title">Randevu Adımları</h2>
            <div className="booking-sidebar-steps">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;
                    const isDisabled = index > currentStep;

                    return (
                        <button
                            key={index}
                            className={`sidebar-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''
                                } ${isDisabled ? 'disabled' : ''}`}
                            onClick={() => !isDisabled && onStepClick(index)}
                            disabled={isDisabled}
                        >
                            <div className="sidebar-step-icon">
                                {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                            </div>
                            <div className="sidebar-step-content">
                                <div className="sidebar-step-label">{step.label}</div>
                                <div className="sidebar-step-desc">{step.desc}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
};
