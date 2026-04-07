import React from 'react';
import { Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '../../../components/ui';
import { formatPhoneNumber } from '../utils/phoneFormatter';
import { validatePhone } from '../utils/validators';

interface PhoneVerificationProps {
    phone: string;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
    phone,
    error,
    onChange,
    onBlur,
}) => {
    return (
        <div className="form-field">
            <Input
                label="Telefon Numarası"
                type="tel"
                icon={Phone}
                placeholder="5XX XXX XX XX"
                value={phone}
                onChange={onChange}
                onBlur={onBlur}
                className={error ? 'input-error' : ''}
                aria-label="Doğrulama kodu"
                aria-invalid={!!error}
            />
            {error ? (
                <span className="field-error">
                    <AlertCircle size={14} />
                    {error}
                </span>
            ) : phone && validatePhone(phone) && (
                <span className="field-success">
                    <CheckCircle size={14} />
                    Geçerli telefon numarası
                </span>
            )}
        </div>
    );
};
