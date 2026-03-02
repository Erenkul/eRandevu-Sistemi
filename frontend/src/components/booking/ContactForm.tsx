// frontend/src/components/booking/ContactForm.tsx
import React, { useState, useEffect } from 'react';
import { User, MessageCircle, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '../ui';
import './ContactForm.css';

export interface ContactData {
    fullName: string;
    phone: string;
    email: string;
    note?: string;
    whatsappReminder: boolean;
}

interface ContactFormProps {
    // onChange ile parent her değişiklikte güncel veriyi alır.
    // onSubmit kaldırıldı — her tuş vuruşunda tetikleniyordu.
    onChange: (data: ContactData) => void;
}

const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
};

const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11 && cleaned.startsWith('05');
};

const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const ContactForm: React.FC<ContactFormProps> = ({ onChange }) => {
    const [formData, setFormData] = useState<ContactData>({
        fullName: '',
        phone: '',
        email: '',
        note: '',
        whatsappReminder: true,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ContactData, string>>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Parent'ı her değişiklikte bilgilendir — onSubmit yok, render storm yok
    useEffect(() => {
        onChange(formData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    const updateField = (name: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const formatted = name === 'phone' ? formatPhoneNumber(value) : value;
        updateField(name, formatted);
    };

    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));

        const newErrors = { ...errors };
        if (field === 'fullName') {
            if (!formData.fullName.trim()) newErrors.fullName = 'Ad soyad gerekli';
            else if (formData.fullName.trim().split(' ').length < 2) newErrors.fullName = 'Lütfen ad ve soyad girin';
            else delete newErrors.fullName;
        }
        if (field === 'phone') {
            if (!formData.phone) newErrors.phone = 'Telefon numarası gerekli';
            else if (!validatePhone(formData.phone)) newErrors.phone = 'Geçerli numara girin (05XX XXX XX XX)';
            else delete newErrors.phone;
        }
        if (field === 'email' && formData.email) {
            if (!validateEmail(formData.email)) newErrors.email = 'Geçerli bir e-posta adresi girin';
            else delete newErrors.email;
        }
        setErrors(newErrors);
    };

    const isValidName = formData.fullName.trim().split(' ').length >= 2 && formData.fullName.trim().length > 0;

    return (
        <div className="contact-form">
            <h1 className="contact-form-title">İletişim Bilgileri</h1>
            <p className="contact-form-subtitle">
                Rezervasyon detaylarını size iletebilmemiz için bilgilerinizi girin.
            </p>

            <div className="contact-card">
                <div className="contact-card-header">
                    <div className="contact-card-icon"><User size={20} /></div>
                    <h3 className="contact-card-title">Kişisel Bilgiler</h3>
                </div>

                <div className="form-field">
                    <Input
                        label="Ad Soyad *"
                        name="fullName"
                        placeholder="Adınızı ve soyadınızı girin"
                        value={formData.fullName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('fullName')}
                        className={errors.fullName && touched.fullName ? 'input-error' : ''}
                    />
                    {errors.fullName && touched.fullName ? (
                        <span className="field-error"><AlertCircle size={14} />{errors.fullName}</span>
                    ) : isValidName && (
                        <span className="field-success"><CheckCircle size={14} />Geçerli ad soyad</span>
                    )}
                </div>

                <div className="contact-form-row" style={{ marginTop: 16 }}>
                    <div className="form-field">
                        <Input
                            label="Telefon Numarası *"
                            name="phone"
                            placeholder="05XX XXX XX XX"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={() => handleBlur('phone')}
                            className={errors.phone && touched.phone ? 'input-error' : ''}
                        />
                        {errors.phone && touched.phone ? (
                            <span className="field-error"><AlertCircle size={14} />{errors.phone}</span>
                        ) : validatePhone(formData.phone) && (
                            <span className="field-success"><CheckCircle size={14} />Geçerli telefon numarası</span>
                        )}
                    </div>

                    <div className="form-field">
                        <Input
                            label="E-posta Adresi (opsiyonel)"
                            name="email"
                            type="email"
                            placeholder="ornek@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={() => handleBlur('email')}
                            className={errors.email && touched.email ? 'input-error' : ''}
                        />
                        {errors.email && touched.email ? (
                            <span className="field-error"><AlertCircle size={14} />{errors.email}</span>
                        ) : formData.email && validateEmail(formData.email) && (
                            <span className="field-success"><CheckCircle size={14} />Geçerli e-posta</span>
                        )}
                    </div>
                </div>

                <div className="form-field" style={{ marginTop: 16 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>
                        Not (Opsiyonel)
                    </label>
                    <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="İşletmeye iletmek istediğiniz özel bir notunuz var mı?"
                        style={{
                            width: '100%',
                            minHeight: '80px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '0.95rem',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>
            </div>

            <div className="whatsapp-toggle">
                <div className="whatsapp-icon"><MessageCircle size={20} /></div>
                <div className="whatsapp-info">
                    <div className="whatsapp-title">WhatsApp Hatırlatma</div>
                    <div className="whatsapp-desc">Randevu saatinden 1 saat önce mesaj al.</div>
                </div>
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={formData.whatsappReminder}
                        onChange={(e) => updateField('whatsappReminder', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                </label>
            </div>

            <div className="privacy-notice">
                <Shield size={16} />
                <span>
                    Kişisel verileriniz 6698 sayılı KVKK kapsamında işlenmekte ve korunmaktadır.
                    Randevunuzu onaylayarak{' '}
                    <a href="#" onClick={(e) => e.preventDefault()}>Aydınlatma Metni</a>'ni okuduğunuzu kabul edersiniz.
                </span>
            </div>
        </div>
    );
};
