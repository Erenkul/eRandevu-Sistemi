import React from 'react';
import { Mail, Lock, User, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { Input, PrimaryButton } from '../../../components/ui';

import { validateEmail, validatePhone, getPasswordStrength } from '../utils/validators';

interface RegisterFormProps {
    name: string;
    businessName: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
    role: 'business' | 'customer' | null;
    errors: Record<string, string | undefined>;
    touched: Record<string, boolean>;
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBusinessNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTermsChange: (checked: boolean) => void;
    onBlur: (field: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
    name,
    businessName,
    phone,
    email,
    password,
    confirmPassword,
    termsAccepted,
    role,
    errors,
    touched,
    onNameChange,
    onBusinessNameChange,
    onPhoneChange,
    onEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onTermsChange,
    onBlur,
    onSubmit,
}) => {
    const passwordStrength = getPasswordStrength(password);

    return (
        <form className="auth-form" onSubmit={onSubmit}>
            <div className="form-field">
                <Input
                    label="Ad Soyad"
                    type="text"
                    icon={User}
                    placeholder="Adınızı ve soyadınızı girin"
                    value={name}
                    onChange={onNameChange}
                    onBlur={() => onBlur('name')}
                    className={errors.name && touched.name ? 'input-error' : ''}
                    aria-label="Ad Soyad"
                    aria-invalid={!!(errors.name && touched.name)}
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
                        icon={Mail}
                        placeholder="İşletmenizin adı"
                        value={businessName}
                        onChange={onBusinessNameChange}
                        onBlur={() => onBlur('businessName')}
                        className={errors.businessName && touched.businessName ? 'input-error' : ''}
                        aria-label="İşletme Adı"
                        aria-invalid={!!(errors.businessName && touched.businessName)}
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
                    onChange={onPhoneChange}
                    onBlur={() => onBlur('phone')}
                    className={errors.phone && touched.phone ? 'input-error' : ''}
                    aria-label="Telefon"
                    aria-invalid={!!(errors.phone && touched.phone)}
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

            <div className="form-field">
                <Input
                    label="E-posta Adresi"
                    type="email"
                    icon={Mail}
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={onEmailChange}
                    onBlur={() => onBlur('email')}
                    className={errors.email && touched.email ? 'input-error' : ''}
                    aria-label="E-posta"
                    aria-invalid={!!(errors.email && touched.email)}
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
                    placeholder="En az 8 karakter"
                    value={password}
                    onChange={onPasswordChange}
                    onBlur={() => onBlur('password')}
                    className={errors.password && touched.password ? 'input-error' : ''}
                    aria-label="Şifre"
                    aria-invalid={!!(errors.password && touched.password)}
                />
                {password && (
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

            <div className="form-field">
                <Input
                    label="Şifre Tekrarı"
                    type="password"
                    icon={Lock}
                    placeholder="Şifrenizi tekrar girin"
                    value={confirmPassword}
                    onChange={onConfirmPasswordChange}
                    onBlur={() => onBlur('confirmPassword')}
                    className={errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}
                    aria-label="Şifre Tekrarı"
                    aria-invalid={!!(errors.confirmPassword && touched.confirmPassword)}
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
                            onTermsChange(e.target.checked);
                            if (touched.terms) onBlur('terms');
                        }}
                        onBlur={() => onBlur('terms')}
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

            <div className="auth-submit">
                <PrimaryButton type="submit">
                    Kayıt Ol
                </PrimaryButton>
            </div>
        </form>
    );
};
