export const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && cleaned.startsWith('5');
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
        return { isValid: false, message: 'En az 8 karakter olmalı' };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'En az bir büyük harf içermeli' };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'En az bir küçük harf içermeli' };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'En az bir rakam içermeli' };
    }
    return { isValid: true, message: 'Güçlü şifre' };
};

export const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Zayıf', color: '#ef4444' };
    if (strength <= 3) return { strength, label: 'Orta', color: '#f59e0b' };
    if (strength <= 4) return { strength, label: 'Güçlü', color: '#22c55e' };
    return { strength, label: 'Çok Güçlü', color: '#10b981' };
};
