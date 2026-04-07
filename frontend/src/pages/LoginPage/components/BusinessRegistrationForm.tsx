import React from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import { Input } from '../../../components/ui';

interface BusinessRegistrationFormProps {
    businessName: string;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
}

export const BusinessRegistrationForm: React.FC<BusinessRegistrationFormProps> = ({
    businessName,
    error,
    onChange,
    onBlur,
}) => {
    return (
        <div className="form-field">
            <Input
                label="İşletme Adı"
                type="text"
                icon={Building2}
                placeholder="İşletmenizin adı"
                value={businessName}
                onChange={onChange}
                onBlur={onBlur}
                className={error ? 'input-error' : ''}
            />
            {error && (
                <span className="field-error">
                    <AlertCircle size={14} />
                    {error}
                </span>
            )}
        </div>
    );
};
