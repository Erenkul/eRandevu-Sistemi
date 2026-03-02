import React from 'react';
import { Scissors, Clock, Check } from 'lucide-react';
import './ServiceSelection.css';

export interface Service {
    id: string;
    name: string;
    duration: number;
    price: number;
    category: string;
}

interface ServiceSelectionProps {
    availableServices?: Service[];
    selectedServices: Service[];
    onServiceToggle: (service: Service) => void;
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({
    availableServices = [],
    selectedServices,
    onServiceToggle,
}) => {
    // If no services provided, show empty
    if (availableServices.length === 0) {
        return (
            <div className="service-selection">
                <h1 className="service-selection-title">Hizmet Seçin</h1>
                <p className="service-selection-subtitle">
                    Bu işletmeye ait hizmet bulunamadı.
                </p>
            </div>
        );
    }

    // Group by category, default 'Genel' if missing
    const categories = [...new Set(availableServices.map((s) => s.category || 'Genel'))];

    const isSelected = (service: Service) =>
        selectedServices.some((s) => s.id === service.id);

    return (
        <div className="service-selection">
            <h1 className="service-selection-title">Hizmet Seçin</h1>
            <p className="service-selection-subtitle">
                Almak istediğiniz hizmetleri seçin. Birden fazla hizmet seçebilirsiniz.
            </p>

            {categories.map((category) => (
                <div key={category} className="service-category">
                    <h3 className="service-category-title">{category}</h3>
                    <div className="service-list">
                        {availableServices
                            .filter((s) => (s.category || 'Genel') === category)
                            .map((service) => (
                                <div
                                    key={service.id}
                                    className={`service-card ${isSelected(service) ? 'selected' : ''}`}
                                    onClick={() => onServiceToggle(service)}
                                >
                                    <div className="service-icon">
                                        <Scissors size={24} />
                                    </div>
                                    <div className="service-info">
                                        <div className="service-name">{service.name}</div>
                                        <div className="service-details">
                                            <span>
                                                <Clock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                                {service.duration} dk
                                            </span>
                                        </div>
                                    </div>
                                    <div className="service-price">₺{service.price}</div>
                                    <div className="service-checkbox">
                                        {isSelected(service) && <Check size={16} />}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
