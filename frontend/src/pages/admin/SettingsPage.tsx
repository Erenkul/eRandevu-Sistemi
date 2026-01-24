import React, { useState } from 'react';
import { Save, Building, Clock, Bell, Palette } from 'lucide-react';
import { AdminSidebar } from '../../components/admin';
import { Card } from '../../components/ui';
import './SettingsPage.css';

interface BusinessSettings {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    description: string;
}

interface WorkingHours {
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

interface NotificationSettings {
    emailNotifications: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
    appointmentReminder: boolean;
    reminderHours: number;
    dailyReport: boolean;
}

export const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('business');
    const [saved, setSaved] = useState(false);

    const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
        name: 'eRandevu Berber Salonu',
        address: 'Atatürk Caddesi No: 123, Kadıköy, İstanbul',
        phone: '+90 555 123 4567',
        email: 'info@erandevu.com',
        website: 'www.erandevu.com',
        description: 'Modern ve profesyonel berber hizmetleri'
    });

    const [workingHours, setWorkingHours] = useState<WorkingHours[]>([
        { day: 'Pazartesi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
        { day: 'Salı', isOpen: true, openTime: '09:00', closeTime: '19:00' },
        { day: 'Çarşamba', isOpen: true, openTime: '09:00', closeTime: '19:00' },
        { day: 'Perşembe', isOpen: true, openTime: '09:00', closeTime: '19:00' },
        { day: 'Cuma', isOpen: true, openTime: '09:00', closeTime: '19:00' },
        { day: 'Cumartesi', isOpen: true, openTime: '10:00', closeTime: '18:00' },
        { day: 'Pazar', isOpen: false, openTime: '10:00', closeTime: '16:00' }
    ]);

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        emailNotifications: true,
        smsNotifications: true,
        whatsappNotifications: true,
        appointmentReminder: true,
        reminderHours: 24,
        dailyReport: true
    });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const updateWorkingHours = (index: number, field: keyof WorkingHours, value: string | boolean) => {
        const updated = [...workingHours];
        updated[index] = { ...updated[index], [field]: value };
        setWorkingHours(updated);
    };

    const tabs = [
        { id: 'business', label: 'İşletme Bilgileri', icon: Building },
        { id: 'hours', label: 'Çalışma Saatleri', icon: Clock },
        { id: 'notifications', label: 'Bildirimler', icon: Bell },
        { id: 'appearance', label: 'Görünüm', icon: Palette },
    ];

    return (
        <div className="admin-dashboard">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-title">
                        <h1>Ayarlar</h1>
                        <p>İşletme ayarlarını düzenleyin</p>
                    </div>

                    <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
                        <Save size={18} />
                        {saved ? 'Kaydedildi!' : 'Kaydet'}
                    </button>
                </header>

                <div className="admin-content">
                    <div className="settings-layout">
                        {/* Settings Tabs */}
                        <div className="settings-tabs">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Settings Content */}
                        <div className="settings-content">
                            {/* Business Settings */}
                            {activeTab === 'business' && (
                                <Card className="settings-card">
                                    <h3>İşletme Bilgileri</h3>
                                    <p className="settings-description">
                                        İşletmenizin temel bilgilerini güncelleyin
                                    </p>

                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label>İşletme Adı</label>
                                            <input
                                                type="text"
                                                value={businessSettings.name}
                                                onChange={e => setBusinessSettings({ ...businessSettings, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Adres</label>
                                            <input
                                                type="text"
                                                value={businessSettings.address}
                                                onChange={e => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Telefon</label>
                                                <input
                                                    type="tel"
                                                    value={businessSettings.phone}
                                                    onChange={e => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>E-posta</label>
                                                <input
                                                    type="email"
                                                    value={businessSettings.email}
                                                    onChange={e => setBusinessSettings({ ...businessSettings, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Website</label>
                                            <input
                                                type="url"
                                                value={businessSettings.website}
                                                onChange={e => setBusinessSettings({ ...businessSettings, website: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Açıklama</label>
                                            <textarea
                                                value={businessSettings.description}
                                                onChange={e => setBusinessSettings({ ...businessSettings, description: e.target.value })}
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Working Hours */}
                            {activeTab === 'hours' && (
                                <Card className="settings-card">
                                    <h3>Çalışma Saatleri</h3>
                                    <p className="settings-description">
                                        Haftalık çalışma saatlerinizi belirleyin
                                    </p>

                                    <div className="working-hours-list">
                                        {workingHours.map((hours, index) => (
                                            <div key={hours.day} className="working-hours-item">
                                                <div className="day-toggle">
                                                    <label className="toggle-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={hours.isOpen}
                                                            onChange={e => updateWorkingHours(index, 'isOpen', e.target.checked)}
                                                        />
                                                        <span className="toggle-slider"></span>
                                                    </label>
                                                    <span className={`day-name ${!hours.isOpen ? 'closed' : ''}`}>
                                                        {hours.day}
                                                    </span>
                                                </div>

                                                {hours.isOpen ? (
                                                    <div className="hours-inputs">
                                                        <input
                                                            type="time"
                                                            value={hours.openTime}
                                                            onChange={e => updateWorkingHours(index, 'openTime', e.target.value)}
                                                        />
                                                        <span className="hours-separator">-</span>
                                                        <input
                                                            type="time"
                                                            value={hours.closeTime}
                                                            onChange={e => updateWorkingHours(index, 'closeTime', e.target.value)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="closed-label">Kapalı</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Notifications */}
                            {activeTab === 'notifications' && (
                                <Card className="settings-card">
                                    <h3>Bildirim Ayarları</h3>
                                    <p className="settings-description">
                                        Bildirim tercihlerinizi yönetin
                                    </p>

                                    <div className="notification-settings">
                                        <div className="notification-group">
                                            <h4>Bildirim Kanalları</h4>

                                            <div className="notification-item">
                                                <div className="notification-info">
                                                    <span className="notification-title">E-posta Bildirimleri</span>
                                                    <span className="notification-desc">Randevu bildirimleri e-posta ile gönderilsin</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.emailNotifications}
                                                        onChange={e => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>

                                            <div className="notification-item">
                                                <div className="notification-info">
                                                    <span className="notification-title">SMS Bildirimleri</span>
                                                    <span className="notification-desc">Randevu bildirimleri SMS ile gönderilsin</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.smsNotifications}
                                                        onChange={e => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>

                                            <div className="notification-item">
                                                <div className="notification-info">
                                                    <span className="notification-title">WhatsApp Bildirimleri</span>
                                                    <span className="notification-desc">Randevu bildirimleri WhatsApp ile gönderilsin</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.whatsappNotifications}
                                                        onChange={e => setNotificationSettings({ ...notificationSettings, whatsappNotifications: e.target.checked })}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="notification-group">
                                            <h4>Hatırlatıcılar</h4>

                                            <div className="notification-item">
                                                <div className="notification-info">
                                                    <span className="notification-title">Randevu Hatırlatıcısı</span>
                                                    <span className="notification-desc">Müşterilere randevudan önce hatırlatma gönder</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.appointmentReminder}
                                                        onChange={e => setNotificationSettings({ ...notificationSettings, appointmentReminder: e.target.checked })}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>

                                            {notificationSettings.appointmentReminder && (
                                                <div className="reminder-timing">
                                                    <label>Hatırlatma zamanı</label>
                                                    <select
                                                        value={notificationSettings.reminderHours}
                                                        onChange={e => setNotificationSettings({ ...notificationSettings, reminderHours: parseInt(e.target.value) })}
                                                    >
                                                        <option value={1}>1 saat önce</option>
                                                        <option value={2}>2 saat önce</option>
                                                        <option value={4}>4 saat önce</option>
                                                        <option value={24}>1 gün önce</option>
                                                        <option value={48}>2 gün önce</option>
                                                    </select>
                                                </div>
                                            )}

                                            <div className="notification-item">
                                                <div className="notification-info">
                                                    <span className="notification-title">Günlük Rapor</span>
                                                    <span className="notification-desc">Her gün sonunda özet rapor gönder</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.dailyReport}
                                                        onChange={e => setNotificationSettings({ ...notificationSettings, dailyReport: e.target.checked })}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Appearance */}
                            {activeTab === 'appearance' && (
                                <Card className="settings-card">
                                    <h3>Görünüm Ayarları</h3>
                                    <p className="settings-description">
                                        Tema ve görünüm tercihlerinizi özelleştirin
                                    </p>

                                    <div className="appearance-settings">
                                        <div className="theme-selector">
                                            <h4>Tema</h4>
                                            <div className="theme-options">
                                                <button className="theme-option active">
                                                    <div className="theme-preview light"></div>
                                                    <span>Açık</span>
                                                </button>
                                                <button className="theme-option">
                                                    <div className="theme-preview dark"></div>
                                                    <span>Koyu</span>
                                                </button>
                                                <button className="theme-option">
                                                    <div className="theme-preview auto"></div>
                                                    <span>Otomatik</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="color-selector">
                                            <h4>Renk Paleti</h4>
                                            <div className="color-options">
                                                <button className="color-option active" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}></button>
                                                <button className="color-option" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}></button>
                                                <button className="color-option" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}></button>
                                                <button className="color-option" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}></button>
                                                <button className="color-option" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}></button>
                                                <button className="color-option" style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}></button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
