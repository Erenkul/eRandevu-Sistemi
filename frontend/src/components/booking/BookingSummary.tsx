import React from 'react';
import { User, Calendar, Clock } from 'lucide-react';
import type { Service } from './ServiceSelection';
import type { Staff } from '../../types';
import './BookingSummary.css';

interface BookingSummaryProps {
    selectedServices: Service[];
    selectedStaff: Staff | null;
    selectedDate: Date | null;
    selectedTime: string | null;
    onConfirm?: () => void;
}

const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const BookingSummary: React.FC<BookingSummaryProps> = ({
    selectedServices,
    selectedStaff,
    selectedDate,
    selectedTime,
    onConfirm,
}) => {
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

    const formatDate = (date: Date) => {
        return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    };

    const canConfirm = selectedServices.length > 0 && selectedDate && selectedTime;

    return (
        <div className="booking-summary">
            <h2 className="summary-title">Randevu Özeti</h2>

            {/* Services */}
            <div className="summary-section">
                <div className="summary-label">Seçilen Hizmetler</div>
                {selectedServices.length > 0 ? (
                    selectedServices.map((service) => (
                        <div key={service.id} className="summary-item">
                            <div>
                                <div className="summary-item-name">{service.name}</div>
                                <div className="summary-item-detail">{service.duration} dk</div>
                            </div>
                            <div className="summary-item-price">₺{service.price}</div>
                        </div>
                    ))
                ) : (
                    <div className="summary-empty">Henüz hizmet seçilmedi</div>
                )}
            </div>

            {/* Staff */}
            <div className="summary-section">
                <div className="summary-label">Personel</div>
                <div className="summary-info-row">
                    <div className="summary-info-icon">
                        <User size={20} />
                    </div>
                    <div className="summary-info-text">
                        <div className="summary-info-label">Seçilen personel</div>
                        <div className="summary-info-value">
                            {selectedStaff ? selectedStaff.name : 'Farketmez'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Date & Time */}
            <div className="summary-section">
                <div className="summary-label">Tarih & Saat</div>
                <div className="summary-info-row">
                    <div className="summary-info-icon">
                        <Calendar size={20} />
                    </div>
                    <div className="summary-info-text">
                        <div className="summary-info-label">Tarih</div>
                        <div className="summary-info-value">
                            {selectedDate ? formatDate(selectedDate) : 'Seçilmedi'}
                        </div>
                    </div>
                </div>
                <div className="summary-info-row">
                    <div className="summary-info-icon">
                        <Clock size={20} />
                    </div>
                    <div className="summary-info-text">
                        <div className="summary-info-label">Saat</div>
                        <div className="summary-info-value">
                            {selectedTime || 'Seçilmedi'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="summary-divider" />

            {/* Total */}
            <div className="summary-total">
                <div>
                    <div className="summary-total-label">Toplam</div>
                    <div className="summary-duration">
                        Tahmini süre: {totalDuration} dakika
                    </div>
                </div>
                <div className="summary-total-price">₺{totalPrice}</div>
            </div>

            {/* Confirm Button */}
            {onConfirm && (
                <div className="summary-footer">
                    <button
                        className="summary-confirm-button"
                        onClick={onConfirm}
                        disabled={!canConfirm}
                    >
                        Randevuyu Onayla
                    </button>
                </div>
            )}
        </div>
    );
};
