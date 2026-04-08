import React from 'react';
import { Plus, Calendar, Star, Heart } from 'lucide-react';
import { PrimaryButton } from '../../../components/ui';
import type { Appointment, Favorite } from '../CustomerDashboard';

interface HomeTabProps {
    user?: { displayName?: string; phoneNumber?: string };
    upcomingAppointments: Appointment[];
    favorites: Favorite[];
    appointmentsLoading: boolean;
    onNewAppointment: () => void;
    onTabChange: (tab: string) => void;
    renderAppointmentCard: (appointment: Appointment, showCancel: boolean) => React.ReactNode;
}

export const HomeTab: React.FC<HomeTabProps> = ({
    user, upcomingAppointments, favorites, appointmentsLoading,
    onNewAppointment, onTabChange, renderAppointmentCard,
}) => (
    <>
        <div className="customer-welcome">
            <h1>Merhaba, {user?.displayName?.split(' ')[0] || 'Hoş geldiniz'}! 👋</h1>
            <p>Bugün randevu almak ister misiniz?</p>
        </div>
        <div className="quick-actions">
            <div className="quick-action-card" onClick={onNewAppointment}>
                <div className="quick-action-icon primary"><Plus size={28} /></div>
                <div className="quick-action-content"><h3>Yeni Randevu Al</h3><p>İşletme ara ve hemen randevu oluştur</p></div>
            </div>
            <div className="quick-action-card" onClick={() => onTabChange('appointments')}>
                <div className="quick-action-icon accent"><Calendar size={28} /></div>
                <div className="quick-action-content"><h3>Randevularım</h3><p>{appointmentsLoading ? 'Yükleniyor...' : `${upcomingAppointments.length} yaklaşan randevunuz var`}</p></div>
            </div>
            <div className="quick-action-card" onClick={() => onTabChange('favorites')}>
                <div className="quick-action-icon secondary"><Star size={28} /></div>
                <div className="quick-action-content"><h3>Favori İşletmeler</h3><p>Kayıtlı {favorites.length} işletmeniz var</p></div>
            </div>
        </div>
        <div className="appointments-section">
            <div className="section-header">
                <h2 className="section-title">Yaklaşan Randevular</h2>
                <button className="section-action" onClick={() => onTabChange('appointments')}>Tümünü Gör</button>
            </div>
            {appointmentsLoading ? (
                <div className="empty-state-inline"><p>Yükleniyor...</p></div>
            ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.slice(0, 3).map(a => renderAppointmentCard(a, false))
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon"><Calendar size={32} /></div>
                    <h3>Yaklaşan randevunuz yok</h3>
                    <p>Yeni bir randevu oluşturarak başlayın</p>
                    <PrimaryButton icon={Plus} onClick={onNewAppointment}>Randevu Al</PrimaryButton>
                </div>
            )}
        </div>
        <div className="appointments-section">
            <div className="section-header">
                <h2 className="section-title">Favori İşletmeler</h2>
                <button className="section-action" onClick={() => onTabChange('favorites')}>Tümünü Gör</button>
            </div>
            {favorites.length > 0 ? (
                <div className="favorites-grid">
                    {favorites.map((fav) => (
                        <div key={fav.id} className="favorite-card"><div className="favorite-avatar">{fav.initials}</div><div className="favorite-name">{fav.name}</div><div className="favorite-category">{fav.category}</div></div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon"><Heart size={32} /></div>
                    <h3>Henüz favori işletmeniz yok</h3><p>İşletmeleri favorilere ekleyerek hızlı erişin</p>
                </div>
            )}
        </div>
    </>
);
