import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Logo } from '../../components/ui';
import { useAuth } from '../../contexts';
import { RoleSelection } from './components/RoleSelection';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { formatPhoneNumber } from './utils/phoneFormatter';
import { usePhoneValidation } from './hooks/usePhoneValidation';
import type { AuthMode, UserRole } from './hooks/usePhoneValidation';
import '../LoginPage.css';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, register, error: authError, clearError } = useAuth();
    const { errors, touched, setTouched, handleBlur, validateForm } = usePhoneValidation();

    const [role, setRole] = useState<UserRole>(null);
    const [mode, setMode] = useState<AuthMode>('select');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const formValues = {
        name, businessName, phone, email, password, confirmPassword,
        termsAccepted, role, mode,
    };

    const handleRoleSelect = (selectedRole: UserRole) => {
        setRole(selectedRole);
        setMode('login');
    };

    const handleBack = () => {
        if (mode === 'login' || mode === 'register') {
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
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhoneNumber(e.target.value));
    };

    const onBlur = (field: string) => handleBlur(field, formValues);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setTouched({
            email: true, password: true, confirmPassword: true,
            name: true, businessName: true, phone: true, terms: true,
        });

        if (!validateForm(formValues)) return;

        try {
            if (mode === 'login') {
                await login(email, password, role as 'business' | 'customer');
                navigate(role === 'business' ? '/admin' : '/customer');
            } else if (mode === 'register') {
                await register(
                    email, password, name, phone,
                    role === 'business' ? 'admin' : 'customer',
                    businessName
                );
                navigate(role === 'business' ? '/admin' : '/customer');
            }
        } catch (err) {
            console.error('Auth error:', err);
        }
    };

    const switchToRegister = () => { setMode('register'); clearError(); };
    const switchToLogin = () => { setMode('login'); clearError(); };

    if (mode === 'select') {
        return <RoleSelection role={role} onSelect={handleRoleSelect} Logo={Logo} />;
    }

    return (
        <div className="auth-page">
            <div className="auth-container auth-container-scrollable">
                <button className="auth-back" onClick={handleBack}>
                    <ArrowLeft size={18} />
                    Geri dön
                </button>

                <div className="auth-logo">
                    <Logo variant="default" className="login-logo-override" />
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
                        backgroundColor: '#fee2e2', color: '#ef4444',
                        padding: '12px', borderRadius: '8px', marginBottom: '20px',
                        fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <AlertCircle size={16} />
                        {authError}
                    </div>
                )}

                {mode === 'login' ? (
                    <LoginForm
                        email={email}
                        password={password}
                        errors={errors}
                        touched={touched}
                        onEmailChange={(e) => setEmail(e.target.value)}
                        onPasswordChange={(e) => setPassword(e.target.value)}
                        onBlur={onBlur}
                        onSubmit={handleSubmit}
                    />
                ) : (
                    <RegisterForm
                        name={name}
                        businessName={businessName}
                        phone={phone}
                        email={email}
                        password={password}
                        confirmPassword={confirmPassword}
                        termsAccepted={termsAccepted}
                        role={role}
                        errors={errors}
                        touched={touched}
                        onNameChange={(e) => setName(e.target.value)}
                        onBusinessNameChange={(e) => setBusinessName(e.target.value)}
                        onPhoneChange={handlePhoneChange}
                        onEmailChange={(e) => setEmail(e.target.value)}
                        onPasswordChange={(e) => setPassword(e.target.value)}
                        onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
                        onTermsChange={setTermsAccepted}
                        onBlur={onBlur}
                        onSubmit={handleSubmit}
                    />
                )}

                <div className="auth-divider"><span>veya</span></div>

                <div className="auth-social">
                    <button type="button" onClick={() => {}} style={{
                        flex: 1, width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '10px', padding: '11px 16px',
                        background: '#fff', border: '1px solid #dadce0', borderRadius: '8px',
                        color: '#3c4043', fontSize: '14px', fontWeight: 500, fontFamily: 'inherit',
                        cursor: 'pointer', transition: 'background 150ms ease, box-shadow 150ms ease',
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
