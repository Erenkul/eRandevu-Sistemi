import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Home, CheckCircle } from 'lucide-react';
import {
    BookingHeader,
    BookingSidebar,
    ServiceSelection,
    StaffSelection,
    DateTimeSelection,
    BookingSummary,
    ContactForm,
    type Service,
    type Staff,
    type ContactData,
} from '../components/booking';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import './BookingPage.css';

// Mock business data
const businessData: Record<string, { name: string; image: string }> = {
    'elite-barber': { name: 'Elite Barber Shop', image: '💈' },
    'modern-kuafor': { name: 'Modern Kuaför', image: '💇' },
    'style-studio': { name: 'Style Studio', image: '✨' },
    'fit-gym': { name: 'FitLife Gym', image: '🏋️' },
    'dental-smile': { name: 'Dental Smile Kliniği', image: '🦷' },
    'zen-spa': { name: 'Zen Spa & Wellness', image: '🧘' },
    'demo': { name: 'Demo İşletme', image: '🏢' },
};

export const BookingPage: React.FC = () => {
    const { businessId } = useParams<{ businessId: string }>();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [contactData, setContactData] = useState<ContactData | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState('');

    const business = businessData[businessId || 'demo'] || businessData['demo'];

    const handleServiceToggle = (service: Service) => {
        setSelectedServices((prev) => {
            const exists = prev.some((s) => s.id === service.id);
            if (exists) {
                return prev.filter((s) => s.id !== service.id);
            }
            return [...prev, service];
        });
    };

    const handleStaffSelect = (staff: Staff | null) => {
        setSelectedStaff(staff);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null);
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
    };

    const handleContactSubmit = (data: ContactData) => {
        setContactData(data);
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return selectedServices.length > 0;
            case 1:
                return true;
            case 2:
                return selectedDate !== null && selectedTime !== null;
            case 3:
                return contactData !== null && contactData.fullName && contactData.phone;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep < 3 && canProceed()) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const generateConfirmationCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleConfirm = () => {
        const code = generateConfirmationCode();
        setConfirmationCode(code);
        setIsConfirmed(true);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleNewBooking = () => {
        setCurrentStep(0);
        setSelectedServices([]);
        setSelectedStaff(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setContactData(null);
        setIsConfirmed(false);
        setConfirmationCode('');
    };

    // Format date for confirmation
    const formatDate = (date: Date) => {
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${days[date.getDay()]}`;
    };

    // Confirmation Success Screen
    if (isConfirmed) {
        return (
            <div className="booking-page">
                <BookingHeader currentStep={4} />
                <div className="booking-success">
                    <div className="success-icon">
                        <CheckCircle size={64} />
                    </div>
                    <h1>Randevunuz Onaylandı! 🎉</h1>
                    <p className="success-message">
                        Randevunuz başarıyla oluşturuldu. Onay bilgileri {contactData?.phone} numaralı telefonunuza SMS olarak gönderilecektir.
                    </p>

                    <div className="confirmation-card">
                        <div className="confirmation-code">
                            <span>Onay Kodu</span>
                            <strong>{confirmationCode}</strong>
                        </div>

                        <div className="confirmation-details">
                            <div className="detail-row">
                                <span className="detail-label">İşletme</span>
                                <span className="detail-value">{business.image} {business.name}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Tarih</span>
                                <span className="detail-value">{selectedDate && formatDate(selectedDate)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Saat</span>
                                <span className="detail-value">{selectedTime}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Hizmetler</span>
                                <span className="detail-value">{selectedServices.map(s => s.name).join(', ')}</span>
                            </div>
                            {selectedStaff && (
                                <div className="detail-row">
                                    <span className="detail-label">Personel</span>
                                    <span className="detail-value">{selectedStaff.name}</span>
                                </div>
                            )}
                            <div className="detail-row">
                                <span className="detail-label">Toplam</span>
                                <span className="detail-value total">₺{selectedServices.reduce((sum, s) => sum + s.price, 0)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="success-actions">
                        <PrimaryButton icon={Home} onClick={handleGoHome}>
                            Ana Sayfaya Dön
                        </PrimaryButton>
                        <SecondaryButton onClick={handleNewBooking}>
                            Yeni Randevu Al
                        </SecondaryButton>
                    </div>

                    <p className="success-note">
                        📱 WhatsApp hatırlatması açık ise randevunuzdan 1 saat önce hatırlatma alacaksınız.
                    </p>
                </div>
            </div>
        );
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <ServiceSelection
                        selectedServices={selectedServices}
                        onServiceToggle={handleServiceToggle}
                    />
                );
            case 1:
                return (
                    <StaffSelection
                        selectedStaff={selectedStaff}
                        onStaffSelect={handleStaffSelect}
                    />
                );
            case 2:
                return (
                    <DateTimeSelection
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        onDateSelect={handleDateSelect}
                        onTimeSelect={handleTimeSelect}
                    />
                );
            case 3:
                return <ContactForm onSubmit={handleContactSubmit} />;
            default:
                return null;
        }
    };

    return (
        <div className="booking-page">
            <BookingHeader currentStep={currentStep} businessName={business.name} onBack={() => navigate('/')} />

            <div className="booking-content">
                <div className="booking-sidebar-desktop">
                    <BookingSidebar
                        currentStep={currentStep}
                        onStepClick={(step) => step < currentStep && setCurrentStep(step)}
                    />
                </div>

                <div className="booking-main">
                    <div className="booking-step-content">
                        {renderStepContent()}

                        <div className="booking-navigation">
                            {currentStep > 0 ? (
                                <SecondaryButton icon={ArrowLeft} onClick={handleBack}>
                                    Geri
                                </SecondaryButton>
                            ) : (
                                <SecondaryButton icon={Home} onClick={handleGoHome}>
                                    Ana Sayfa
                                </SecondaryButton>
                            )}

                            <PrimaryButton
                                icon={currentStep === 3 ? Check : ArrowRight}
                                iconPosition="right"
                                onClick={currentStep === 3 ? handleConfirm : handleNext}
                                disabled={!canProceed()}
                            >
                                {currentStep === 3 ? 'Randevuyu Onayla' : 'Devam Et'}
                            </PrimaryButton>
                        </div>
                    </div>

                    <div className="booking-summary-desktop">
                        <BookingSummary
                            selectedServices={selectedServices}
                            selectedStaff={selectedStaff}
                            selectedDate={selectedDate}
                            selectedTime={selectedTime}
                            onConfirm={currentStep === 3 ? handleConfirm : undefined}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
