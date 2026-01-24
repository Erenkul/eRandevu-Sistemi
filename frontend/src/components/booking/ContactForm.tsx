import React, { useState, useEffect } from 'react';
import { User, MessageCircle, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '../ui';
import './ContactForm.css';

interface ContactFormProps {
    onSubmit: (data: ContactData) => void;
}

export interface ContactData {
    fullName: string;
    phone: string;
    email: string;
    whatsappReminder: boolean;
}

// Phone format helper
const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
};

// Phone validation
const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11 && cleaned.startsWith('05');
};

// Email validation
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<ContactData>({
        fullName: '',
        phone: '',
        email: '',
        whatsappReminder: true,
    });

    const [errors, setErrors] = useState<Partial<ContactData>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Validate and submit when form is valid
    useEffect(() => {
        const isValid = formData.fullName.trim().length > 0 &&
            validatePhone(formData.phone) &&
            (formData.email === '' || validateEmail(formData.email));

        if (isValid && formData.fullName && formData.phone) {
            onSubmit(formData);
        }
    }, [formData, onSubmit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const formatted = formatPhoneNumber(value);
            setFormData((prev) => ({ ...prev, phone: formatted }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        validateField(field);
    };

    const validateField = (field: string) => {
        const newErrors = { ...errors };

        switch (field) {
            case 'fullName':
                if (!formData.fullName.trim()) {
                    newErrors.fullName = 'Ad soyad gerekli';
                } else if (formData.fullName.trim().split(' ').length < 2) {
                    newErrors.fullName = 'Lütfen ad ve soyad girin';
                } else {
                    delete newErrors.fullName;
                }
                break;
            case 'phone':
                if (!formData.phone) {
                    newErrors.phone = 'Telefon numarası gerekli';
                } else if (!validatePhone(formData.phone)) {
                    newErrors.phone = 'Geçerli bir telefon numarası girin (05XX XXX XX XX)';
                } else {
                    delete newErrors.phone;
                }
                break;
            case 'email':
                if (formData.email && !validateEmail(formData.email)) {
                    newErrors.email = 'Geçerli bir e-posta adresi girin';
                } else {
                    delete newErrors.email;
                }
                break;
        }

        setErrors(newErrors);
    };

    return (
        <div className="contact-form">
            <h1 className="contact-form-title">İletişim Bilgileri</h1>
            <p className="contact-form-subtitle">
                Rezervasyon detaylarını size iletebilmemiz için bilgilerinizi girin.
            </p>

            <div className="contact-card">
                <div className="contact-card-header">
                    <div className="contact-card-icon">
                        <User size={20} />
                    </div>
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
                        <span className="field-error">
                            <AlertCircle size={14} />
                            {errors.fullName}
                        </span>
                    ) : formData.fullName && formData.fullName.trim().split(' ').length >= 2 && (
                        <span className="field-success">
                            <CheckCircle size={14} />
                            Geçerli ad soyad
                        </span>
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
                            <span className="field-error">
                                <AlertCircle size={14} />
                                {errors.phone}
                            </span>
                        ) : formData.phone && validatePhone(formData.phone) && (
                            <span className="field-success">
                                <CheckCircle size={14} />
                                Geçerli telefon numarası
                            </span>
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
                            <span className="field-error">
                                <AlertCircle size={14} />
                                {errors.email}
                            </span>
                        ) : formData.email && validateEmail(formData.email) && (
                            <span className="field-success">
                                <CheckCircle size={14} />
                                Geçerli e-posta
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="whatsapp-toggle">
                <div className="whatsapp-icon">
                    <MessageCircle size={20} />
                </div>
                <div className="whatsapp-info">
                    <div className="whatsapp-title">WhatsApp Hatırlatma</div>
                    <div className="whatsapp-desc">Randevu saatinden 1 saat önce mesaj al.</div>
                </div>
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={formData.whatsappReminder}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, whatsappReminder: e.target.checked }))
                        }
                    />
                    <span className="toggle-slider"></span>
                </label>
            </div>

            <div className="privacy-notice">
                <Shield size={16} />
                <span>
                    Kişisel verileriniz 6698 sayılı KVKK kapsamında işlenmekte ve korunmaktadır.
                    Randevunuzu onaylayarak <a href="#" onClick={(e) => e.preventDefault()}>Aydınlatma Metni</a>'ni okuduğunuzu kabul edersiniz.
                </span>
            </div>
        </div>
    );
};
