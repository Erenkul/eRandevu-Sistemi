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
    selectedServices: Service[];
    onServiceToggle: (service: Service) => void;
}

const mockServices: Service[] = [
    { id: '1', name: 'Saç Kesimi', duration: 30, price: 150, category: 'Saç' },
    { id: '2', name: 'Saç Yıkama & Şekillendirme', duration: 20, price: 80, category: 'Saç' },
    { id: '3', name: 'Saç Boyama', duration: 90, price: 350, category: 'Saç' },
    { id: '4', name: 'Sakal Düzeltme', duration: 20, price: 80, category: 'Sakal' },
    { id: '5', name: 'Sakal Şekillendirme', duration: 30, price: 120, category: 'Sakal' },
    { id: '6', name: 'Cilt Bakımı', duration: 45, price: 200, category: 'Bakım' },
    { id: '7', name: 'Yüz Maskesi', duration: 30, price: 150, category: 'Bakım' },
];

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({
    selectedServices,
    onServiceToggle,
}) => {
    const categories = [...new Set(mockServices.map((s) => s.category))];

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
                        {mockServices
                            .filter((s) => s.category === category)
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
