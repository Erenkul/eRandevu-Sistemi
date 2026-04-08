import { useState } from 'react';
import { validatePhone, validateEmail, validatePassword } from '../utils/validators';

export interface FormErrors {
    name?: string;
    businessName?: string;
    phone?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    [key: string]: string | undefined;
}

export type AuthMode = 'select' | 'login' | 'register';
export type UserRole = 'business' | 'customer' | null;

export const usePhoneValidation = () => {
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const handleBlur = (field: string, values: {
        name: string;
        businessName: string;
        phone: string;
        email: string;
        password: string;
        confirmPassword: string;
        termsAccepted: boolean;
        role: UserRole;
        mode: AuthMode;
    }) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field, values);
    };

    const validateField = (field: string, values: {
        name: string;
        businessName: string;
        phone: string;
        email: string;
        password: string;
        confirmPassword: string;
        termsAccepted: boolean;
        role: UserRole;
        mode: AuthMode;
    }): boolean => {
        const newErrors = { ...errors };

        switch (field) {
            case 'name':
                if (!values.name.trim()) {
                    newErrors.name = 'Ad soyad gerekli';
                } else if (values.name.trim().split(' ').length < 2) {
                    newErrors.name = 'Lütfen ad ve soyad girin';
                } else {
                    delete newErrors.name;
                }
                break;
            case 'businessName':
                if (values.role === 'business' && !values.businessName.trim()) {
                    newErrors.businessName = 'İşletme adı gerekli';
                } else {
                    delete newErrors.businessName;
                }
                break;
            case 'phone':
                if (!values.phone) {
                    newErrors.phone = 'Telefon numarası gerekli';
                } else if (!validatePhone(values.phone)) {
                    newErrors.phone = 'Geçerli bir telefon numarası girin (5XX XXX XX XX)';
                } else {
                    delete newErrors.phone;
                }
                break;
            case 'email':
                if (!values.email) {
                    newErrors.email = 'E-posta gerekli';
                } else if (!validateEmail(values.email)) {
                    newErrors.email = 'Geçerli bir e-posta adresi girin';
                } else {
                    delete newErrors.email;
                }
                break;
            case 'password':
                const passwordValidation = validatePassword(values.password);
                if (!values.password) {
                    newErrors.password = 'Şifre gerekli';
                } else if (!passwordValidation.isValid) {
                    newErrors.password = passwordValidation.message;
                } else {
                    delete newErrors.password;
                }
                if (values.confirmPassword && values.password !== values.confirmPassword) {
                    newErrors.confirmPassword = 'Şifreler eşleşmiyor';
                } else if (values.confirmPassword) {
                    delete newErrors.confirmPassword;
                }
                break;
            case 'confirmPassword':
                if (!values.confirmPassword) {
                    newErrors.confirmPassword = 'Şifre tekrarı gerekli';
                } else if (values.password !== values.confirmPassword) {
                    newErrors.confirmPassword = 'Şifreler eşleşmiyor';
                } else {
                    delete newErrors.confirmPassword;
                }
                break;
            case 'terms':
                if (!values.termsAccepted) {
                    newErrors.terms = 'Kullanım koşullarını kabul etmelisiniz';
                } else {
                    delete newErrors.terms;
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = (values: {
        name: string;
        businessName: string;
        phone: string;
        email: string;
        password: string;
        confirmPassword: string;
        termsAccepted: boolean;
        role: UserRole;
        mode: AuthMode;
    }): boolean => {
        const newErrors: FormErrors = {};

        if (values.mode === 'register') {
            if (!values.name.trim()) {
                newErrors.name = 'Ad soyad gerekli';
            } else if (values.name.trim().split(' ').length < 2) {
                newErrors.name = 'Lütfen ad ve soyad girin';
            }

            if (values.role === 'business' && !values.businessName.trim()) {
                newErrors.businessName = 'İşletme adı gerekli';
            }

            if (!values.phone) {
                newErrors.phone = 'Telefon numarası gerekli';
            } else if (!validatePhone(values.phone)) {
                newErrors.phone = 'Geçerli bir telefon numarası girin';
            }

            if (!values.confirmPassword) {
                newErrors.confirmPassword = 'Şifre tekrarı gerekli';
            } else if (values.password !== values.confirmPassword) {
                newErrors.confirmPassword = 'Şifreler eşleşmiyor';
            }

            if (!values.termsAccepted) {
                newErrors.terms = 'Kullanım koşullarını kabul etmelisiniz';
            }
        }

        if (!values.email) {
            newErrors.email = 'E-posta gerekli';
        } else if (!validateEmail(values.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }

        if (!values.password) {
            newErrors.password = 'Şifre gerekli';
        } else if (values.mode === 'register') {
            const passwordValidation = validatePassword(values.password);
            if (!passwordValidation.isValid) {
                newErrors.password = passwordValidation.message;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return {
        errors,
        setErrors,
        touched,
        setTouched,
        handleBlur,
        validateField,
        validateForm,
    };
};
