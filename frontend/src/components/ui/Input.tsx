import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: LucideIcon;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    hint,
    icon: Icon,
    className = '',
    ...props
}) => {
    return (
        <div className={`input-wrapper ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <div className={`input-field ${Icon ? 'input-with-icon' : ''}`}>
                {Icon && (
                    <span className="input-icon">
                        <Icon size={18} />
                    </span>
                )}
                <input
                    className={`input ${error ? 'input-error' : ''}`}
                    {...props}
                />
            </div>
            {error && <span className="input-error-message">{error}</span>}
            {hint && !error && <span className="input-hint">{hint}</span>}
        </div>
    );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
    label,
    error,
    hint,
    className = '',
    ...props
}) => {
    return (
        <div className="input-wrapper">
            {label && <label className="input-label">{label}</label>}
            <textarea
                className={`input textarea ${error ? 'input-error' : ''} ${className}`}
                {...props}
            />
            {error && <span className="input-error-message">{error}</span>}
            {hint && !error && <span className="input-hint">{hint}</span>}
        </div>
    );
};

interface SearchInputProps extends Omit<InputProps, 'icon'> { }

export const SearchInput: React.FC<SearchInputProps> = ({
    className = '',
    placeholder = 'Ara...',
    ...props
}) => {
    return (
        <div className="search-input-wrapper input-with-icon">
            <span className="input-icon">
                <Search size={18} />
            </span>
            <input
                type="search"
                className={`input search-input ${className}`}
                placeholder={placeholder}
                {...props}
            />
        </div>
    );
};
