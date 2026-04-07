import React from 'react';
import { Building2, UserCircle } from 'lucide-react';
import type { Logo } from '../../../components/ui';

type UserRole = 'business' | 'customer' | null;

interface RoleSelectionProps {
    role: UserRole;
    onSelect: (role: UserRole) => void;
    Logo: React.ComponentType<React.ComponentProps<typeof Logo>>;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ role, onSelect, Logo }) => {
    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <Logo variant="default" className="login-logo-override" />
                </div>

                <div className="auth-role-selection">
                    <h2>Hoş Geldiniz</h2>
                    <p>Devam etmek için hesap türünüzü seçin</p>
                </div>

                <div className="role-cards">
                    <button
                        className={`role-card business ${role === 'business' ? 'selected' : ''}`}
                        onClick={() => onSelect('business')}
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
                        onClick={() => onSelect('customer')}
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
};
