import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    MapPin,
    Heart,
    User,
    LogOut,
    Plus,
    History,
    Star,
    X,
    Phone,
    Mail,
    Edit2,
    Home,
    Trash2,
    HeartOff,
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import './CustomerDashboard.css';

type TabType = 'home' | 'appointments' | 'favorites' | 'profile';

interface Appointment {
    id: string;
    businessName: string;
    businessInitials: string;
    service: string;
    date: Date;
    time: string;
    location: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    businessId: string;
}

interface Favorite {
    id: string;
    name: string;
    category: string;
    initials: string;
    businessId: string;
}

const initialAppointments: Appointment[] = [
    {
        id: '1',
        businessName: 'Elite Barber Shop',
        businessInitials: 'EB',
        service: 'Saç Kesimi + Sakal',
        date: new Date(2026, 0, 26),
        time: '14:00',
        location: 'Kadıköy, İstanbul',
        status: 'upcoming',
        businessId: 'elite-barber',
    },
    {
        id: '2',
        businessName: 'Modern Kuaför',
        businessInitials: 'MK',
        service: 'Saç Boyama',
        date: new Date(2026, 0, 20),
        time: '11:00',
        location: 'Beşiktaş, İstanbul',
        status: 'completed',
        businessId: 'modern-kuafor',
    },
    {
        id: '3',
        businessName: 'Style Studio',
        businessInitials: 'SS',
        service: 'Cilt Bakımı',
        date: new Date(2026, 0, 15),
        time: '16:30',
        location: 'Şişli, İstanbul',
        status: 'completed',
        businessId: 'style-studio',
    },
];

const initialFavorites: Favorite[] = [
    { id: '1', name: 'Elite Barber Shop', category: 'Berber', initials: 'EB', businessId: 'elite-barber' },
    { id: '2', name: 'Modern Kuaför', category: 'Kuaför', initials: 'MK', businessId: 'modern-kuafor' },
    { id: '3', name: 'Style Studio', category: 'Güzellik', initials: 'SS', businessId: 'style-studio' },
];

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const statusLabels = {
    upcoming: 'Yaklaşan',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
};

// Modal Component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

export const CustomerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('home');
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
    const [favorites, setFavorites] = useState<Favorite[]>(initialFavorites);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const upcomingAppointments = appointments.filter((a) => a.status === 'upcoming');
    const pastAppointments = appointments.filter((a) => a.status !== 'upcoming');

    const handleNewAppointment = () => {
        navigate('/');
    };

    const handleBookAgain = (businessId: string) => {
        navigate(`/book/${businessId}`);
    };

    const handleLogout = () => {
        navigate('/login');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewDetails = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailModal(true);
    };

    const handleCancelClick = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowCancelModal(true);
    };

    const handleConfirmCancel = () => {
        if (selectedAppointment) {
            setAppointments(appointments.map(a =>
                a.id === selectedAppointment.id
                    ? { ...a, status: 'cancelled' as const }
                    : a
            ));
            setShowCancelModal(false);
            setSelectedAppointment(null);
        }
    };

    const handleRemoveFavorite = (favoriteId: string) => {
        setFavorites(favorites.filter(f => f.id !== favoriteId));
    };

    // Format full date
    const formatFullDate = (date: Date) => {
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${days[date.getDay()]}`;
    };

    return (
        <div className="customer-layout">
            {/* Header */}
            <header className="customer-header">
                <div className="customer-header-left">
                    <button className="customer-home-btn" onClick={handleGoHome} title="Ana Sayfaya Git">
                        <Home size={20} />
                    </button>
                    <div className="customer-header-logo">
                        e<span>Randevu</span>
                    </div>
                </div>

                <nav className="customer-header-nav">
                    <button
                        className={`customer-nav-item ${activeTab === 'home' ? 'active' : ''}`}
                        onClick={() => setActiveTab('home')}
                    >
                        <Calendar size={18} />
                        Ana Sayfa
                    </button>
                    <button
                        className={`customer-nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('appointments')}
                    >
                        <History size={18} />
                        Randevularım
                    </button>
                    <button
                        className={`customer-nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
                        onClick={() => setActiveTab('favorites')}
                    >
                        <Heart size={18} />
                        Favorilerim
                    </button>
                </nav>

                <div className="customer-header-user">
                    <button className="customer-nav-item" onClick={() => setActiveTab('profile')}>
                        <User size={18} />
                        Profil
                    </button>
                    <button className="customer-nav-item" onClick={handleLogout} title="Çıkış Yap">
                        <LogOut size={18} />
                    </button>
                    <div className="customer-user-avatar">MA</div>
                </div>
            </header>

            {/* Content */}
            <main className="customer-content">
                {activeTab === 'home' && (
                    <>
                        {/* Welcome */}
                        <div className="customer-welcome">
                            <h1>Merhaba, Mehmet Ali! 👋</h1>
                            <p>Bugün randevu almak ister misiniz?</p>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions">
                            <div className="quick-action-card" onClick={handleNewAppointment}>
                                <div className="quick-action-icon primary">
                                    <Plus size={28} />
                                </div>
                                <div className="quick-action-content">
                                    <h3>Yeni Randevu Al</h3>
                                    <p>İşletme ara ve hemen randevu oluştur</p>
                                </div>
                            </div>

                            <div className="quick-action-card" onClick={() => setActiveTab('appointments')}>
                                <div className="quick-action-icon accent">
                                    <Calendar size={28} />
                                </div>
                                <div className="quick-action-content">
                                    <h3>Randevularım</h3>
                                    <p>{upcomingAppointments.length} yaklaşan randevunuz var</p>
                                </div>
                            </div>

                            <div className="quick-action-card" onClick={() => setActiveTab('favorites')}>
                                <div className="quick-action-icon secondary">
                                    <Star size={28} />
                                </div>
                                <div className="quick-action-content">
                                    <h3>Favori İşletmeler</h3>
                                    <p>Kayıtlı {favorites.length} işletmeniz var</p>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Appointments */}
                        <div className="appointments-section">
                            <div className="section-header">
                                <h2 className="section-title">Yaklaşan Randevular</h2>
                                <button className="section-action" onClick={() => setActiveTab('appointments')}>
                                    Tümünü Gör
                                </button>
                            </div>

                            {upcomingAppointments.length > 0 ? (
                                upcomingAppointments.map((appointment) => (
                                    <div key={appointment.id} className="appointment-card">
                                        <div className="appointment-date">
                                            <div className="appointment-date-day">{appointment.date.getDate()}</div>
                                            <div className="appointment-date-month">
                                                {MONTHS[appointment.date.getMonth()]}
                                            </div>
                                        </div>
                                        <div className="appointment-info">
                                            <div className="appointment-business">{appointment.businessName}</div>
                                            <div className="appointment-service">{appointment.service}</div>
                                            <div className="appointment-meta">
                                                <span>
                                                    <Clock size={14} />
                                                    {appointment.time}
                                                </span>
                                                <span>
                                                    <MapPin size={14} />
                                                    {appointment.location}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`appointment-status ${appointment.status}`}>
                                            {statusLabels[appointment.status]}
                                        </span>
                                        <div className="appointment-actions">
                                            <SecondaryButton size="small" onClick={() => handleViewDetails(appointment)}>
                                                Detaylar
                                            </SecondaryButton>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">
                                        <Calendar size={32} />
                                    </div>
                                    <h3>Yaklaşan randevunuz yok</h3>
                                    <p>Yeni bir randevu oluşturarak başlayın</p>
                                    <PrimaryButton icon={Plus} onClick={handleNewAppointment}>
                                        Randevu Al
                                    </PrimaryButton>
                                </div>
                            )}
                        </div>

                        {/* Favorites */}
                        <div className="appointments-section">
                            <div className="section-header">
                                <h2 className="section-title">Favori İşletmeler</h2>
                                <button className="section-action" onClick={() => setActiveTab('favorites')}>
                                    Tümünü Gör
                                </button>
                            </div>

                            {favorites.length > 0 ? (
                                <div className="favorites-grid">
                                    {favorites.map((fav) => (
                                        <div key={fav.id} className="favorite-card" onClick={() => handleBookAgain(fav.businessId)}>
                                            <div className="favorite-avatar">{fav.initials}</div>
                                            <div className="favorite-name">{fav.name}</div>
                                            <div className="favorite-category">{fav.category}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">
                                        <Heart size={32} />
                                    </div>
                                    <h3>Henüz favori işletmeniz yok</h3>
                                    <p>İşletmeleri favorilere ekleyerek hızlı erişin</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'appointments' && (
                    <>
                        <div className="customer-welcome">
                            <h1>Randevularım</h1>
                            <p>Geçmiş ve yaklaşan tüm randevularınız</p>
                        </div>

                        <div className="appointments-section">
                            <div className="section-header">
                                <h2 className="section-title">Yaklaşan</h2>
                            </div>
                            {upcomingAppointments.length > 0 ? (
                                upcomingAppointments.map((appointment) => (
                                    <div key={appointment.id} className="appointment-card">
                                        <div className="appointment-date">
                                            <div className="appointment-date-day">{appointment.date.getDate()}</div>
                                            <div className="appointment-date-month">
                                                {MONTHS[appointment.date.getMonth()]}
                                            </div>
                                        </div>
                                        <div className="appointment-info">
                                            <div className="appointment-business">{appointment.businessName}</div>
                                            <div className="appointment-service">{appointment.service}</div>
                                            <div className="appointment-meta">
                                                <span>
                                                    <Clock size={14} />
                                                    {appointment.time}
                                                </span>
                                                <span>
                                                    <MapPin size={14} />
                                                    {appointment.location}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`appointment-status ${appointment.status}`}>
                                            {statusLabels[appointment.status]}
                                        </span>
                                        <div className="appointment-actions">
                                            <SecondaryButton size="small" onClick={() => handleCancelClick(appointment)}>
                                                İptal Et
                                            </SecondaryButton>
                                            <PrimaryButton size="small" onClick={() => handleViewDetails(appointment)}>
                                                Detaylar
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state-inline">
                                    <p>Yaklaşan randevunuz bulunmuyor</p>
                                </div>
                            )}
                        </div>

                        <div className="appointments-section">
                            <div className="section-header">
                                <h2 className="section-title">Geçmiş</h2>
                            </div>
                            {pastAppointments.map((appointment) => (
                                <div key={appointment.id} className="appointment-card">
                                    <div className="appointment-date">
                                        <div className="appointment-date-day">{appointment.date.getDate()}</div>
                                        <div className="appointment-date-month">
                                            {MONTHS[appointment.date.getMonth()]}
                                        </div>
                                    </div>
                                    <div className="appointment-info">
                                        <div className="appointment-business">{appointment.businessName}</div>
                                        <div className="appointment-service">{appointment.service}</div>
                                        <div className="appointment-meta">
                                            <span>
                                                <Clock size={14} />
                                                {appointment.time}
                                            </span>
                                            <span>
                                                <MapPin size={14} />
                                                {appointment.location}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`appointment-status ${appointment.status}`}>
                                        {statusLabels[appointment.status]}
                                    </span>
                                    <div className="appointment-actions">
                                        <PrimaryButton size="small" onClick={() => handleBookAgain(appointment.businessId)}>
                                            Tekrar Randevu Al
                                        </PrimaryButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'favorites' && (
                    <>
                        <div className="customer-welcome">
                            <h1>Favori İşletmeler</h1>
                            <p>Sık gittiğiniz ve beğendiğiniz işletmeler</p>
                        </div>

                        {favorites.length > 0 ? (
                            <div className="favorites-grid favorites-grid-large">
                                {favorites.map((fav) => (
                                    <div key={fav.id} className="favorite-card-large">
                                        <div className="favorite-card-header">
                                            <div className="favorite-avatar">{fav.initials}</div>
                                            <button
                                                className="favorite-remove-btn"
                                                onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(fav.id); }}
                                                title="Favorilerden Kaldır"
                                            >
                                                <HeartOff size={18} />
                                            </button>
                                        </div>
                                        <div className="favorite-name">{fav.name}</div>
                                        <div className="favorite-category">{fav.category}</div>
                                        <PrimaryButton size="small" onClick={() => handleBookAgain(fav.businessId)}>
                                            Randevu Al
                                        </PrimaryButton>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    <Heart size={32} />
                                </div>
                                <h3>Henüz favori işletmeniz yok</h3>
                                <p>İşletme sayfalarından favorilere ekleyin</p>
                                <PrimaryButton icon={Home} onClick={handleNewAppointment}>
                                    İşletmeleri Keşfet
                                </PrimaryButton>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'profile' && (
                    <>
                        <div className="customer-welcome">
                            <h1>Profilim</h1>
                            <p>Hesap ayarlarınızı yönetin</p>
                        </div>

                        <div className="profile-card">
                            <div className="profile-header">
                                <div className="profile-avatar">MA</div>
                                <div className="profile-info">
                                    <h2>Mehmet Ali Işık</h2>
                                    <span>Müşteri Hesabı</span>
                                </div>
                                <SecondaryButton icon={Edit2} size="small">
                                    Düzenle
                                </SecondaryButton>
                            </div>

                            <div className="profile-details">
                                <div className="profile-detail-item">
                                    <Phone size={18} />
                                    <div>
                                        <span className="detail-label">Telefon</span>
                                        <span className="detail-value">0532 123 45 67</span>
                                    </div>
                                </div>
                                <div className="profile-detail-item">
                                    <Mail size={18} />
                                    <div>
                                        <span className="detail-label">E-posta</span>
                                        <span className="detail-value">mehmet@email.com</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-stats">
                                <div className="profile-stat">
                                    <strong>{appointments.length}</strong>
                                    <span>Toplam Randevu</span>
                                </div>
                                <div className="profile-stat">
                                    <strong>{favorites.length}</strong>
                                    <span>Favori İşletme</span>
                                </div>
                                <div className="profile-stat">
                                    <strong>{pastAppointments.filter(a => a.status === 'completed').length}</strong>
                                    <span>Tamamlanan</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <SecondaryButton icon={LogOut} onClick={handleLogout}>
                                Çıkış Yap
                            </SecondaryButton>
                        </div>
                    </>
                )}
            </main>

            {/* Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Randevu Detayı"
            >
                {selectedAppointment && (
                    <div className="appointment-detail">
                        <div className="detail-row">
                            <span className="detail-label">İşletme</span>
                            <span className="detail-value">{selectedAppointment.businessName}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Hizmet</span>
                            <span className="detail-value">{selectedAppointment.service}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Tarih</span>
                            <span className="detail-value">{formatFullDate(selectedAppointment.date)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Saat</span>
                            <span className="detail-value">{selectedAppointment.time}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Konum</span>
                            <span className="detail-value">{selectedAppointment.location}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Durum</span>
                            <span className={`appointment-status-badge ${selectedAppointment.status}`}>
                                {statusLabels[selectedAppointment.status]}
                            </span>
                        </div>

                        {selectedAppointment.status === 'upcoming' && (
                            <div className="modal-actions">
                                <SecondaryButton onClick={() => { setShowDetailModal(false); handleCancelClick(selectedAppointment); }}>
                                    Randevuyu İptal Et
                                </SecondaryButton>
                            </div>
                        )}

                        {selectedAppointment.status !== 'upcoming' && (
                            <div className="modal-actions">
                                <PrimaryButton onClick={() => { setShowDetailModal(false); handleBookAgain(selectedAppointment.businessId); }}>
                                    Tekrar Randevu Al
                                </PrimaryButton>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Cancel Confirmation Modal */}
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title="Randevu İptali"
            >
                <div className="cancel-confirmation">
                    <div className="cancel-icon">
                        <Trash2 size={32} />
                    </div>
                    <h3>Randevuyu iptal etmek istediğinize emin misiniz?</h3>
                    <p>Bu işlem geri alınamaz. İptal edilen randevular geçmiş olarak kaydedilir.</p>

                    {selectedAppointment && (
                        <div className="cancel-details">
                            <strong>{selectedAppointment.businessName}</strong>
                            <span>{selectedAppointment.service}</span>
                            <span>{formatFullDate(selectedAppointment.date)} - {selectedAppointment.time}</span>
                        </div>
                    )}

                    <div className="modal-actions">
                        <SecondaryButton onClick={() => setShowCancelModal(false)}>
                            Vazgeç
                        </SecondaryButton>
                        <PrimaryButton onClick={handleConfirmCancel} style={{ background: 'var(--color-error)' }}>
                            Evet, İptal Et
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
