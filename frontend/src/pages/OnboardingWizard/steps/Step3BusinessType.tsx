import React from 'react';
import { Check, Scissors, Sparkles, Stethoscope, Leaf, Dumbbell, Building2 } from 'lucide-react';
import { SERVICE_TEMPLATES, type ServiceTemplate } from '../../data/serviceTemplates';

const BUSINESS_TYPE_ICONS: Record<string, React.ElementType> = {
    Scissors,
    Sparkles,
    Stethoscope,
    Leaf,
    Dumbbell,
    Building2,
};

interface Step3BusinessTypeProps {
    selectedBusinessType: string | null;
    availableServices: ServiceTemplate[];
    selectedServices: ServiceTemplate[];
    onBusinessTypeSelect: (typeKey: string) => void;
    onToggleService: (service: ServiceTemplate) => void;
}

export const Step3BusinessType: React.FC<Step3BusinessTypeProps> = ({
    selectedBusinessType,
    availableServices,
    selectedServices,
    onBusinessTypeSelect,
    onToggleService,
}) => (
    <>
        <div className="step-header">
            <h2>İşletme Türü</h2>
            <p>İşletmenize uygun türü seçin, hazır hizmetlerle başlayın</p>
        </div>

        <div className="business-type-grid">
            {Object.entries(SERVICE_TEMPLATES).map(([key, template]) => {
                const IconComponent = BUSINESS_TYPE_ICONS[template.icon] || Building2;
                return (
                    <div
                        key={key}
                        className={`business-type-card ${selectedBusinessType === key ? 'selected' : ''}`}
                        onClick={() => onBusinessTypeSelect(key)}
                    >
                        <div className="business-type-icon">
                            <IconComponent size={24} />
                        </div>
                        <div className="business-type-name">{template.name}</div>
                    </div>
                );
            })}
        </div>

        {selectedBusinessType && availableServices.length > 0 && (
            <div className="services-preview">
                <h4>
                    <Check size={16} />
                    Eklenecek Hizmetler ({selectedServices.length}/{availableServices.length})
                </h4>
                <ul className="service-list">
                    {availableServices.map((service, index) => {
                        const isSelected = selectedServices.some(s => s.name === service.name);
                        return (
                            <li
                                key={index}
                                className={`service-list-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => onToggleService(service)}
                            >
                                <div className="service-check-icon">
                                    {isSelected && <Check size={13} />}
                                </div>
                                <div className="service-info">
                                    <span className="service-item-name">{service.name}</span>
                                </div>
                                <div className="service-meta">
                                    <span className="service-tag-price">₺{service.price}</span>
                                    <span className="service-tag-duration">{service.duration}dk</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        )}
    </>
);
