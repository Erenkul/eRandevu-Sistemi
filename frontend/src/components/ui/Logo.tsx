import React from 'react';
import './Logo.css';

interface LogoProps {
    variant?: 'default' | 'compact' | 'admin';
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'default', className = '' }) => {
    return (
        <div className={`er-logo-wrapper ${variant} ${className}`}>
            {variant === 'default' && <div className="er-bg-glow"></div>}
            
            <div className="er-logo-inner">
                <div className="er-calendar-icon">
                    <svg className="er-cal-svg" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="12" width="60" height="54" rx="8" fill="#0e2a45" stroke="#38bdf8" strokeWidth="1.5"/>
                        <rect x="6" y="12" width="60" height="18" rx="8" fill="#0ea5e9"/>
                        <rect x="6" y="22" width="60" height="8" fill="#0ea5e9"/>
                        <rect x="20" y="7" width="5" height="12" rx="2.5" fill="#38bdf8"/>
                        <rect x="47" y="7" width="5" height="12" rx="2.5" fill="#38bdf8"/>
                        
                        <circle cx="36" cy="44" r="16" fill="#0a1f35" stroke="#38bdf8" strokeWidth="1.2"/>
                        <circle cx="36" cy="44" r="13" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="2 3"/>
                        <circle cx="36" cy="44" r="1.5" fill="#38bdf8"/>
                        
                        <line x1="36" y1="32" x2="36" y2="34.5" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round"/>
                        <line x1="36" y1="53.5" x2="36" y2="56" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round"/>
                        <line x1="24" y1="44" x2="26.5" y2="44" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round"/>
                        <line x1="45.5" y1="44" x2="48" y2="44" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round"/>
                        
                        <g className="er-clock-hand">
                            <line x1="36" y1="44" x2="36" y2="33.5" stroke="#f0f9ff" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="36" y1="44" x2="42" y2="40" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
                        </g>
                    </svg>
                </div>

                <div className="er-divider-line"></div>

                <div className="er-text-group">
                    <div className="er-brand-name"><span className="er-e-prefix">e</span>Randevu</div>
                    {variant === 'default' && <div className="er-brand-tagline">Dijital Randevu Sistemi</div>}
                </div>
            </div>
        </div>
    );
};
