import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
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
import { PrimaryButton, SecondaryButton, Input } from '../components/ui';
import './CustomerDashboard.css';
import { useAuth, useToast } from '../contexts';
import { useCustomerAppointments } from '../hooks';
import { updateAppointmentStatus } from '../services/firestore';
import type { Appointment } from '../types';

type TabType = 'home' | 'appointments' | 'favorites' | 'profile';

interface Favorite {
    id: string;
    name: string;
    category: string;
    initials: string;
    businessId: string;
}

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const statusLabels: Record<string, string> = {
    upcoming: 'Yaklaşan',
    pending: 'Bekliyor',
    confirmed: 'Onaylandı',
    inProgress: 'Devam Ediyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
    noShow: 'Gelmedi',
};

const getStatusGroup = (status: string): 'upcoming' | 'completed' | 'cancelled' | 'past' => {
    if (status === 'pending' || status === 'confirmed' || status === 'inProgress') return 'upcoming';
    if (status === 'completed') return 'completed';
    if (status === 'cancelled' || status === 'noShow') return 'cancelled';
    return 'past';
};

// Helper: get initials from a name
function getInitials(name?: string): string {
    if (!name) return '?';
    return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

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
    const { user, logout, updateUserProfile } = useAuth();
    const { showToast } = useToast();

    // Fetch real appointments using the user's phone number
    const { data: rawAppointments, loading: appointmentsLoading, refetch } = useCustomerAppointments(user?.phoneNumber);

    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('home');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [editProfileData, setEditProfileData] = useState({ displayName: '', phoneNumber: '' });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    useEffect(() => {
        if (user) {
            setEditProfileData({
                displayName: user.displayName || '',
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user, showEditProfileModal]);

    const handleUpdateProfile = async () => {
        try {
            setIsUpdatingProfile(true);
            await updateUserProfile({
                displayName: editProfileData.displayName,
                phoneNumber: editProfileData.phoneNumber
            });
            setShowEditProfileModal(false);
            showToast('Profil başarıyla güncellendi', 'success');
        } catch (error) {
            console.error('Profil güncellenirken hata:', error);
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    // Derived lists
    const upcomingAppointments = useMemo(() =>
        rawAppointments.filter(a => getStatusGroup(a.status) === 'upcoming'),
        [rawAppointments]
    );
    const pastAppointments = useMemo(() =>
        rawAppointments.filter(a => getStatusGroup(a.status) !== 'upcoming'),
        [rawAppointments]
    );

    const handleNewAppointment = () => navigate('/');
    const handleBookAgain = (businessId: string) => navigate(`/book/${businessId}`);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleGoHome = () => navigate('/');

    const handleViewDetails = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailModal(true);
    };

    const handleCancelClick = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        if (!selectedAppointment) return;
        try {
            setIsCancelling(true);
            await updateAppointmentStatus(selectedAppointment.id, 'cancelled', 'Müşteri tarafından iptal edildi.');
            setShowCancelModal(false);
            setSelectedAppointment(null);
            showToast('Randevu başarıyla iptal edildi', 'success');
            refetch();
        } catch (err) {
            console.error('İptal hatası:', err);
            showToast('Randevu iptal edilemedi', 'error');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleRemoveFavorite = (favoriteId: string) => {
        setFavorites(favorites.filter(f => f.id !== favoriteId));
    };

    // Format appointment date for display
    const formatAppointmentDate = (appointment: Appointment) => {
        const date = appointment.dateTime.toDate();
        return { day: date.getDate(), month: MONTHS[date.getMonth()] };
    };

    const formatAppointmentTime = (appointment: Appointment) => {
        const date = appointment.dateTime.toDate();
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatFullDate = (appointment: Appointment) => {
        const date = appointment.dateTime.toDate();
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${days[date.getDay()]}`;
    };

    const userInitials = getInitials(user?.displayName);

    const renderAppointmentCard = (appointment: Appointment, showCancel = false) => {
        const { day, month } = formatAppointmentDate(appointment);
        const time = formatAppointmentTime(appointment);
        const serviceNames = appointment.services.map(s => s.serviceName).join(', ');
        const isUpcoming = getStatusGroup(appointment.status) === 'upcoming';

        return (
            <div key={appointment.id} className="appointment-card">
                <div className="appointment-date">
                    <div className="appointment-date-day">{day}</div>
                    <div className="appointment-date-month">{month}</div>
                </div>
                <div className="appointment-info">
                    <div className="appointment-business">{appointment.staffName}</div>
                    <div className="appointment-service">{serviceNames}</div>
                    <div className="appointment-meta">
                        <span>
                            <Clock size={14} />
                            {time}
                        </span>
                    </div>
                </div>
                <span className={`appointment-status ${appointment.status}`}>
                    {statusLabels[appointment.status] || appointment.status}
                </span>
                <div className="appointment-actions">
                    {showCancel && isUpcoming && (
                        <SecondaryButton size="small" onClick={() => handleCancelClick(appointment)}>
                            İptal Et
                        </SecondaryButton>
                    )}
                    <PrimaryButton size="small" onClick={() => handleViewDetails(appointment)}>
                        Detaylar
                    </PrimaryButton>
                </div>
            </div>
        );
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
                    <div className="customer-user-avatar">{userInitials}</div>
                </div>
            </header>

            {/* Content */}
            <main className="customer-content">
                {activeTab === 'home' && (
                    <>
                        {/* Welcome */}
                        <div className="customer-welcome">
                            <h1>Merhaba, {user?.displayName?.split(' ')[0] || 'Hoş geldiniz'}! 👋</h1>
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
                                    <p>
                                        {appointmentsLoading
                                            ? 'Yükleniyor...'
                                            : `${upcomingAppointments.length} yaklaşan randevunuz var`}
                                    </p>
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

                            {appointmentsLoading ? (
                                <div className="empty-state-inline"><p>Yükleniyor...</p></div>
                            ) : upcomingAppointments.length > 0 ? (
                                upcomingAppointments.slice(0, 3).map(a => renderAppointmentCard(a, false))
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
                            {appointmentsLoading ? (
                                <div className="empty-state-inline"><p>Yükleniyor...</p></div>
                            ) : upcomingAppointments.length > 0 ? (
                                upcomingAppointments.map(a => renderAppointmentCard(a, true))
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
                            {pastAppointments.length > 0 ? (
                                pastAppointments.map((appointment) => {
                                    const { day, month } = formatAppointmentDate(appointment);
                                    const time = formatAppointmentTime(appointment);
                                    const serviceNames = appointment.services.map(s => s.serviceName).join(', ');
                                    return (
                                        <div key={appointment.id} className="appointment-card">
                                            <div className="appointment-date">
                                                <div className="appointment-date-day">{day}</div>
                                                <div className="appointment-date-month">{month}</div>
                                            </div>
                                            <div className="appointment-info">
                                                <div className="appointment-business">{appointment.staffName}</div>
                                                <div className="appointment-service">{serviceNames}</div>
                                                <div className="appointment-meta">
                                                    <span><Clock size={14} />{time}</span>
                                                </div>
                                            </div>
                                            <span className={`appointment-status ${appointment.status}`}>
                                                {statusLabels[appointment.status] || appointment.status}
                                            </span>
                                            <div className="appointment-actions">
                                                <PrimaryButton size="small" onClick={() => handleBookAgain(appointment.businessId)}>
                                                    Tekrar Randevu Al
                                                </PrimaryButton>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="empty-state-inline">
                                    <p>Geçmiş randevunuz bulunmuyor</p>
                                </div>
                            )}
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
                                <div className="profile-avatar">{userInitials}</div>
                                <div className="profile-info">
                                    <h2>{user?.displayName || 'İsimsiz Kullanıcı'}</h2>
                                    <span>Müşteri Hesabı</span>
                                </div>
                                <SecondaryButton icon={Edit2} size="small" onClick={() => setShowEditProfileModal(true)}>
                                    Düzenle
                                </SecondaryButton>
                            </div>

                            <div className="profile-details">
                                {user?.phoneNumber && (
                                    <div className="profile-detail-item">
                                        <Phone size={18} />
                                        <div>
                                            <span className="detail-label">Telefon</span>
                                            <span className="detail-value">{user.phoneNumber}</span>
                                        </div>
                                    </div>
                                )}
                                {user?.email && (
                                    <div className="profile-detail-item">
                                        <Mail size={18} />
                                        <div>
                                            <span className="detail-label">E-posta</span>
                                            <span className="detail-value">{user.email}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="profile-stats">
                                <div className="profile-stat">
                                    <strong>{rawAppointments.length}</strong>
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
                            <span className="detail-label">Personel</span>
                            <span className="detail-value">{selectedAppointment.staffName}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Hizmet</span>
                            <span className="detail-value">{selectedAppointment.services.map(s => s.serviceName).join(', ')}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Tarih</span>
                            <span className="detail-value">{formatFullDate(selectedAppointment)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Saat</span>
                            <span className="detail-value">{formatAppointmentTime(selectedAppointment)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Toplam</span>
                            <span className="detail-value">₺{selectedAppointment.totalPrice}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Durum</span>
                            <span className={`appointment-status-badge ${selectedAppointment.status}`}>
                                {statusLabels[selectedAppointment.status] || selectedAppointment.status}
                            </span>
                        </div>

                        {getStatusGroup(selectedAppointment.status) === 'upcoming' && (
                            <div className="modal-actions">
                                <SecondaryButton onClick={() => { setShowDetailModal(false); handleCancelClick(selectedAppointment); }}>
                                    Randevuyu İptal Et
                                </SecondaryButton>
                            </div>
                        )}

                        {getStatusGroup(selectedAppointment.status) !== 'upcoming' && (
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
                onClose={() => !isCancelling && setShowCancelModal(false)}
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
                            <strong>{selectedAppointment.staffName}</strong>
                            <span>{selectedAppointment.services.map(s => s.serviceName).join(', ')}</span>
                            <span>{formatFullDate(selectedAppointment)} - {formatAppointmentTime(selectedAppointment)}</span>
                        </div>
                    )}

                    <div className="modal-actions">
                        <SecondaryButton onClick={() => setShowCancelModal(false)} disabled={isCancelling}>
                            Vazgeç
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={handleConfirmCancel}
                            disabled={isCancelling}
                            style={{ background: 'var(--color-error)' }}
                        >
                            {isCancelling ? 'İptal ediliyor...' : 'Evet, İptal Et'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal
                isOpen={showEditProfileModal}
                onClose={() => !isUpdatingProfile && setShowEditProfileModal(false)}
                title="Profili Düzenle"
            >
                <div className="edit-profile-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Input
                        label="Ad Soyad"
                        value={editProfileData.displayName}
                        onChange={(e) => setEditProfileData({ ...editProfileData, displayName: e.target.value })}
                        disabled={isUpdatingProfile}
                        placeholder="Adınız ve Soyadınız"
                    />
                    <Input
                        label="Telefon Numarası"
                        value={editProfileData.phoneNumber}
                        onChange={(e) => setEditProfileData({ ...editProfileData, phoneNumber: e.target.value })}
                        disabled={isUpdatingProfile}
                        placeholder="5XX XXX XX XX"
                    />
                    <div className="modal-actions" style={{ marginTop: '8px' }}>
                        <SecondaryButton onClick={() => setShowEditProfileModal(false)} disabled={isUpdatingProfile}>
                            İptal
                        </SecondaryButton>
                        <PrimaryButton onClick={handleUpdateProfile} disabled={isUpdatingProfile || !editProfileData.displayName.trim()}>
                            {isUpdatingProfile ? 'Kaydediliyor...' : 'Kaydet'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
