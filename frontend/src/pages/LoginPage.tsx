import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2, User, ArrowLeft, UserCircle, Phone, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { Input, PrimaryButton } from '../components/ui';
import { useAuth } from '../contexts';
import './LoginPage.css';

type UserRole = 'business' | 'customer' | null;
type AuthMode = 'select' | 'login' | 'register' | 'verify';

interface FormErrors {
    name?: string;
    businessName?: string;
    phone?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
}

// Phone format helper (10 digits: 5XX XXX XX XX)
const formatPhoneNumber = (value: string): string => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
};

// Phone validation (10 digits starting with 5)
const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && cleaned.startsWith('5');
};

// Email validation
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation
const validatePassword = (password: string): { isValid: boolean; message: string } => {
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

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, register, error: authError, clearError } = useAuth();
    const [role, setRole] = useState<UserRole>(null);
    const [mode, setMode] = useState<AuthMode>('select');

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Validation
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // SMS Verification
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Countdown timer for SMS resend
    useEffect(() => {
        if (mode === 'verify' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [mode, countdown]);

    const handleRoleSelect = (selectedRole: UserRole) => {
        setRole(selectedRole);
        setMode('login');
    };

    const handleBack = () => {
        if (mode === 'verify') {
            setMode('register');
            setVerificationCode(['', '', '', '', '', '']);
        } else if (mode === 'login' || mode === 'register') {
            setMode('select');
            setRole(null);
            resetForm();
            clearError();
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setBusinessName('');
        setPhone('');
        setTermsAccepted(false);
        setErrors({});
        setTouched({});
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhone(formatted);
    };

    const handleBlur = (field: string) => {
        setTouched({ ...touched, [field]: true });
        validateField(field);
    };

    const validateField = (field: string) => {
        const newErrors = { ...errors };

        switch (field) {
            case 'name':
                if (!name.trim()) {
                    newErrors.name = 'Ad soyad gerekli';
                } else if (name.trim().split(' ').length < 2) {
                    newErrors.name = 'Lütfen ad ve soyad girin';
                } else {
                    delete newErrors.name;
                }
                break;
            case 'businessName':
                if (role === 'business' && !businessName.trim()) {
                    newErrors.businessName = 'İşletme adı gerekli';
                } else {
                    delete newErrors.businessName;
                }
                break;
            case 'phone':
                if (!phone) {
                    newErrors.phone = 'Telefon numarası gerekli';
                } else if (!validatePhone(phone)) {
                    newErrors.phone = 'Geçerli bir telefon numarası girin (5XX XXX XX XX)';
                } else {
                    delete newErrors.phone;
                }
                break;
            case 'email':
                if (!email) {
                    newErrors.email = 'E-posta gerekli';
                } else if (!validateEmail(email)) {
                    newErrors.email = 'Geçerli bir e-posta adresi girin';
                } else {
                    delete newErrors.email;
                }
                break;
            case 'password':
                const passwordValidation = validatePassword(password);
                if (!password) {
                    newErrors.password = 'Şifre gerekli';
                } else if (!passwordValidation.isValid) {
                    newErrors.password = passwordValidation.message;
                } else {
                    delete newErrors.password;
                }
                // Also validate confirm password if it's filled
                if (confirmPassword && password !== confirmPassword) {
                    newErrors.confirmPassword = 'Şifreler eşleşmiyor';
                } else if (confirmPassword) {
                    delete newErrors.confirmPassword;
                }
                break;
            case 'confirmPassword':
                if (!confirmPassword) {
                    newErrors.confirmPassword = 'Şifre tekrarı gerekli';
                } else if (password !== confirmPassword) {
                    newErrors.confirmPassword = 'Şifreler eşleşmiyor';
                } else {
                    delete newErrors.confirmPassword;
                }
                break;
            case 'terms':
                if (!termsAccepted) {
                    newErrors.terms = 'Kullanım koşullarını kabul etmelisiniz';
                } else {
                    delete newErrors.terms;
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (mode === 'register') {
            // Name validation
            if (!name.trim()) {
                newErrors.name = 'Ad soyad gerekli';
            } else if (name.trim().split(' ').length < 2) {
                newErrors.name = 'Lütfen ad ve soyad girin';
            }

            // Business name validation
            if (role === 'business' && !businessName.trim()) {
                newErrors.businessName = 'İşletme adı gerekli';
            }

            // Phone validation
            if (!phone) {
                newErrors.phone = 'Telefon numarası gerekli';
            } else if (!validatePhone(phone)) {
                newErrors.phone = 'Geçerli bir telefon numarası girin';
            }

            // Confirm password validation
            if (!confirmPassword) {
                newErrors.confirmPassword = 'Şifre tekrarı gerekli';
            } else if (password !== confirmPassword) {
                newErrors.confirmPassword = 'Şifreler eşleşmiyor';
            }

            // Terms validation
            if (!termsAccepted) {
                newErrors.terms = 'Kullanım koşullarını kabul etmelisiniz';
            }
        }

        // Email validation
        if (!email) {
            newErrors.email = 'E-posta gerekli';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Şifre gerekli';
        } else if (mode === 'register') {
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                newErrors.password = passwordValidation.message;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Form gönderilmeye çalışıldığında tüm alanları dokunulmuş (touched) kabul et
        setTouched({
            email: true,
            password: true,
            confirmPassword: true,
            name: true,
            businessName: true,
            phone: true,
            terms: true
        });

        if (!validateForm()) {
            return;
        }

        try {
            if (mode === 'login') {
                await login(email, password, role as 'business' | 'customer');
                navigate(role === 'business' ? '/admin' : '/customer');
            } else if (mode === 'register') {
                // Bypass SMS verification and register directly
                await register(
                    email,
                    password,
                    name,
                    phone,
                    role === 'business' ? 'admin' : 'customer',
                    businessName
                );

                navigate(role === 'business' ? '/admin' : '/customer');
            }
        } catch (err) {
            console.error('Auth error:', err);
            // Error is handled by AuthContext and available via authError
        }
    };

    const handleVerificationInput = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...verificationCode];
        newCode[index] = value.slice(-1);
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleVerificationKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerifyCode = () => {
        const code = verificationCode.join('');
        if (code.length === 6) {
            // In real app, verify the code with backend
            // For demo, accept any 6-digit code
            if (role === 'business') {
                navigate('/admin');
            } else {
                navigate('/customer');
            }
        }
    };

    const handleResendCode = () => {
        setCountdown(60);
        setCanResend(false);
        setVerificationCode(['', '', '', '', '', '']);
        // In real app, call API to resend SMS
    };

    const switchToRegister = () => {
        setMode('register');
        clearError();
    };
    const switchToLogin = () => {
        setMode('login');
        clearError();
    };

    // Password strength indicator
    const getPasswordStrength = (): { strength: number; label: string; color: string } => {
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

    const passwordStrength = getPasswordStrength();

    // Role Selection Screen
    if (mode === 'select') {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-logo">
                        <h1>e<span>Randevu</span></h1>
                    </div>

                    <div className="auth-role-selection">
                        <h2>Hoş Geldiniz</h2>
                        <p>Devam etmek için hesap türünüzü seçin</p>
                    </div>

                    <div className="role-cards">
                        <button
                            className={`role-card business ${role === 'business' ? 'selected' : ''}`}
                            onClick={() => handleRoleSelect('business')}
                        >
                            <div className="role-card-icon">
                                <Building2 size={32} />
                            </div>
                            <div className="role-card-title">İşletme</div>
                            <div className="role-card-desc">
                                Randevuları yönetin, hizmetlerinizi düzenleyin
                            </div>
                        </button>

                        <button
                            className={`role-card customer ${role === 'customer' ? 'selected' : ''}`}
                            onClick={() => handleRoleSelect('customer')}
                        >
                            <div className="role-card-icon">
                                <UserCircle size={32} />
                            </div>
                            <div className="role-card-title">Müşteri</div>
                            <div className="role-card-desc">
                                Kolayca randevu alın, geçmişinizi görün
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // SMS Verification Screen
    if (mode === 'verify') {
        const maskedPhone = phone.replace(/(\d{4})\s(\d{3})\s(\d{2})\s(\d{2})/, '$1 *** ** $4');

        return (
            <div className="auth-page">
                <div className="auth-container">
                    <button className="auth-back" onClick={handleBack}>
                        <ArrowLeft size={18} />
                        Geri dön
                    </button>

                    <div className="auth-logo">
                        <h1>e<span>Randevu</span></h1>
                    </div>

                    <div className="verify-icon">
                        <ShieldCheck size={48} />
                    </div>

                    <div className="auth-title">
                        <h2>SMS Doğrulama</h2>
                        <p>
                            <strong>{maskedPhone}</strong> numarasına gönderilen 6 haneli kodu girin
                        </p>
                    </div>

                    <div className="otp-container">
                        {verificationCode.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleVerificationInput(index, e.target.value)}
                                onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                                className="otp-input"
                            />
                        ))}
                    </div>

                    <div className="verify-timer">
                        {canResend ? (
                            <button className="resend-button" onClick={handleResendCode}>
                                Kodu Tekrar Gönder
                            </button>
                        ) : (
                            <span>Yeni kod gönderimi: <strong>{countdown}</strong> saniye</span>
                        )}
                    </div>

                    <div className="auth-submit">
                        <PrimaryButton
                            onClick={handleVerifyCode}
                            disabled={verificationCode.join('').length !== 6}
                        >
                            Doğrula ve Devam Et
                        </PrimaryButton>
                    </div>

                    <div className="verify-help">
                        <p>Kod almadınız mı? Spam klasörünüzü kontrol edin veya farklı bir numara deneyin.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Login / Register Screen
    return (
        <div className="auth-page">
            <div className="auth-container auth-container-scrollable">
                <button className="auth-back" onClick={handleBack}>
                    <ArrowLeft size={18} />
                    Geri dön
                </button>

                <div className="auth-logo">
                    <h1>e<span>Randevu</span></h1>
                </div>


                <div className="auth-title">
                    <h2>{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
                    <p>
                        {mode === 'login'
                            ? role === 'business'
                                ? 'İşletme hesabınıza giriş yapın'
                                : 'Müşteri hesabınıza giriş yapın'
                            : role === 'business'
                                ? 'İşletmenizi kaydedin ve yönetmeye başlayın'
                                : 'Hesap oluşturun ve randevu almaya başlayın'}
                    </p>
                </div>

                {authError && (
                    <div className="auth-error-message" style={{
                        backgroundColor: '#fee2e2',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <AlertCircle size={16} />
                        {authError}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <>
                            <div className="form-field">
                                <Input
                                    label="Ad Soyad"
                                    type="text"
                                    icon={User}
                                    placeholder="Adınızı ve soyadınızı girin"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={() => handleBlur('name')}
                                    className={errors.name && touched.name ? 'input-error' : ''}
                                />
                                {errors.name && touched.name && (
                                    <span className="field-error">
                                        <AlertCircle size={14} />
                                        {errors.name}
                                    </span>
                                )}
                            </div>

                            {role === 'business' && (
                                <div className="form-field">
                                    <Input
                                        label="İşletme Adı"
                                        type="text"
                                        icon={Building2}
                                        placeholder="İşletmenizin adı"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        onBlur={() => handleBlur('businessName')}
                                        className={errors.businessName && touched.businessName ? 'input-error' : ''}
                                    />
                                    {errors.businessName && touched.businessName && (
                                        <span className="field-error">
                                            <AlertCircle size={14} />
                                            {errors.businessName}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="form-field">
                                <Input
                                    label="Telefon Numarası"
                                    type="tel"
                                    icon={Phone}
                                    placeholder="5XX XXX XX XX"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    onBlur={() => handleBlur('phone')}
                                    className={errors.phone && touched.phone ? 'input-error' : ''}
                                />
                                {errors.phone && touched.phone ? (
                                    <span className="field-error">
                                        <AlertCircle size={14} />
                                        {errors.phone}
                                    </span>
                                ) : phone && validatePhone(phone) && (
                                    <span className="field-success">
                                        <CheckCircle size={14} />
                                        Geçerli telefon numarası
                                    </span>
                                )}
                            </div>
                        </>
                    )}

                    <div className="form-field">
                        <Input
                            label="E-posta Adresi"
                            type="email"
                            icon={Mail}
                            placeholder="ornek@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => handleBlur('email')}
                            className={errors.email && touched.email ? 'input-error' : ''}
                        />
                        {errors.email && touched.email ? (
                            <span className="field-error">
                                <AlertCircle size={14} />
                                {errors.email}
                            </span>
                        ) : email && validateEmail(email) && (
                            <span className="field-success">
                                <CheckCircle size={14} />
                                Geçerli e-posta
                            </span>
                        )}
                    </div>

                    <div className="form-field">
                        <Input
                            label="Şifre"
                            type="password"
                            icon={Lock}
                            placeholder={mode === 'register' ? 'En az 8 karakter' : 'Şifrenizi girin'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => handleBlur('password')}
                            className={errors.password && touched.password ? 'input-error' : ''}
                        />
                        {mode === 'register' && password && (
                            <div className="password-strength">
                                <div className="strength-bars">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`strength-bar ${level <= passwordStrength.strength ? 'active' : ''}`}
                                            style={{ backgroundColor: level <= passwordStrength.strength ? passwordStrength.color : undefined }}
                                        />
                                    ))}
                                </div>
                                <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                            </div>
                        )}
                        {errors.password && touched.password && (
                            <span className="field-error">
                                <AlertCircle size={14} />
                                {errors.password}
                            </span>
                        )}
                    </div>

                    {mode === 'register' && (
                        <>
                            <div className="form-field">
                                <Input
                                    label="Şifre Tekrarı"
                                    type="password"
                                    icon={Lock}
                                    placeholder="Şifrenizi tekrar girin"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={() => handleBlur('confirmPassword')}
                                    className={errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}
                                />
                                {errors.confirmPassword && touched.confirmPassword ? (
                                    <span className="field-error">
                                        <AlertCircle size={14} />
                                        {errors.confirmPassword}
                                    </span>
                                ) : confirmPassword && password === confirmPassword && (
                                    <span className="field-success">
                                        <CheckCircle size={14} />
                                        Şifreler eşleşiyor
                                    </span>
                                )}
                            </div>

                            <div className="terms-checkbox">
                                <label className={`checkbox-label ${errors.terms && touched.terms ? 'error' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => {
                                            setTermsAccepted(e.target.checked);
                                            if (touched.terms) validateField('terms');
                                        }}
                                        onBlur={() => handleBlur('terms')}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span className="checkbox-text">
                                        <a href="#" onClick={(e) => e.preventDefault()}>Kullanım Koşulları</a> ve{' '}
                                        <a href="#" onClick={(e) => e.preventDefault()}>Gizlilik Politikası</a>'nı okudum ve kabul ediyorum.
                                    </span>
                                </label>
                                {errors.terms && touched.terms && (
                                    <span className="field-error terms-error">
                                        <AlertCircle size={14} />
                                        {errors.terms}
                                    </span>
                                )}
                            </div>
                        </>
                    )}

                    {mode === 'login' && (
                        <div className="auth-options">
                            <label className="auth-remember">
                                <input type="checkbox" />
                                Beni hatırla
                            </label>
                            <a href="#" className="auth-forgot">Şifremi unuttum</a>
                        </div>
                    )}

                    <div className="auth-submit">
                        <PrimaryButton type="submit">
                            {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                        </PrimaryButton>
                    </div>
                </form>

                <div className="auth-divider">
                    <span>veya</span>
                </div>

                <div className="auth-social">
                    <button
                        type="button"
                        onClick={() => { /* Google auth handler */ }}
                        style={{
                            flex: 1,
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            padding: '11px 16px',
                            background: '#fff',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            color: '#3c4043',
                            fontSize: '14px',
                            fontWeight: 500,
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            transition: 'background 150ms ease, box-shadow 150ms ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)')}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                        </svg>
                        Google ile {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                    </button>
                </div>

                <div className="auth-footer">
                    {mode === 'login' ? (
                        <>
                            Hesabınız yok mu?{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); switchToRegister(); }}>
                                Ücretsiz Kayıt Olun
                            </a>
                        </>
                    ) : (
                        <>
                            Zaten hesabınız var mı?{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); switchToLogin(); }}>
                                Giriş Yapın
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
