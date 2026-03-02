// frontend/src/pages/BookingPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Home, CheckCircle, AlertCircle } from 'lucide-react';
import {
    BookingHeader,
    BookingSidebar,
    ServiceSelection,
    StaffSelection,
    DateTimeSelection,
    BookingSummary,
    ContactForm,
    type ContactData,
} from '../components/booking';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import './BookingPage.css';
import { useBusinessBySlug, useServices, useStaff, useAvailableSlots } from '../hooks';
import { createAppointment } from '../services/firestore';
import type { Service, Staff } from '../types';

// ServiceSelection kendi Service tipini kullanıyor (duration: number).
// Firestore'dan gelen Service'deki durationMinutes'ı burada map ediyoruz.
const toSelectionService = (s: Service) => ({
    ...s,
    duration: s.durationMinutes,
    category: s.category || 'Genel',
});

export const BookingPage: React.FC = () => {
    const { businessId: businessSlug } = useParams<{ businessId: string }>();
    const navigate = useNavigate();

    const { data: business, loading: businessLoading, error: businessError } = useBusinessBySlug(businessSlug);
    const { data: services } = useServices(business?.id);
    const { data: staffList } = useStaff(business?.id);

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedIsoDate, setSelectedIsoDate] = useState<string | null>(null);
    const [contactData, setContactData] = useState<ContactData | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

    const { data: availableSlots, loading: slotsLoading } = useAvailableSlots({
        businessId: business?.id,
        staffId: selectedStaff?.id,
        date: selectedDate || undefined,
        durationMinutes: totalDuration,
    });

    const handleServiceToggle = (service: Service) => {
        setSelectedServices((prev) => {
            const exists = prev.some((s) => s.id === service.id);
            return exists ? prev.filter((s) => s.id !== service.id) : [...prev, service];
        });
    };

    const handleStaffSelect = (staff: Staff | null) => {
        setSelectedStaff(staff);
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedIsoDate(null);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        setSelectedIsoDate(null);
    };

    const handleTimeSelect = (time: string, isoDate: string) => {
        setSelectedTime(time);
        setSelectedIsoDate(isoDate);
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return selectedServices.length > 0;
            case 1: return selectedStaff !== null;
            case 2: return selectedDate !== null && selectedTime !== null && selectedIsoDate !== null;
            case 3: {
                if (!contactData) return false;
                const cleanPhone = contactData.phone.replace(/\D/g, '');
                const validPhone = cleanPhone.length === 11 && cleanPhone.startsWith('05');
                const validName = contactData.fullName.trim().split(' ').length >= 2;
                return validName && validPhone;
            }
            default: return false;
        }
    };

    const handleNext = () => {
        if (currentStep < 3 && canProceed()) setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
    };

    const handleConfirm = async () => {
        if (!business || !contactData || !selectedStaff || !selectedIsoDate) return;

        try {
            setIsSubmitting(true);
            setError(null);

            const appointmentId = await createAppointment({
                businessId: business.id,
                services: selectedServices,
                staffId: selectedStaff.id,
                staffName: selectedStaff.name,
                dateTime: new Date(selectedIsoDate),
                customerName: contactData.fullName,
                customerPhone: contactData.phone,
                customerEmail: contactData.email || undefined,
                customerNote: contactData.note || undefined,
            });

            setConfirmationCode(appointmentId.slice(0, 8).toUpperCase());
            setIsConfirmed(true);
        } catch (err: any) {
            console.error('Booking error:', err);
            setError(err.message || 'Randevu oluşturulurken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoHome = () => navigate('/');

    const handleNewBooking = () => {
        setCurrentStep(0);
        setSelectedServices([]);
        setSelectedStaff(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedIsoDate(null);
        setContactData(null);
        setIsConfirmed(false);
        setConfirmationCode('');
        setError(null);
    };

    const formatDate = (date: Date) => {
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${days[date.getDay()]}`;
    };

    if (businessLoading) {
        return <div className="loading-screen">İşletme bilgileri yükleniyor...</div>;
    }

    if (businessError || !business) {
        return (
            <div className="error-screen">
                <AlertCircle size={48} color="var(--color-error)" />
                <h2>İşletme Bulunamadı</h2>
                <p>Aradığınız işletme mevcut değil veya erişilemiyor.</p>
                <SecondaryButton onClick={handleGoHome}>Ana Sayfaya Dön</SecondaryButton>
            </div>
        );
    }

    if (isConfirmed) {
        return (
            <div className="booking-page">
                <BookingHeader currentStep={4} businessName={business.name} />
                <div className="booking-success">
                    <div className="success-icon"><CheckCircle size={64} /></div>
                    <h1>Randevunuz Onaylandı! 🎉</h1>
                    <p className="success-message">
                        Randevunuz başarıyla oluşturuldu. Onay bilgileri {contactData?.phone} numaralı telefonunuza iletilecektir.
                    </p>

                    <div className="confirmation-card">
                        <div className="confirmation-code">
                            <span>Referans Kodu</span>
                            <strong>{confirmationCode}</strong>
                        </div>
                        <div className="confirmation-details">
                            <div className="detail-row">
                                <span className="detail-label">İşletme</span>
                                <span className="detail-value">{business.name}</span>
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
                        <PrimaryButton icon={Home} onClick={handleGoHome}>Ana Sayfaya Dön</PrimaryButton>
                        <SecondaryButton onClick={handleNewBooking}>Yeni Randevu Al</SecondaryButton>
                    </div>

                    <p className="success-note">
                        📱 WhatsApp hatırlatması açıksa randevunuzdan 1 saat önce hatırlatma alacaksınız.
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
                        // FIX: availableServices artık geçiliyor — daha önce eksikti, liste hep boştu
                        availableServices={services.map(toSelectionService)}
                        selectedServices={selectedServices.map(toSelectionService)}
                        onServiceToggle={(s) => {
                            const original = services.find((srv) => srv.id === s.id);
                            if (original) handleServiceToggle(original);
                        }}
                    />
                );
            case 1:
                return (
                    <StaffSelection
                        staffList={staffList}
                        selectedStaff={selectedStaff}
                        onStaffSelect={handleStaffSelect}
                    />
                );
            case 2:
                return (
                    <DateTimeSelection
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        availableSlots={availableSlots}
                        loading={slotsLoading}
                        onDateSelect={handleDateSelect}
                        onTimeSelect={handleTimeSelect}
                    />
                );
            case 3:
                return (
                    <>
                        {error && (
                            <div className="error-message" style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#ef4444', marginBottom: 16 }}>
                                <AlertCircle size={16} />{error}
                            </div>
                        )}
                        {/* FIX: onSubmit → onChange. Artık her tuş vuruşunda değil, sadece state güncelleniyor */}
                        <ContactForm onChange={setContactData} />
                    </>
                );
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
                        onStepClick={(step) => { if (step < currentStep) setCurrentStep(step); }}
                    />
                </div>

                <div className="booking-main">
                    <div className="booking-step-content">
                        {renderStepContent()}

                        <div className="booking-navigation">
                            {currentStep > 0 ? (
                                <SecondaryButton icon={ArrowLeft} onClick={handleBack} disabled={isSubmitting}>
                                    Geri
                                </SecondaryButton>
                            ) : (
                                <SecondaryButton icon={Home} onClick={handleGoHome} disabled={isSubmitting}>
                                    Ana Sayfa
                                </SecondaryButton>
                            )}

                            <PrimaryButton
                                icon={currentStep === 3 ? Check : ArrowRight}
                                iconPosition="right"
                                onClick={currentStep === 3 ? handleConfirm : handleNext}
                                disabled={!canProceed() || isSubmitting}
                            >
                                {isSubmitting ? 'İşleniyor...' : currentStep === 3 ? 'Randevuyu Onayla' : 'Devam Et'}
                            </PrimaryButton>
                        </div>
                    </div>

                    <div className="booking-summary-desktop">
                        <BookingSummary
                            selectedServices={selectedServices.map(toSelectionService)}
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
