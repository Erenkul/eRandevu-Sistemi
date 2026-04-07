import React from 'react';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Input, PrimaryButton } from '../../../components/ui';
import { validateEmail } from '../utils/validators';

interface LoginFormProps {
    email: string;
    password: string;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (field: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onSwitchToRegister: () => void;
    onSocialLogin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
    email,
    password,
    errors,
    touched,
    onEmailChange,
    onPasswordChange,
    onBlur,
    onSubmit,
    onSwitchToRegister,
    onSocialLogin,
}) => {
    const passwordStrength = getPasswordStrength(password);

    return (
        <form className="auth-form" onSubmit={onSubmit}>
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
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChange={onPasswordChange}
                    onBlur={() => onBlur('password')}
                    className={errors.password && touched.password ? 'input-error' : ''}
                    aria-label="Şifre"
                    aria-invalid={!!(errors.password && touched.password)}
                />
                {errors.password && touched.password && (
                    <span className="field-error">
                        <AlertCircle size={14} />
                        {errors.password}
                    </span>
                )}
            </div>

            <div className="auth-options">
                <label className="auth-remember">
                    <input type="checkbox" />
                    Beni hatırla
                </label>
                <a href="#" className="auth-forgot">Şifremi unuttum</a>
            </div>

            <div className="auth-submit">
                <PrimaryButton type="submit">
                    Giriş Yap
                </PrimaryButton>
            </div>
        </form>
    );
};
