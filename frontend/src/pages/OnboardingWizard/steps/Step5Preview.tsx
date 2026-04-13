import React from 'react';
import { Building2, Clock, Scissors, Users } from 'lucide-react';
import { DAY_NAMES } from '../../../data/serviceTemplates';
import type { ServiceTemplate } from '../../../data/serviceTemplates';
import type { BusinessInfoData, WorkingHoursData, StaffData } from '../hooks/useOnboardingState';

interface Step5PreviewProps {
    businessInfo: BusinessInfoData;
    workingHours: WorkingHoursData;
    selectedServices: ServiceTemplate[];
    staffList: StaffData[];
}

export const Step5Preview: React.FC<Step5PreviewProps> = ({
    businessInfo,
    workingHours,
    selectedServices,
    staffList,
}) => (
    <>
        <div className="step-header">
            <h2>Önizleme</h2>
            <p>Bilgilerinizi kontrol edin ve tamamlayın</p>
        </div>

        <div className="preview-section">
            <h4><Building2 size={16} /> İşletme Bilgileri</h4>
            <div className="preview-item">
                <span className="preview-label">İsim</span>
                <span className="preview-value">{businessInfo.name}</span>
            </div>
            <div className="preview-item">
                <span className="preview-label">Link</span>
                <span className="preview-value">erandevu.com/book/{businessInfo.slug}</span>
            </div>
            <div className="preview-item">
                <span className="preview-label">Telefon</span>
                <span className="preview-value">{businessInfo.phone}</span>
            </div>
            <div className="preview-item">
                <span className="preview-label">Adres</span>
                <span className="preview-value">{businessInfo.address}, {businessInfo.city}</span>
            </div>
        </div>

        <div className="preview-section">
            <h4><Clock size={16} /> Çalışma Saatleri</h4>
            {Object.entries(workingHours)
                .filter(([, hours]) => hours.isOpen)
                .map(([day, hours]) => (
                    <div key={day} className="preview-item">
                        <span className="preview-label">{DAY_NAMES[day]}</span>
                        <span className="preview-value">{hours.openTime} - {hours.closeTime}</span>
                    </div>
                ))}
        </div>

        {selectedServices.length > 0 && (
            <div className="preview-section">
                <h4><Scissors size={16} /> Hizmetler ({selectedServices.length})</h4>
                {selectedServices.slice(0, 5).map((service, index) => (
                    <div key={index} className="preview-item">
                        <span className="preview-label">{service.name}</span>
                        <span className="preview-value">₺{service.price} • {service.duration}dk</span>
                    </div>
                ))}
                {selectedServices.length > 5 && (
                    <div className="preview-item">
                        <span className="preview-label">...</span>
                        <span className="preview-value">+{selectedServices.length - 5} hizmet daha</span>
                    </div>
                )}
            </div>
        )}

        {staffList.filter(s => s.name).length > 0 && (
            <div className="preview-section">
                <h4><Users size={16} /> Personel</h4>
                {staffList.filter(s => s.name).map((staff, index) => (
                    <div key={index} className="preview-item">
                        <span className="preview-label">{staff.name}</span>
                        <span className="preview-value">
                            {staff.role === 'owner' ? 'İşletme Sahibi' :
                                staff.role === 'barber' ? 'Uzman' : 'Asistan'}
                        </span>
                    </div>
                ))}
            </div>
        )}
    </>
);
